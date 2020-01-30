import React from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import firebase from 'react-native-firebase';
import moment from 'moment';

import {messageAction} from '../../../actions/messageActions';
import Conversation2 from './Conversation2';

import {titleConversation} from '../../functions/message';
import {userObject} from '../../functions/users';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';
import ImageConversation from '../../layout/image/ImageConversation';

class MessageTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      messages: [],
    };
    this.inputValue = '';
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    this.loadMessages(
      this.props.navigation.getParam('data'),
      this.props.navigation.getParam('myConversation'),
      this.props.userID,
    );
  }
  componentWillUnmount() {
    firebase
      .database()
      .ref('discussions/' + this.props.navigation.getParam('data').objectID)
      .off();
  }
  async loadMessages(conversation, myConversation, userID) {
    const {gamefareUser} = this.props
    const that = this;
    firebase
      .database()
      .ref('discussions/' + conversation.objectID)
      .on('value', async function(snap) {
        const discussion = snap.val();
        let messages = discussion.messages;
        if (!messages)
          messages = {
            noMessage: {
              user: gamefareUser,
              text: 'Write the first message.',
              createdAt: new Date(),
              timeStamp: moment().valueOf(),
            },
          };
        console.log('whouoooohoo messages',messages)
        messages = Object.keys(messages)
          .map((_id) => ({
            _id,
            ...messages[_id],
          }))
          .sort((a, b) => a.timeStamp - b.timeStamp)
          .reverse();
        that.setState({messages: messages, loader: false});

        let lastMessage = Object.values(messages)[0];
        let usersRead = lastMessage.usersRead;
        if (!usersRead) usersRead = {};
        usersRead = {
          ...usersRead,
          [userID]: true,
        };
        lastMessage.usersRead = usersRead;
        if (myConversation || lastMessage.user.id === userID) {
          that.setConversation({
            ...conversation,
            lastMessage: lastMessage,
          });
        }
      });
  }
  setConversation(data) {
    this.props.messageAction('setConversation', data);
  }
  render() {
    const {infoUser, userID, userConnected} = this.props;
    const user = userObject(infoUser, userID);
    const conversation = this.props.navigation.getParam('data');

    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={titleConversation(conversation, userID)}
          imgHeader={
            <ImageConversation
              conversation={conversation}
              userID={userID}
              style={styleApp.roundView2}
              sizeSmallImg={25}
            />
          }
          inputRange={[50, 80]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          typeIcon2={'mat'}
          initialBorderWidth={0.3}
          initialBorderColorHeader={colors.borderColor}
          sizeIcon2={17}
          initialTitleOpacity={1}
          icon1={'arrow-left'}
          icon2={null}
          clickButton1={async () => {
            this.props.navigation.dismiss();
          }}
          clickButton2={() => true}
        />
        <View style={{height: sizes.heightHeaderHome}} />

        <Conversation2
          messages={this.state.messages}
          user={user}
          onRef={(ref) => (this.conversationRef = ref)}
          messageAction={this.props.messageAction}
          userConnected={userConnected}
          discussion={conversation}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    gamefareUser: state.message.gamefareUser,
    conversations: state.message.conversation,
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    infoUser: state.user.infoUser.userInfo,
  };
};

export default connect(mapStateToProps, {messageAction})(MessageTab);
