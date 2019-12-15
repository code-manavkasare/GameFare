import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
  ScrollView,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {messageAction} from '../../../actions/messageActions';
import firebase from 'react-native-firebase';
import moment from 'moment';
import Loader from '../../layout/loaders/Loader';
import AsyncImage from '../../layout/image/AsyncImage';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {GiftedChat, Bubble, Send, Actions} from 'react-native-gifted-chat';
import emojiUtils from 'emoji-utils';

import {pickLibrary, takePicture} from '../../functions/pictures';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import styleApp from '../../style/style';
import Message from './Message';
import colors from '../../style/colors';
import sizes from '../../style/sizes';
import ButtonColor from '../../layout/Views/Button';

import AllIcons from '../../layout/icons/AllIcons';
const {height, width} = Dimensions.get('screen');

import isEqual from 'lodash.isequal';
import AllIcon from '../../layout/icons/AllIcons';

class MessageTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      focus: false,
      messages: [],
      input: '',
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    this.loadMessages();
  }
  async loadMessages() {
    const that = this;
    var test = await firebase
      .database()
      .ref(
        'discussions/' +
          this.props.navigation.getParam('data').objectID +
          '/messages',
      )
      .once('value');
    test = test.val();
    console.log('rest');
    console.log(test);
    firebase
      .database()
      .ref('discussions/' + this.props.navigation.getParam('data').objectID)
      .limitToLast(15)
      .on('value', function(snap) {
        console.log('on value');
        console.log(snap.val());
        var discussion = snap.val();
        var messages = discussion.messages;
        console.log('messages loaded');
        console.log(snap.val());
        console.log(messages);
        if (messages === undefined) messages = {};

        messages = Object.keys(messages)
          .map(_id => ({
            _id,
            ...messages[_id],
          }))
          .sort((a, b) => a.timeStamp - b.timeStamp)
          .reverse();

        console.log('set atqte messages');
        console.log(messages);
        that.setState({messages: messages, loader: false});
      });
  }
  async componentWillReceiveProps(nextProps) {}
  rowDay(props) {
    console.log('row day');
    console.log(props.previousMessage.createdAt);
    console.log(moment(props.currentMessage.createdAt).format('DDD'));
    console.log(moment(props.previousMessage.createdAt).format('DDD'));
    if (
      moment(props.currentMessage.createdAt).format('DDD') !==
        moment(props.previousMessage.createdAt).format('DDD') ||
      !props.previousMessage.createdAt
    ) {
      console.log('il est la');
      return (
        <Row
          style={{
            flex: 1,
            borderBottomWidth: 0.5,
            marginBottom: 10,
            borderColor: colors.grey,
            // backgroundColor: 'red',
          }}>
          <Col style={styleApp.center2}>
            <Text style={[styleApp.text, {marginBottom: 10, marginTop: 10}]}>
              {moment(props.currentMessage.createdAt).format('DDD') ===
              moment().format('DDD')
                ? 'Today'
                : Number(
                    moment(props.currentMessage.createdAt).format('DDD') ===
                      Number(moment().format('DDD')) - 1,
                  )
                ? 'Yesterday'
                : moment(props.currentMessage.createdAt).format('MMMM, Do')}
            </Text>
          </Col>
        </Row>
      );
    }
    return null;
  }
  renderMessage(props) {
    // console.log('buble !');
    // console.log(props);

    return (
      <View
        style={{
          flex: 1,
          width: '100%',
          marginTop: 5,
          paddingLeft: 20,
          paddingRight: 20,
        }}>
        {this.rowDay(props)}
        <Row>
          <Col size={15}>
            <AsyncImage
              style={{width: 45, height: 45, borderRadius: 5}}
              mainImage={props.currentMessage.user.avatar}
              imgInitial={props.currentMessage.user.avatar}
            />
          </Col>
          <Col size={85} style={[styleApp.center2, {marginBottom: 10}]}>
            <Text style={[styleApp.text, {fontSize: 16}]}>
              {props.currentMessage.user.name}{' '}
              <Text style={{color: colors.grey, fontSize: 12}}>
                {moment(props.currentMessage.createdAt).format('h:mm a')}
              </Text>
            </Text>
            <Text style={[styleApp.smallText, {marginTop: 5}]}>
              {props.currentMessage.text}
            </Text>
          </Col>
        </Row>
      </View>
    );
    // return (
    //   <Bubble
    //     {...props}
    //     messageTextProps={{
    //       linkStyle: {
    //         right: {color: 'red'},
    //         left: {color: 'red'},
    //       },
    //     }}
    //     textStyle={{
    //       right: [styleApp.smallText, {color: colors.blue}],
    //       left: [styleApp.smallText],
    //     }}
    //   />
    // );
  }
  async sendPicture(val, discussion, user) {
    if (val == 'pick') {
      var localPicture = await pickLibrary();
    } else {
      var localPicture = await takePicture();
    }
    console.log('localPicture');
    console.log(localPicture);
    if (localPicture) {
      this.sendNewMessage(discussion, {
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
  async sendNewMessage(user) {
    if (!this.props.userConnected)
      return this.props.navigation.navigate('SignIn');
    await firebase
      .database()
      .ref(
        'discussions/' +
          this.props.navigation.getParam('data').objectID +
          '/messages',
      )
      .push({
        user: user,
        text: this.state.input,
        createdAt: new Date(),
        timeStamp: moment().valueOf(),
      });
    await this.setState({input: ''});
    return true;
  }
  renderChatFooter(user) {
    return (
      <Row
        style={{
          height: 45,
          paddingLeft: 20,
          paddingRight: 20,
        }}>
        <Col size={10} style={styleApp.center2}>
          {/* <AllIcon name="camera" color={colors.title} type="font" size={20} /> */}
        </Col>
        <Col size={10} style={styleApp.center2}>
          {/* <AllIcon name="image" color={colors.title} type="font" size={20} /> */}
        </Col>
        <Col size={60} style={styleApp.center2}></Col>

        <Col size={20} style={styleApp.center3}>
          <ButtonColor
            view={() => {
              return (
                <Text
                  style={[
                    styles.input,
                    {
                      color:
                        this.state.input === '' ? colors.grey : colors.white,
                    },
                  ]}>
                  Send
                </Text>
              );
            }}
            click={() =>
              this.state.input === '' ? null : this.sendNewMessage(user)
            }
            color={this.state.input === '' ? colors.white : colors.primary}
            style={[
              styleApp.center,
              styles.buttonSend,
              {
                borderColor:
                  this.state.input === '' ? colors.grey : colors.primary,
              },
            ]}
            onPressColor={
              this.state.input === '' ? colors.white : colors.primary2
            }
          />
        </Col>
      </Row>
    );
  }
  renderComposer() {
    return (
      <Row
        style={{
          backgroundColor: 'white',
          height: 40,
          borderColor: colors.white,
          borderTopWidth: 0,
          width: width,
          paddingLeft: 20,
          paddingRight: 20,
        }}>
        <Col style={styleApp.center}>
          <ButtonColor
            view={() => {
              return (
                <TextInput
                  multiline={true}
                  placeholder="Message"
                  onFocus={() => this.setState({focus: true})}
                  onBlur={() => this.setState({focus: false})}
                  ref={input => {
                    this.inputRef = input;
                  }}
                  onChangeText={text => this.setState({input: text})}
                  value={this.state.input}
                  style={[
                    styleApp.input,
                    {
                      height: '100%',
                      width: '100%',
                    },
                  ]}
                />
              );
            }}
            click={() => console.log('')}
            color={colors.off2}
            style={styles.inputContainer}
            onPressColor={colors.off}
          />
        </Col>
      </Row>
    );
  }
  renderChatEmpty() {
    return (
      <View style={[styleApp.center, {height: '100%'}]}>
        {this.state.loader ? (
          <Loader color="green" size={30} />
        ) : (
          <Text style={styleApp.text}>No message has been sent yet.</Text>
        )}
      </View>
    );
  }

  messagePageView(discussion, user) {
    console.log('render convo');
    // return null;
    console.log(this.state.messages);
    return (
      <GiftedChat
        messages={this.state.messages}
        messageTextStyle={styleApp.input}
        containerStyle={{borderTopWidth: 0}}
        renderMessage={props => this.renderMessage(props)}
        user={user}
        inverted={true}
        //inverted={true}
        bottomOffset={0}
        // renderMessage={this.renderMessage}
        renderChatEmpty={() => this.renderChatEmpty()}
        renderComposer={() => this.renderComposer()}
        renderAccessory={() => this.renderChatFooter(user)}
      />
    );
  }
  render() {
    var user = {
      _id: this.props.userID,
      name: this.props.infoUser.firstname + ' ' + this.props.infoUser.lastname,
      avatar: !this.props.infoUser.picture ? '' : this.props.infoUser.picture,
    };
    return (
      <View keyboardDismissMode="on-drag" style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={this.props.navigation.getParam('data').title}
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
          clickButton1={() => this.props.navigation.dismiss()}
          clickButton2={() => console.log('')}
        />
        <View style={{height: sizes.heightHeaderHome}} />
        {this.messagePageView(this.props.navigation.getParam('data'), user)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inputContainer: {
    borderWidth: 0.5,
    width: '100%',
    flex: 1,
    overflow: 'hidden',
    paddingLeft: 15,
    paddingTop: 4,
    //paddingLeft: 10,
    borderColor: colors.borderColor,
    borderRadius: 25,
  },
  buttonSend: {
    height: 30,
    width: 70,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.off,
  },
});

const mapStateToProps = state => {
  return {
    // discussions: state.discussions,
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    infoUser: state.user.infoUser.userInfo,
  };
};

export default connect(mapStateToProps, {messageAction})(MessageTab);
