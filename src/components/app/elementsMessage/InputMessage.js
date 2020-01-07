import React from 'react';
import {View, Text, Dimensions, StyleSheet, Platform} from 'react-native';
import {connect} from 'react-redux';
import {messageAction} from '../../../actions/messageActions';
import firebase from 'react-native-firebase';
import moment from 'moment';
import Loader from '../../layout/loaders/Loader';
import AsyncImage from '../../layout/image/AsyncImage';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';
import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';
import NavigationService from '../../../../NavigationService';
const {height, width} = Dimensions.get('screen');

class InputMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',
    };
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  async sendNewMessage(user, text) {
    if (!this.props.userConnected) return NavigationService.navigate('SignIn');
    this.setState({inputValue: ''});
    await firebase
      .database()
      .ref('discussions/' + this.props.conversation.objectID + '/messages')
      .push({
        user: user,
        text: text,
        createdAt: new Date(),
        timeStamp: moment().valueOf(),
      });
    return true;
  }
  async openPicturesView(val) {
    await this.textInputRef.focus();
    return this.props.openPicturesView(val);
  }
  renderInput() {
    console.log('render inoyt', this.props.infoOtherMember);
    return (
      <View style={styles.keyboardContainer}>
        {/* <View style={{height: 50, backgroundColor: 'blue'}}></View> */}
        <AutoGrowingTextInput
          maxHeight={200}
          // minHeight={35}
          style={styles.textInput}
          ref={(r) => {
            this.textInputRef = r;
          }}
          enableScrollToCaret
          value={this.state.inputValue}
          // onFocus={() => this.focusInput()}
          placeholder={
            'Send a message to ' + this.props.infoOtherMember.firstname
          }
          onChangeText={(text) => this.setState({inputValue: text})}
          underlineColorAndroid="transparent"
          //onFocus={() => this.resetKeyboardView()}
          // testID={'inputValue'}
        />

        <Row
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            height: 50,
            // backgroundColor: 'red',
          }}>
          <Col size={10} style={styleApp.center2}>
            <AllIcons
              name="camera"
              color={colors.title}
              type="font"
              size={20}
            />
          </Col>
          <Col
            size={10}
            style={styleApp.center2}
            activeOpacity={0.7}
            onPress={() => this.openPicturesView(true)}>
            <AllIcons name="image" color={colors.title} type="font" size={20} />
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
                        color:
                          this.state.inputValue === ''
                            ? colors.greyDark
                            : colors.white,
                      },
                    ]}>
                    Send
                  </Text>
                );
              }}
              click={() =>
                this.state.inputValue === ''
                  ? null
                  : this.sendNewMessage(this.props.user, this.state.inputValue)
              }
              color={
                this.state.inputValue === '' ? colors.white : colors.primary
              }
              style={[
                styleApp.center,
                styles.buttonSend,
                {
                  borderColor:
                    this.state.inputValue === ''
                      ? colors.greyDark
                      : colors.primary,
                },
              ]}
              onPressColor={
                this.state.inputValue === '' ? colors.white : colors.primary2
              }
            />
          </Col>
        </Row>
      </View>
    );
  }
  render() {
    return this.renderInput();
  }
}

const styles = StyleSheet.create({
  keyboardContainer: {
    borderTopWidth: 0.5,
    borderColor: colors.borderColor,
    ...Platform.select({
      ios: {
        flex: 1,
        backgroundColor: colors.white,
      },
    }),
  },
  textInput: {
    flex: 1,
    ...styleApp.input,
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 2,
    paddingBottom: 5,
    fontSize: 16,
    width: width - 20,
    backgroundColor: 'white',
    // sborderWidth: 0.5 / PixelRatio.get(),
    borderRadius: 18,
  },
  buttonSend: {
    paddingRight: 15,
    paddingLeft: 15,
    borderWidth: 1,
    height: 35,
    width: 80,
    borderRadius: 5,
    alignSelf: 'center',
  },
});

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, {})(InputMessage);
