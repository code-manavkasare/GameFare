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
import {messagesSelector} from '../../../store/selectors/conversations';
import {userIDSelector} from '../../../store/selectors/user';
import {blockedUsersSelector} from '../../../store/selectors/blockedUsers';

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
        initialMessage={initialMessage}
        onRef={(ref) => (this.inputRef = ref)}
      />
    );
  }
  filterBlockedUserMessage = (message, i) => {
    const {blockedUsers, user, session, userID} = this.props;
    let {messages} = this.props;
    if (!messages) messages = {};
    if (blockedUsers && includes(message.user.id, Object.keys(blockedUsers)))
      return null;
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
        userID={userID}
        key={message.id}
        index={i}
      />
    );
  };

  render() {
    const {messages} = this.props;
    return (
      <View style={styles.container}>
        <FlatListComponent
          list={messages}
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
});

const mapStateToProps = (state, props) => {
  return {
    blockedUsers: blockedUsersSelector(state),
    messages: messagesSelector(state, {id: props.objectID}),
    userID: userIDSelector(state),
  };
};

export default connect(mapStateToProps)(ListMessages);
