import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row, Grid} from 'react-native-easy-grid';
import moment from 'moment';
import firebase from 'react-native-firebase';
import isEqual from 'lodash.isequal';

import {historicSearchAction} from '../../../actions/historicSearchActions';
import {messageAction} from '../../../actions/messageActions';
import NavigationService from '../../../../NavigationService';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import ButtonColor from '../../layout/Views/Button';

import ImageConversation from '../../layout/image/ImageConversation';
import {checkMessageRead, titleConversation} from '../../functions/message';

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
    let conversation = this.props.conversations[this.props.discussionID];
    if (!conversation) conversation = this.props.discussion;
    const {gamefareUser} = this.props;
    let {lastMessage} = conversation;

    if (!lastMessage)
      lastMessage = {
        user: gamefareUser,
        text: 'Write the first message.',
        createdAt: new Date(),
        id: 'noMessage',
        timeStamp: moment().valueOf(),
      };

    return this.setState({lastMessage: lastMessage});
  }
  componentWillReceiveProps(nextProps) {
    const conversation = this.props.conversations[this.props.discussionID];
    const conversationNext = nextProps.conversations[nextProps.discussionID];
    if (
      !isEqual(conversation, conversationNext) &&
      conversationNext.lastMessage
    )
      return this.setState({
        lastMessage: conversationNext.lastMessage,
      });
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
    console.log('conversation', conversation);
    // return;
    if (this.props.myConversation && lastMessage.id !== 'noMessage') {
      await firebase
        .database()
        .ref(
          'discussions/' +
            conversation.objectID +
            '/messages/' +
            lastMessage.id +
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
                <ImageConversation
                  conversation={conversation}
                  userID={this.props.userID}
                  style={styles.roundImage}
                  sizeSmallImg={35}
                />
              </Col>
              <Col
                size={60}
                style={[styleApp.center2, {paddingLeft: 5, paddingRight: 5}]}>
                <Text style={[styleApp.text, {fontSize: 18}]}>
                  {titleConversation(conversation, this.props.userID)}
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
    let conversation = this.props.conversations[this.props.discussionID];

    if (!conversation) conversation = this.props.discussion;
    if (!conversation) return null;
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
    gamefareUser: state.message.gamefareUser,
  };
};

const styles = StyleSheet.create({
  roundImage: {
    ...styleApp.center,
    backgroundColor: colors.off2,
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 0,
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
