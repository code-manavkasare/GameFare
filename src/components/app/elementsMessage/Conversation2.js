import React, {Component} from 'react';
import {connect} from 'react-redux';
import {StyleSheet, View, Dimensions} from 'react-native';
import PropTypes from 'prop-types';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import {KeyboardAccessoryView} from 'react-native-keyboard-input';
import {includes} from 'ramda';

import colors from '../../style/colors';
import InputMessage from './InputMessage';
import './Keyboard';
import CardMessage from './CardMessage';

class Conversation2 extends Component {
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
        discussion={this.props.discussion}
        user={this.props.user}
        onRef={(ref) => (this.inputRef = ref)}
      />
    );
  }
  filterBlockedUserMessage = (message, i) => {
    const {blockedUsers} = this.props;
    if (blockedUsers && includes(message.user.id, Object.keys(blockedUsers))) {
      return null;
    } else {
      return (
        <CardMessage
          navigation={this.props.navigation}
          message={{
            previousMessage: this.props.messages[i + 1]
              ? this.props.messages[i + 1]
              : null,
            currentMessage: message,
          }}
          discussion={this.props.discussion}
          user={this.props.user}
          key={i}
          index={i}
        />
      );
    }
  };
  render() {
    return (
      <View style={styles.container}>
        <InvertibleScrollView
          keyboardDismissMode="interactive"
          style={styles.messageScrollView}
          ref={(ref) => (this.listViewRef = ref)}
          inverted>
          {this.props.messages.map((message, i) =>
            this.filterBlockedUserMessage(message, i),
          )}
          <View style={{height: 70}} />
        </InvertibleScrollView>

        <KeyboardAccessoryView
          renderContent={this.renderContent}
          addBottomView={true}
          trackInteractive={true}
          kbInputRef={this.inputRef}
          kbComponent={this.state.customKeyboard.component}
          kbInitialProps={this.state.customKeyboard.initialProps}
          onItemSelected={this.onKeyboardItemSelected}
          onKeyboardResigned={this.onKeyboardResigned}
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
  messageScrollView: {paddingBottom: 20, paddingTop: 30, flex: 1},
});

const mapStateToProps = (state) => {
  return {
    blockedUsers: state.user.infoUser.blockedUsers,
  };
};

export default connect(mapStateToProps)(Conversation2);
