import React from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {connect} from 'react-redux';
import {messageAction} from '../../../actions/messageActions';
import firebase from 'react-native-firebase';
import moment from 'moment';
import Loader from '../../layout/loaders/Loader';
import AsyncImage from '../../layout/image/AsyncImage';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';
import FadeInView from 'react-native-fade-in-view';
import union from 'lodash/union';

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
      images: '',
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
  addImage(uri, add) {
    if (add) return this.setState({images: union([uri], this.state.images)});

    console.log('delte image', add);

    var images = this.state.images.slice(0);
    console.log(images);
    const index = this.state.images.keys(uri);
    console.log(index);
    delete images[images.indexOf(uri)];
    console.log(images);
    this.setState({images: images});
  }
  deleteImage(uri) {}
  conditionInputOn() {
    if (this.state.inputValue === '' && this.state.images.length === 0)
      return false;
    return true;
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

        {this.state.images.length !== 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 20,
              //backgroundColor: 'red',
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}>
            {this.state.images.map((uri, i) => (
              <FadeInView duration={250} style={{marginRight: 10}}>
                <TouchableOpacity
                  style={styles.buttonCloseImg}
                  activeOpacity={0.8}
                  onPress={() => this.addImage(uri, false)}>
                  <AllIcons name="times" type="font" color="white" size={8} />
                </TouchableOpacity>
                <Image
                  source={{uri: uri}}
                  key={i}
                  style={{height: 45, width: 45, borderRadius: 5}}
                />
              </FadeInView>
            ))}
            <View style={{width: 30}} />
          </ScrollView>
        ) : null}

        <Row
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            height: 50,
            // backgroundColor: 'red',
          }}>
          <Col size={10} style={styleApp.center2}>
            <AllIcons
              name="add-a-photo"
              color={colors.title}
              type="mat"
              size={23}
            />
          </Col>
          <Col
            size={10}
            style={styleApp.center2}
            activeOpacity={0.7}
            onPress={() => this.openPicturesView(true)}>
            <AllIcons
              name="collections"
              color={colors.title}
              type="mat"
              size={23}
            />
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
                        color: !this.conditionInputOn()
                          ? colors.greyDark
                          : colors.white,
                      },
                    ]}>
                    Send
                  </Text>
                );
              }}
              click={() =>
                this.conditionInputOn()
                  ? null
                  : this.sendNewMessage(this.props.user, this.state.inputValue)
              }
              color={!this.conditionInputOn() ? colors.white : colors.primary}
              style={[
                styleApp.center,
                styles.buttonSend,
                {
                  borderColor: !this.conditionInputOn()
                    ? colors.greyDark
                    : colors.primary,
                },
              ]}
              onPressColor={
                !this.conditionInputOn() ? colors.white : colors.primary2
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
  buttonCloseImg: {
    ...styleApp.center,
    position: 'absolute',
    height: 22,
    width: 22,
    borderRadius: 12.5,
    right: -7,
    top: -7,
    zIndex: 40,
    backgroundColor: colors.title,
    borderWidth: 2,
    borderColor: colors.white,
  },
});

const mapStateToProps = (state) => {
  return {
    input: state.message.input,
  };
};

export default connect(mapStateToProps, {})(InputMessage);
