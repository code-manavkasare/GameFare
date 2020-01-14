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
import {historicSearchAction} from '../../../actions/historicSearchActions';
import {messageAction} from '../../../actions/messageActions';
import {Col, Row, Grid} from 'react-native-easy-grid';
import NavigationService from '../../../../NavigationService';
import firebase from 'react-native-firebase';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import ButtonColor from '../../layout/Views/Button';

import AsyncImage from '../../layout/image/AsyncImage';
import AllIcons from '../../layout/icons/AllIcons';

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
    var lastMessage = await firebase
      .database()
      .ref('discussions/' + this.props.discussion.objectID + '/messages')
      .limitToLast(1)
      .once('value');
    lastMessage = lastMessage.val();

    if (!lastMessage) lastMessage = [{text: 'Write the first message'}];
    else lastMessage = Object.values(lastMessage)[0];

    await this.props.messageAction('setConversation', {
      ...this.props.discussion,
      lastMessage: lastMessage,
      lastMessageRead: !this.props.conversations[this.props.discussion.objectID]
        ? false
        : lastMessage.text ===
          this.props.conversations[this.props.discussion.objectID].lastMessage
            .text
        ? true
        : false,
    });
    return this.setState({lastMessage: lastMessage});
  }

  imageCard(conversation) {
    if (this.props.discussion.type === 'group') {
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
  lastMessage() {
    const discussion = this.props.conversations[this.props.discussion.objectID];
    // return null;
    if (!discussion) return <View style={styles.placeholderLastMessage} />;
    console.log('discussion.lastMessage.text', discussion.lastMessage.text);
    return (
      <Text
        style={[
          !this.checkLastMessageRead() ? styleApp.input : styleApp.smallText,
          {fontSize: 13, marginTop: 2, color: colors.title},
        ]}>
        {discussion.lastMessage.text === '' && discussion.lastMessage.images
          ? Object.values(discussion.lastMessage.images).length + ' file sent'
          : !discussion.lastMessage.text
          ? 'Send the first message.'
          : discussion.lastMessage.text}
      </Text>
    );
  }
  checkLastMessageRead() {
    console.log(
      'checkLastMessageRead',
      this.props.conversations[this.props.discussion.objectID],
    );
    if (!this.props.conversations[this.props.discussion.objectID]) return false;
    return this.props.conversations[this.props.discussion.objectID]
      .lastMessageRead;
  }

  cardConversation(conversation, i) {
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
                {this.lastMessage()}
              </Col>
              <Col size={5} style={styleApp.center2}>
                {!this.checkLastMessageRead() && (
                  <View style={styles.dotUnread} />
                )}
              </Col>
            </Row>
          );
        }}
        click={() => {
          this.props.messageAction('setConversation', {
            ...this.props.discussion,
            lastMessageRead: true,
            lastMessage: this.state.lastMessage,
          });
          NavigationService.push('Conversation', {
            data: conversation,
          });
        }}
        color="white"
        style={styleApp.cardConversation}
        onPressColor={colors.off}
      />
    );
  }
  render() {
    return this.cardConversation(this.props.discussion, this.props.index);
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
});

export default connect(mapStateToProps, {historicSearchAction, messageAction})(
  CardConversation,
);
