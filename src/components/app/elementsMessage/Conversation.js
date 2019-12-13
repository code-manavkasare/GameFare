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
import Loader from '../../layout/loaders/Loader';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {GiftedChat, Bubble, Send, Actions} from 'react-native-gifted-chat';
import {pickLibrary, takePicture} from '../../functions/pictures';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import styleApp from '../../style/style';
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
  loadMessages() {
    const that = this;
    firebase
      .database()
      .ref(
        'discussions/' +
          this.props.navigation.getParam('data').objectID +
          '/messages',
      )
      .on('value', function(snap) {
        var messages = snap.val();
        console.log('messages loaded');
        console.log(messages);
        if (messages === null) messages = [];

        that.setState({
          messages: Object.values(messages).reverse(),
          loader: false,
        });
      });
  }
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
          <AllIcon name="camera" color={colors.title} type="font" size={20} />
        </Col>
        <Col size={10} style={styleApp.center2}>
          <AllIcon name="image" color={colors.title} type="font" size={20} />
        </Col>
        <Col size={60} style={styleApp.center2}></Col>

        {this.state.input != '' ? (
          <Col
            size={20}
            style={styleApp.center3}
            activeOpacity={0.7}
            onPress={() => this.sendNewMessage(user)}>
            <AllIcon
              name="paper-plane"
              color={colors.primary}
              type="font"
              size={18}
            />
          </Col>
        ) : this.state.focus ? (
          <Col
            size={20}
            style={styleApp.center3}
            activeOpacity={0.7}
            onPress={() => this.inputRef.blur()}>
            <AllIcon
              name="keyboard-hide"
              color={colors.title}
              type="mat"
              size={18}
            />
          </Col>
        ) : (
          <Col size={20} />
        )}
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
          borderTopWidth: 1,
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
  messagePageView(conversation, user) {
    console.log('render convo');
    // return null;
    return (
      <GiftedChat
        messages={this.state.messages.reverse()}
        onSend={message => this.onSend(message, conversation)}
        ///textInputStyle={{backgroundColor: 'red', borderWidth: 2}}
        messageTextStyle={styleApp.input}
        renderBubble={this.renderBubble}
        user={user}
        //inverted={true}
        bottomOffset={0}
        // textInputStyle={{backgroundColor: 'red', borderWidth: 2}}
        renderChatEmpty={() => this.renderChatEmpty()}
        renderComposer={() => this.renderComposer()}
        renderAccessory={() => this.renderChatFooter(user)}
      />
    );
  }
  onSend(messages = [], conversation) {
    this.sendNewMessage(conversation, messages[0]);
  }
  render() {
    var user = {
      _id: this.props.userID,
      name: this.props.infoUser.firstname + ' ' + this.props.infoUser.lastname,
      avatar: !this.props.infoUser.picture ? '' : this.props.infoUser.picture,
    };
    return (
      <View style={styleApp.stylePage}>
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
});

const mapStateToProps = state => {
  return {
    conversations: state.conversations,
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    infoUser: state.user.infoUser.userInfo,
  };
};

export default connect(mapStateToProps, {messageAction})(MessageTab);
