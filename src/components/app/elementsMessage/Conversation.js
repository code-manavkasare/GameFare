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
      offSet: 0,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    this.loadMessages();
  }
  async loadMessages() {
    const that = this;
    firebase
      .database()
      .ref('discussions/' + this.props.navigation.getParam('data').objectID)
      .limitToLast(15)
      .on('value', function(snap) {
        var discussion = snap.val();
        var messages = discussion.messages;
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
          marginBottom: 5,
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
  async sendNewMessage(user, text) {
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
        text: text,
        createdAt: new Date(),
        timeStamp: moment().valueOf(),
      });
    await this.setState({input: ''});
    return true;
  }
  renderChatFooter(user, props) {
    console.log('renderChatFooter');
    console.log(props);
    return (
      <Row
        style={{
          height: 45,
          // paddingBottom: 10,
          paddingLeft: 20,
          // marginTop: -this.state.offSet,
          backgroundColor: 'white',
          paddingRight: 10,
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
                    styleApp.textBold,
                    {
                      color: props.text === '' ? colors.greyDark : colors.white,
                    },
                  ]}>
                  Send
                </Text>
              );
            }}
            click={() =>
              props.text === '' ? null : this.sendNewMessage(user, props.text)
            }
            color={props.text === '' ? colors.white : colors.primary}
            style={[
              styleApp.center,
              styles.buttonSend,
              {
                borderColor:
                  props.text === '' ? colors.greyDark : colors.primary,
              },
            ]}
            onPressColor={props.text === '' ? colors.white : colors.primary2}
          />
        </Col>
      </Row>
    );
  }
  renderComposer(user) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => this.inputRef.focus()}
        style={{
          backgroundColor: 'red',
          // height: 45,
          flex: 1,
          minHeight: 50,
          paddingTop: 10,
          paddingBottom: 10,
          borderColor: colors.borderColor,
          borderTopWidth: 0.5,
          width: width,
          paddingLeft: 10,
          flexDirection: 'row',
          paddingRight: 10,
        }}>
        <TextInput
          multiline={true}
          placeholder="Message"
          // onFocus={() => this.setState({focus: true})}
          // onBlur={() => this.setState({focus: false})}
          ref={(input) => {
            this.inputRef = input;
          }}
          onContentSizeChange={(event) => {
            console.log(event.nativeEvent.contentSize.height);
            this.setState({
              offSet: event.nativeEvent.contentSize.height,
            });
          }}
          numberOfLines={2}
          onChangeText={(text) => this.setState({input: text})}
          value={this.state.input}
          style={styleApp.input}
        />
        {/* {this.renderChatFooter(user)} */}
      </TouchableOpacity>
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
        // containerStyle={{borderTopWidth: 0.5}}
        placeholder={'Write your message'}
        renderMessage={(props) => this.renderMessage(props)}
        user={user}
        inverted={true}
        multiline={true}
        //inverted={true}
        //bottomOffset={0}
        minInputToolbarHeight={50}
        //scrollToBottomOffset={0}
        textInputProps={{
          returnKeyType: 'done',
          blurOnSubmit: true,
        }}
        textInputStyle={[
          styleApp.text,
          {
            paddingTop: -15,
            paddingBottom: 5,
            flex: 1,
            paddingLeft: 0,
            paddingRight: 10,
            lineHeight: 21,
          },
        ]}
        text={this.state.input}
        onInputTextChanged={(text) => this.setState({input: text})}
        // renderMessage={this.renderMessage}
        renderChatEmpty={() => this.renderChatEmpty()}
        renderSend={() => null}
        // renderComposer={() => this.renderComposer(user)}
        renderAccessory={(props) => this.renderChatFooter(user, props)}
      />
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
    var user = {
      _id: this.props.userID,
      name: this.props.infoUser.firstname + ' ' + this.props.infoUser.lastname,
      avatar: !this.props.infoUser.picture
        ? 'https://firebasestorage.googleapis.com/v0/b/getplayd.appspot.com/o/icons%2Favatar.png?alt=media&token=290242a0-659a-4585-86c7-c775aac04271'
        : this.props.infoUser.picture,
    };
    console.log('this.titleHeader(this.props.navigation.getParam)');
    console.log(this.titleHeader(this.props.navigation.getParam('data')));
    return (
      <View keyboardDismissMode="on-drag" style={styleApp.stylePage}>
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
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    infoUser: state.user.infoUser.userInfo,
  };
};

export default connect(mapStateToProps, {messageAction})(MessageTab);
