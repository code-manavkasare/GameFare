import React, {Component} from 'react';
import {connect} from 'react-redux';
import {StyleSheet, View, FlatList} from 'react-native';
import isEqual from 'lodash.isequal';

import {KeyboardAccessoryView} from 'react-native-keyboard-input';
import {includes} from 'ramda';

import colors from '../../style/colors';
import InputMessage from './InputMessage';
import './Keyboard';
import CardMessage from './CardMessage';

class ListMessages extends Component {
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
      numberMessageDisplay: 15,
      receivedKeyboardData: undefined,
    };
  }
  shouldComponentUpdate(prevProps, prevState) {
    const {messages, blockedUsers} = this.props;
    if (
      !isEqual(messages, prevProps.messages) ||
      !isEqual(blockedUsers, prevProps.blockedUsers) ||
      !isEqual(prevState, this.state)
    )
      return true;
    return false;
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
    const {initialMessage, session, user} = this.props;
    return (
      <InputMessage
        discussion={session}
        user={user}
        initialMessage={initialMessage}
        onRef={(ref) => (this.inputRef = ref)}
      />
    );
  }
  filterBlockedUserMessage = (message, i) => {
    const {blockedUsers, user, session} = this.props;
    let {messages} = this.props;
    if (!messages) messages = {};
    if (blockedUsers && includes(message.user.id, Object.keys(blockedUsers))) {
      return null;
    } else {
      return (
        <CardMessage
          message={{
            previousMessage: Object.values(messages)[i + 1]
              ? Object.values(messages)[i + 1]
              : null,
            currentMessage: message,
          }}
          discussion={session}
          user={user}
          key={message.id}
          index={i}
        />
      );
    }
  };
  onEndReached = () => {
    const {numberMessageDisplay} = this.state;
    const lengthAllMessages = this.allMessages().length;

    this.setState({
      numberMessageDisplay:
        numberMessageDisplay + 20 > lengthAllMessages
          ? lengthAllMessages
          : numberMessageDisplay + 20,
    });
  };
  messagesArray = () => {
    const {numberMessageDisplay} = this.state;
    let {messages} = this.props;
    if (!messages) messages = {};
    return Object.values(messages).slice(0, numberMessageDisplay);
  };
  allMessages = () => {
    let {messages} = this.props;
    if (!messages) messages = {};
    return Object.values(messages);
  };
  render() {
    console.log('render flat list message', this.props);
    return (
      <View style={styles.container}>
        <FlatList
          data={this.messagesArray()}
          renderItem={(message) =>
            this.filterBlockedUserMessage(message.item, message.index)
          }
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="interactive"
          keyExtractor={(item) => item.timeStamp}
          inverted
          numColumns={1}
          scrollEnabled={true}
          contentContainerStyle={{
            paddingTop: 30,
            paddingBottom: 30,
          }}
          showsVerticalScrollIndicator={true}
          onEndReached={() => this.onEndReached()}
          onEndReachedThreshold={0.7}
        />

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
    width: '100%',
  },
  messageScrollView: {paddingBottom: 20, paddingTop: 30, flex: 1},
});

const mapStateToProps = (state, props) => {
  return {
    blockedUsers: state.user.infoUser.blockedUsers,
    messages: state.conversations[props.objectID],
  };
};

export default connect(mapStateToProps)(ListMessages);
