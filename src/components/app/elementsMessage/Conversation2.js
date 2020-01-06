import React, {Component} from 'react';
import {StyleSheet, Text, View, Dimensions, Platform} from 'react-native';
import PropTypes from 'prop-types';
import InvertibleScrollView from 'react-native-invertible-scroll-view';

import {
  KeyboardAccessoryView,
  KeyboardUtils,
} from 'react-native-keyboard-input';
const {height, width} = Dimensions.get('screen');
import colors from '../../style/colors';
import sizes from '../../style/sizes';
import InputMessage from './InputMessage';

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
    this.renderContent = this.renderContent.bind(this);
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
        user={this.props.user}
        openPicturesView={(val) => {
          console.log('switch to other view');
          this.setState({
            customKeyboard: {
              component: 'KeyboardView',
              initialProps: 'FIRST - 1 (passed prop)',
            },
          });
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
          {this.props.messages.map((message, i) => (
            <CardMessage
              message={{
                previousMessage: this.props.messages[i - 1]
                  ? this.props.messages[i - 1]
                  : null,
                currentMessage: message,
              }}
              conversation={this.props.conversation}
              key={i}
              index={i}
            />
          ))}
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
          kbInputRef={this.textInputRef}
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
