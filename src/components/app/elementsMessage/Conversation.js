import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {messageAction} from '../../../actions/messageActions';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {GiftedChat, Bubble, Send, Actions} from 'react-native-gifted-chat';
import {pickLibrary, takePicture} from '../../functions/pictures';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import ButtonColor from '../../layout/Views/Button';

import AllIcons from '../../layout/icons/AllIcons';
const {height, width} = Dimensions.get('screen');

import sizes from '../../style/sizes';
import isEqual from 'lodash.isequal';
import AllIcon from '../../layout/icons/AllIcons';

class MessageTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      loader: false,
      unreadMessages: 3,
      messages: [],
    };
    this.translateXVoile = new Animated.Value(width);
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.opacityVoile = new Animated.Value(0.3);
  }
  async componentDidMount() {}
  async componentWillReceiveProps(nextProps) {}
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        messageTextProps={{
          linkStyle: {
            right: {color: 'red'},
            left: {color: 'red'},
          },
        }}
        textStyle={{
          right: [styleApp.smallText, {color: colors.white}],
          left: [styleApp.smallText],
        }}
      />
    );
  }
  renderSendButton(props) {
    console.log(' la props');
    console.log(props);
    return (
      <Send {...props}>
        <View style={{marginRight: 15, marginBottom: 15}}>
          <AllIcon
            name="paper-plane"
            color={colors.primary}
            type="font"
            size={16}
          />
        </View>
      </Send>
    );
  }
  async sendPicture(val, conversation, user) {
    if (val == 'pick') {
      var localPicture = await pickLibrary();
    } else {
      var localPicture = await takePicture();
    }
    console.log('localPicture');
    console.log(localPicture);
    if (localPicture) {
      this.sendNewMessage(conversation, {
        _id:
          Math.random()
            .toString(36)
            .substring(2) + Date.now().toString(36),
        user: user,
        text: '',
        image: localPicture,
        status: 'pending',
        createdAt: new Date(),
      });
    }
    return true;
  }
  async sendNewMessage(conversation, newMessage) {
    await this.props.messageAction('setConversation', {
      messages: conversation.messages.concat([newMessage]),
      conversationID: conversation.id,
    });
    return true;
  }
  renderPictureButton(conversation, user) {
    return (
      <View style={{width: 80, paddingTop: 7}}>
        <Row>
          <Col>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => this.sendPicture('take', conversation, user)}>
              <View style={{marginLeft: 10, marginBottom: 16}}>
                <AllIcon
                  name="camera"
                  color={colors.green}
                  type="font"
                  size={20}
                />
              </View>
            </TouchableOpacity>
          </Col>
          <Col>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => this.sendPicture('pick', conversation, user)}>
              <View style={{marginLeft: 10, marginBottom: 16}}>
                <AllIcon
                  name="image"
                  color={colors.green}
                  type="font"
                  size={20}
                />
              </View>
            </TouchableOpacity>
          </Col>
        </Row>
      </View>
    );
  }
  messagePageView(conversation, user) {
    console.log('render convo');
    return (
      <GiftedChat
        messages={Object.values(conversation.messages).reverse()}
        onSend={messages => this.onSend(messages, conversation)}
        textInputStyle={styleApp.input}
        messageTextStyle={styleApp.input}
        renderBubble={this.renderBubble}
        user={user}
        renderActions={() => this.renderPictureButton(conversation, user)}
        renderSend={this.renderSendButton}
      />
    );
  }
  onSend(messages = [], conversation) {
    this.sendNewMessage(conversation, messages[0]);
  }
  render() {
    var conversation = Object.values(this.props.conversations).filter(
      conversation =>
        conversation.id == this.props.navigation.getParam('conversationID'),
    )[0];
    var user = {
      _id: this.props.userID,
      name: this.props.infoUser.firstname + ' ' + this.props.infoUser.lastname,
      avatar:
        'https://firebasestorage.googleapis.com/v0/b/getplayd.appspot.com/o/sports%2Ftennis%2FtypeEvent%2Fball%20(1).png?alt=media&token=a7be580e-a13b-4432-92bb-b31014675ab3',
    };
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[50, 80]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          typeIcon2={'mat'}
          initialBorderWidth={0.3}
          initialBorderColorHeader={colors.borderColor}
          sizeIcon2={17}
          initialTitleOpacity={0}
          icon1={'arrow-left'}
          icon2={null}
          clickButton1={() => this.props.navigation.dismiss()}
          clickButton2={() => console.log('')}
        />

        {this.messagePageView(conversation, user)}
      </View>
    );
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = state => {
  return {
    conversations: state.conversations,
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
  };
};

export default connect(mapStateToProps, {messageAction})(MessageTab);
