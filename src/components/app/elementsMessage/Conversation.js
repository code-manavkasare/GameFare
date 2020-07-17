import React from 'react';
import {View, Animated} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import moment from 'moment';

import {messageAction} from '../../../actions/messageActions';

import Conversation2 from './Conversation2';

import {indexDiscussions} from '../../database/algolia';
import {userObject} from '../../functions/users';

import HeaderConversation from './HeaderConversation';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';

class MessageTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      messages: [],
      conversation: {},
    };
    this.inputValue = '';
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    const {route, userID} = this.props;
    const {data: dataEvent, myConversation} = route.params;
    this.loadMessages(dataEvent, myConversation, userID);
  }
  componentWillUnmount() {
    const {route} = this.props;
    const {data: dataEvent} = route.params;
    database()
      .ref('discussions/' + dataEvent.objectID)
      .off();
  }
  async loadMessages(conversation, myConversation, userID) {
    if (!conversation.objectID) {
      conversation = await indexDiscussions.getObject(conversation);
    }
    if (!conversation) {
      const {route, userID} = this.props;
      const {data: dataEvent, myConversation} = route.params;
      return this.loadMessages(dataEvent, myConversation, userID);
    }
    const {gamefareUser} = this.props;
    const that = this;
    database()
      .ref('discussions/' + conversation.objectID)
      .on('value', async function(snap) {
        let discussion = snap.val();
        delete discussion.members[userID];
        let messages = discussion.messages;
        if (!messages)
          messages = {
            noMessage: {
              user: gamefareUser,
              text: 'Write the first message.',
              createdAt: new Date(),
              id: 'noMessage',
              timeStamp: moment().valueOf(),
            },
          };
        messages = Object.keys(messages)
          .map((id) => ({
            id,
            ...messages[id],
          }))
          .sort((a, b) => a.timeStamp - b.timeStamp)
          .reverse();

        that.setState({
          messages: messages,
          loader: false,
          conversation: {...discussion, objectID: conversation.objectID},
        });

        let lastMessage = Object.values(messages)[0];
        let usersRead = lastMessage.usersRead;
        if (!usersRead) usersRead = {};
        usersRead = {
          ...usersRead,
          [userID]: true,
        };
        lastMessage.usersRead = usersRead;

        lastMessage.length > 50 ? '...' : '';
        if (myConversation || lastMessage.user.id === userID) {
          that.setConversation({
            ...conversation,
            lastMessage: {
              ...lastMessage,
              text:
                lastMessage.text.slice(0, 50) +
                (lastMessage.text.length > 50 ? '...' : ''),
            },
          });
        }
      });
  }
  async setConversation(data) {
    await this.props.messageAction('setConversation', data);
  }

  render() {
    const {infoUser, userID, navigation, route} = this.props;
    const {back, message} = route.params;
    const {conversation, loader} = this.state;
    const user = userObject(infoUser, userID);

    return (
      <View style={styleApp.stylePage}>
        <HeaderConversation
          conversation={conversation}
          navigation={navigation}
          userID={userID}
          loader={loader}
          back={back}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
        />
        <View style={{height: sizes.heightHeaderHome}} />

        <Conversation2
          navigation={navigation}
          messages={this.state.messages}
          user={user}
          onRef={(ref) => (this.conversationRef = ref)}
          messageAction={this.props.messageAction}
          initialMessage={message ? message : ''}
          discussion={conversation}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    gamefareUser: state.message.gamefareUser,
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    infoUser: state.user.infoUser.userInfo,
  };
};

export default connect(
  mapStateToProps,
  {messageAction},
)(MessageTab);
