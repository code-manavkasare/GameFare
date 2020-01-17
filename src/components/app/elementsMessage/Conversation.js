import React from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import {messageAction} from '../../../actions/messageActions';
import firebase from 'react-native-firebase';
import moment from 'moment';
import AsyncImage from '../../layout/image/AsyncImage';
import Conversation2 from './Conversation2';

import {pickLibrary, takePicture} from '../../functions/pictures';
import {generateID} from '../../functions/createEvent';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';

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
    this.loadMessages();
  }
  componentWillUnmount() {
    firebase
      .database()
      .ref('discussions/' + this.props.navigation.getParam('data').objectID)
      .off();
  }
  async loadMessages() {
    const that = this;
    firebase
      .database()
      .ref('discussions/' + this.props.navigation.getParam('data').objectID)
      .on('value', async function(snap) {
        const discussion = snap.val();
        let messages = discussion.messages;
        if (!messages)
          messages = {
            0: {
              user: that.props.gamefareUser,
              text:
                'No messages have been sent in this conversation. Write the first one!',
              createdAt: new Date(),
              timeStamp: moment().valueOf(),
            },
          };

        messages = Object.keys(messages)
          .map((_id) => ({
            _id,
            ...messages[_id],
          }))
          .sort((a, b) => a.timeStamp - b.timeStamp)
          .reverse();
        that.setState({messages: messages, loader: false});
        that.setConversation({
          objectID: that.props.navigation.getParam('data').objectID,
          lastMessage: Object.values(messages)[0],
          lastMessageRead: true,
        });
      });
  }
  setConversation(data) {
    console.log('setConversation 3', data);
    this.props.messageAction('setConversation', data);
  }
  async sendPicture(val, discussion, user) {
    if (val === 'pick') {
      var localPicture = await pickLibrary();
    } else {
      var localPicture = await takePicture();
    }
    if (localPicture) {
      this.sendNewMessage(discussion, {
        _id: generateID(),
        user: user,
        text: '',
        image: localPicture,
        status: 'pending',
        createdAt: new Date(),
      });
    }
    return true;
  }
  infoOtherMember(conversation) {
    if (conversation.type === 'group') return {firstname: conversation.title};
    if (!conversation.members) return null;
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
  titleHeader(data) {
    if (data.type === 'users') {
      return (
        this.infoOtherMember(data).firstname +
        ' ' +
        this.infoOtherMember(data).lastname
      );
    }
    return data.title;
  }
  imgHeader(data) {
    if (data.type === 'group')
      return (
        <AsyncImage
          style={styleApp.roundView2}
          mainImage={data.image}
          imgInitial={data.image}
        />
      );
    if (this.infoOtherMember(data).picture)
      return (
        <AsyncImage
          style={styleApp.roundView2}
          mainImage={this.infoOtherMember(data).picture}
          imgInitial={this.infoOtherMember(data).picture}
        />
      );
    return (
      <View style={styleApp.roundView2}>
        <Text style={[styleApp.input, {fontSize: 11}]}>
          {this.infoOtherMember(data).firstname[0] +
            this.infoOtherMember(data).lastname[0]}
        </Text>
      </View>
    );
  }

  render() {
    const user = {
      _id: this.props.userID,
      name: this.props.infoUser.firstname + ' ' + this.props.infoUser.lastname,
      avatar: !this.props.infoUser.picture
        ? 'https://firebasestorage.googleapis.com/v0/b/getplayd.appspot.com/o/icons%2Favatar.png?alt=media&token=290242a0-659a-4585-86c7-c775aac04271'
        : this.props.infoUser.picture,
    };
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={this.titleHeader(this.props.navigation.getParam('data'))}
          imgHeader={this.imgHeader(this.props.navigation.getParam('data'))}
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
            // await Keyboard.dismiss();
            await this.conversationRef.dismiss();
            this.props.navigation.dismiss();
          }}
          clickButton2={() => true}
        />
        <View style={{height: sizes.heightHeaderHome}} />

        <Conversation2
          messages={this.state.messages}
          user={user}
          onRef={(ref) => (this.conversationRef = ref)}
          infoOtherMember={this.infoOtherMember(
            this.props.navigation.getParam('data'),
          )}
          messageAction={this.props.messageAction}
          userConnected={this.props.userConnected}
          discussion={this.props.navigation.getParam('data')}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inputContainer: {
    borderWidth: 0,
    width: '100%',
    height: 45,
    overflow: 'hidden',
    paddingLeft: 15,
    paddingTop: 6,
    //paddingLeft: 10,
    borderColor: colors.borderColor,
    // borderRadius: 25,
  },
  buttonSend: {
    height: 35,
    width: 100,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: colors.off,
  },
});

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
