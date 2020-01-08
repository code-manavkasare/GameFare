import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';

import PropTypes from 'prop-types';
import InvertibleScrollView from 'react-native-invertible-scroll-view';

import {
  KeyboardAccessoryView,
  KeyboardUtils,
} from 'react-native-keyboard-input';
const {height, width} = Dimensions.get('screen');
import colors from '../../style/colors';
import sizes from '../../style/sizes';
import styleApp from '../../style/style';
import Loader from '../../layout/loaders/Loader';
import InputMessage from './InputMessage';
import './Keyboard';

import {Grid, Row, Col} from 'react-native-easy-grid';
import CardMessage from './CardMessage';

const IsIOS = Platform.OS === 'ios';
const TrackInteractive = true;

export default class KeyboardInput extends Component {
  static propTypes = {
    message: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this.onKeyboardItemSelected = this.onKeyboardItemSelected.bind(this);
    this.resetKeyboardView = this.resetKeyboardView.bind(this);
    this.onKeyboardResigned = this.onKeyboardResigned.bind(this);

    this.renderContent = this.renderContent.bind(this);
    this.state = {
      loader: true,
      customKeyboard: {
        component: undefined,
        initialProps: undefined,
      },
      receivedKeyboardData: undefined,
    };
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  dismiss() {
    this.inputRef.blur();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.messages !== this.props.messages)
      this.setState({loader: false});
  }

  resetKeyboardView() {
    this.setState({customKeyboard: {}});
  }
  onKeyboardResigned() {
    this.resetKeyboardView();
  }

  onKeyboardItemSelected(keyboardId, params) {
    this.inputRef.addImage(params.image, params.selected);
  }
  showKeyboardView(component, title) {
    this.setState({
      customKeyboard: {
        component,
        initialProps: {title},
      },
    });
  }
  renderContent() {
    return (
      <InputMessage
        userConnected={this.props.userConnected}
        conversation={this.props.conversation}
        infoOtherMember={this.props.infoOtherMember}
        user={this.props.user}
        onRef={(ref) => (this.inputRef = ref)}
        openPicturesView={(val) => {
          console.log('switch to other view');
          this.showKeyboardView('KeyboardView', 'FIRST - 1 (passed prop)');
          // this.setState({
          //   customKeyboard: {
          //     component: 'KeyboardView',
          //     initialProps: 'FIRST - 1 (passed prop)',
          //   },
          // });
        }}
      />
    );
  }
  render() {
    return (
      <View style={styles.container}>
        <InvertibleScrollView
          keyboardDismissMode="interactive"
          ref={(ref) => (this.listViewRef = ref)}
          inverted>
          {this.state.loader ? (
            <View style={[styleApp.center, {marginBottom: 20}]}>
              <Loader size={25} color={'green'} />
            </View>
          ) : (
            <View style={[styleApp.center, {marginBottom: -30}]}>
              <Text style={[styleApp.smallText, {color: colors.grey}]}>
                <Text>✓</Text> You are to date
              </Text>
            </View>
          )}

          <View style={{height: 20}} />
          {this.props.messages.map((message, i) => (
            <CardMessage
              message={{
                previousMessage: this.props.messages[i + 1]
                  ? this.props.messages[i + 1]
                  : null,
                currentMessage: message,
              }}
              conversation={this.props.conversation}
              key={i}
              index={i}
            />
          ))}
          <View style={{height: 30}} />
        </InvertibleScrollView>

        <KeyboardAccessoryView
          renderContent={this.renderContent}
          addBottomView={true}
          onHeightChanged={
            IsIOS
              ? (height) => this.setState({keyboardAccessoryViewHeight: height})
              : undefined
          }
          trackInteractive={TrackInteractive}
          kbInputRef={this.inputRef}
          kbComponent={this.state.customKeyboard.component}
          kbInitialProps={this.state.customKeyboard.initialProps}
          onItemSelected={this.onKeyboardItemSelected}
          onKeyboardResigned={this.onKeyboardResigned}
          //  revealKeyboardInteractive
          requiresSameParentToManageScrollView
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
