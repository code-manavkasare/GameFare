import React from 'react';
import {
  View,
  Text,
  Dimensions,
  Image,
  ScrollView,
  Animated,
  StyleSheet,
} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row, Grid} from 'react-native-easy-grid';
import firebase from 'react-native-firebase';
import isEqual from 'lodash.isequal';

import {historicSearchAction} from '../../../actions/historicSearchActions';
import {messageAction} from '../../../actions/messageActions';
import NavigationService from '../../../../NavigationService';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import ButtonColor from '../../layout/Views/Button';

import AsyncImage from '../../layout/image/AsyncImage';
import {checkMessageRead} from '../../functions/message';

import Reactotron from 'reactotron-react-native';
import Conversation from './Conversation';

class CardConversation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      loader: false,
      lastMessage: null,
    };
  }
  async componentDidMount() {
    let lastMessage = await firebase
      .database()
      .ref('discussions/' + this.props.discussion.objectID + '/messages')
      .limitToLast(1)
      .once('value');

    lastMessage = lastMessage.val();
    if (!lastMessage)
      lastMessage = {noMessage: {text: 'Write the first message.'}};

    let idLastMessage = Object.keys(lastMessage)[0];
    lastMessage = Object.values(lastMessage)[0];
    lastMessage._id = idLastMessage;

    if (this.props.myConversation) {
      await this.props.messageAction('setConversation', {
        ...this.props.discussion,
        lastMessage: lastMessage,
      });
    }

    return this.setState({lastMessage: lastMessage});
  }
  componentWillReceiveProps(nextProps) {
    console.log('nextProps', nextProps);
    if (!isEqual(this.props.discussion !== nextProps.discussion))
      return this.setState({
        lastMessage: nextProps.discussion.lastMessage,
      });
  }

  imageCard(conversation) {
    if (conversation.type === 'group') {
      return (
        <AsyncImage
          style={styles.roundImage}
          mainImage={conversation.image}
          imgInitial={conversation.image}
        />
      );
    }
    if (this.infoOtherMember(conversation).picture) {
      return (
        <AsyncImage
          style={styles.roundImage}
          mainImage={this.infoOtherMember(conversation).picture}
          imgInitial={this.infoOtherMember(conversation).picture}
        />
      );
    }
    return (
      <View style={styles.roundImage}>
        {this.infoOtherMember(conversation).firstname ? (
          <Text style={[styleApp.text, {fontSize: 13}]}>
            {this.infoOtherMember(conversation).firstname[0] +
              this.infoOtherMember(conversation).lastname[0]}
          </Text>
        ) : (
          <Text style={[styleApp.text, {fontSize: 13}]}>GF</Text>
        )}
      </View>
    );
  }
  infoOtherMember(conversation) {
    if (
      Object.values(conversation.members).filter(
        (user) => user.id !== this.props.userID,
      ).length === 0
    )
      return Object.values(conversation.members)[0].info;
    return Object.values(conversation.members).filter(
      (user) => user.id !== this.props.userID,
    )[0].info;
  }
  titleConversation(conversation) {
    if (conversation.type === 'group') return conversation.title;
    return (
      this.infoOtherMember(conversation).firstname +
      ' ' +
      this.infoOtherMember(conversation).lastname
    );
  }
  lastMessage(lastMessage) {
    if (!lastMessage) return <View style={styles.placeholderLastMessage} />;
    else if (!lastMessage)
      return <View style={styles.placeholderLastMessage} />;

    return (
      <Text
        style={[
          !checkMessageRead(lastMessage, this.props.userID)
            ? styleApp.input
            : styleApp.smallText,
          styles.textUnread,
        ]}>
        {lastMessage.text === '' && lastMessage.images
          ? Object.values(lastMessage.images).length + ' file sent'
          : !lastMessage.text
          ? 'Send the first message.'
          : lastMessage.text}
      </Text>
    );
  }

  async clickCard(conversation, lastMessage) {
    if (!this.props.myConversation || lastMessage._id !== 'noMessage') {
      await firebase
        .database()
        .ref(
          'discussions/' +
            conversation.objectID +
            '/messages/' +
            lastMessage._id +
            '/usersRead/',
        )
        .update({[this.props.userID]: true});
    }
    NavigationService.push('Conversation', {
      data: conversation,
      myConversation: this.props.myConversation,
    });
  }
  cardConversation(conversation, lastMessage, i) {
    return (
      <ButtonColor
        key={i}
        view={() => {
          return (
            <Row>
              <Col size={20} style={styleApp.center2}>
                {this.imageCard(conversation)}
              </Col>
              <Col size={60} style={[styleApp.center2, {paddingLeft: 5}]}>
                <Text style={[styleApp.text, {fontSize: 18}]}>
                  {this.titleConversation(conversation)}
                </Text>
                {this.lastMessage(lastMessage)}
              </Col>
              <Col size={5} style={styleApp.center2}>
                {!checkMessageRead(lastMessage, this.props.userID) && (
                  <View style={styles.dotUnread} />
                )}
              </Col>
            </Row>
          );
        }}
        click={() => this.clickCard(conversation, lastMessage)}
        color="white"
        style={styleApp.cardConversation}
        onPressColor={colors.off}
      />
    );
  }
  render() {
    const conversation = this.props.conversations[
      this.props.discussion.objectID
    ];
    const {lastMessage} = this.state;
    return this.cardConversation(
      conversation ? conversation : this.props.discussion,
      lastMessage,
      this.props.index,
    );
  }
}

const mapStateToProps = (state) => {
  return {
    conversations: state.message.conversations,
    userID: state.user.userID,
  };
};

const styles = StyleSheet.create({
  roundImage: {
    ...styleApp.center,
    backgroundColor: colors.off2,
    width: 55,
    height: 55,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: colors.borderColor,
  },
  dotUnread: {
    backgroundColor: colors.blue,
    height: 15,
    width: 15,
    borderRadius: 10,
  },
  placeholderLastMessage: {
    height: 15,
    width: '80%',
    borderRadius: 4,
    marginTop: 4,
    backgroundColor: colors.off2,
  },
  textUnread: {fontSize: 13, marginTop: 2, color: colors.title},
});

export default connect(mapStateToProps, {historicSearchAction, messageAction})(
  CardConversation,
);
