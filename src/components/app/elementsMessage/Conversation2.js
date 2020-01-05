import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PixelRatio,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
} from 'react-native';
import PropTypes from 'prop-types';
import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
//import ScrollView from '../../layout/scrollViews/ScrollView';

import {
  KeyboardAccessoryView,
  KeyboardUtils,
} from 'react-native-keyboard-input';
const {height, width} = Dimensions.get('screen');
import colors from '../../style/colors';
import sizes from '../../style/sizes';
import AllIcons from '../../layout/icons/AllIcons';
import styleApp from '../../style/style';

import {Grid, Row, Col} from 'react-native-easy-grid';

const IsIOS = Platform.OS === 'ios';
const TrackInteractive = true;

export default class KeyboardInput extends Component {
  static propTypes = {
    message: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.keyboardAccessoryViewContent = this.keyboardAccessoryViewContent.bind(
      this,
    );
    this.onKeyboardItemSelected = this.onKeyboardItemSelected.bind(this);

    this.state = {
      customKeyboard: {
        component: undefined,
        initialProps: undefined,
      },
      receivedKeyboardData: undefined,
    };
  }

  onKeyboardItemSelected(keyboardId, params) {
    const receivedKeyboardData = `onItemSelected from "${keyboardId}"\nreceived params: ${JSON.stringify(
      params,
    )}`;
    this.setState({receivedKeyboardData});
  }

  getToolbarButtons() {
    return [
      {
        text: 'show1',
        testID: 'show1',
        onPress: () =>
          this.showKeyboardView('KeyboardView', 'FIRST - 1 (passed prop)'),
      },
      {
        text: 'show2',
        testID: 'show2',
        onPress: () =>
          this.showKeyboardView(
            'AnotherKeyboardView',
            'SECOND - 2 (passed prop)',
          ),
      },
    ];
  }

  showKeyboardView(component, title) {
    this.setState({
      customKeyboard: {
        component,
        initialProps: {title},
      },
    });
  }
  focusInput() {
    console.log('focus input');
    this._invertibleScrollViewRef.scrollTo({y: 0, animated: true});
  }
  keyboardAccessoryViewContent() {
    return (
      <View style={styles.keyboardContainer}>
        <View
          style={{
            borderTopWidth: 2,
            borderColor: colors.grey,
          }}
        />

        <AutoGrowingTextInput
          maxHeight={200}
          style={styles.textInput}
          ref={(r) => {
            this.textInputRef = r;
          }}
          onFocus={() => this.focusInput()}
          placeholder={'Message'}
          underlineColorAndroid="transparent"
          //onFocus={() => this.resetKeyboardView()}
          testID={'input'}
        />

        <Row style={{paddingLeft: 20, paddingRight: 20, height: 50}}>
          <Col size={10} style={styleApp.center2}>
            <AllIcons
              name="camera"
              color={colors.title}
              type="font"
              size={20}
            />
          </Col>
          <Col size={10} style={styleApp.center2}>
            <AllIcons name="image" color={colors.title} type="font" size={20} />
          </Col>
          <Col size={60} style={styleApp.center2}></Col>

          <Col size={20} style={styleApp.center3}>
            {/* <ButtonColor
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
                  : this.sendNewMessage(user, this.state.inputValue)
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
            /> */}
          </Col>
        </Row>
      </View>
    );
  }
  render() {
    return (
      <View style={styles.container}>
        {/* <KeyboardAvoidingView
          style={styleApp.center4}
          behavior="padding"
          enabled> */}
        <KeyboardAwareScrollView extraScrollHeight={-130}>
          <InvertibleScrollView
            // ref={(ref) => (this.listViewRef = ref)}
            ref={(component) => {
              this._invertibleScrollViewRef = component;
            }}
            inverted
            style={[
              {
                backgroundColor: 'yellow',
                flex: 1,
              },
            ]}
            keyboardDismissMode={'interactive'}>
            <View style={{backgroundColor: 'blue', height: 200}} />
            <View style={{backgroundColor: 'green', height: 200}} />
            <Text style={styleApp.text}>coucou</Text>
            <Text style={styleApp.text}>coucou</Text>
            <Text style={styleApp.text}>coucou</Text>
            <View style={{backgroundColor: 'blue', height: 200}} />
            <Text style={styleApp.text}>coucou</Text>
            <Text style={styleApp.text}>coucou</Text>
            <View style={{backgroundColor: 'red', height: 200}} />
            <Text style={styleApp.text}>coucou</Text>
          </InvertibleScrollView>
        </KeyboardAwareScrollView>
        <KeyboardAccessoryView
          renderContent={this.keyboardAccessoryViewContent}
          onHeightChanged={
            IsIOS
              ? (height) => this.setState({keyboardAccessoryViewHeight: height})
              : undefined
          }
          trackInteractive={TrackInteractive}
          kbInputRef={this.textInputRef}
          kbComponent={this.state.customKeyboard.component}
          kbInitialProps={this.state.customKeyboard.initialProps}
          onItemSelected={this.onKeyboardItemSelected}
          onKeyboardResigned={this.onKeyboardResigned}
          revealKeyboardInteractive
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // height: height - sizes.heightHeaderHome - 0,
    paddingBottom: 132,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    //justifyContent: 'center',
    //padding: 0,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  keyboardContainer: {
    ...Platform.select({
      ios: {
        flex: 1,
        backgroundColor: colors.white,
      },
    }),
  },
  textInput: {
    flex: 1,
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
  sendButton: {
    paddingRight: 15,
    paddingLeft: 15,
    alignSelf: 'center',
  },
});
