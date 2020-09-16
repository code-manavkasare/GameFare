import React, {Component} from 'react';
import {connect} from 'react-redux';
import {StyleSheet, View} from 'react-native';
import isEqual from 'lodash.isequal';

import {KeyboardAccessoryView} from 'react-native-keyboard-input';
import {includes} from 'ramda';

import colors from '../../style/colors';
import InputMessage from './InputMessage';
import './Keyboard';
import CardMessage from './CardMessage';
import {FlatListComponent} from '../../layout/Views/FlatList';

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
      receivedKeyboardData: undefined,
    };
  }
  shouldComponentUpdate(prevProps, prevState) {
    const {messages, blockedUsers, isSessionRequest} = this.props;
    if (
      !isEqual(messages, prevProps.messages) ||
      !isEqual(blockedUsers, prevProps.blockedUsers) ||
      !isEqual(isSessionRequest, prevProps.isSessionRequest) ||
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

  messagesArray = () => {
    let {messages, isSessionRequest, session, userID} = this.props;
    if (!messages) messages = {};
    messages = Object.values(messages);
    if (isSessionRequest) {
      const {organizer} = session.info;
      messages.unshift({
        id: 'request',
        text:
          organizer !== userID
            ? 'Unlock the conversation by sending the first message.'
            : 'The conversation is currently locked.',
        type: 'request',
        timeStamp: Date.now(),
        user: {},
      });
    }
    return messages;
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatListComponent
          list={this.messagesArray()}
          cardList={({item, index}) =>
            this.filterBlockedUserMessage(item, index)
          }
          inverted={true}
          numColumns={1}
          incrementRendering={20}
          styleContainer={{paddingTop: 20}}
          header={<View />}
          initialNumberToRender={20}
          paddingBottom={133}
          hideDividerHeader={true}
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
  const isSessionRequest =
    state.user.infoUser.coachSessionsRequests &&
    state.user.infoUser.coachSessionsRequests[props.objectID];
  return {
    blockedUsers: state.user.infoUser.blockedUsers,
    messages: state.conversations[props.objectID],
    isSessionRequest: isSessionRequest ? isSessionRequest : null,
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps)(ListMessages);
