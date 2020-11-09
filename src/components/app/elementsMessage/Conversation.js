import React from 'react';
import {View, Animated, InteractionManager} from 'react-native';
import {connect} from 'react-redux';

import {userObject} from '../../functions/users';
import {
  deleteNotifications,
  updateNotificationBadge,
} from '../../functions/notifications.js';
import {bindSession, bindConversation} from '../../database/firebase/bindings';
import {store} from '../../../store/reduxStore';

import MyTabs from '../../navigation/MainApp/components/TeamPage';

import HeaderConversation from './HeaderConversation';
import styleApp from '../../style/style';
import sizes from '../../style/sizes';

class MessageTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount = async () => {
    InteractionManager.runAfterInteractions(async () => {
      const {coachSessionID} = this.props.route.params;
      let {notifications} = store.getState().user.infoUser;
      if (!notifications) notifications = [];
      notifications = Object.values(notifications);
      const {userID} = this.props;
      await deleteNotifications(userID, coachSessionID, notifications);
      updateNotificationBadge(notifications.length);
      this.bindSession();
    });
  };
  bindSession() {
    const {coachSessionID} = this.props.route.params;
    bindSession(coachSessionID);
    bindConversation(coachSessionID);
  }
  render() {
    const {infoUser, userID, navigation, session, route, messages} = this.props;
    const {initialMessage} = route.params;
    const {loader} = this.state;
    if (!session) return null;
    const user = userObject(infoUser, userID);
    return (
      <View style={styleApp.stylePage}>
        <HeaderConversation
          navigation={navigation}
          loader={loader}
          session={session}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
        />
        <View style={{height: sizes.heightHeaderHome}} />

        {MyTabs({session, initialMessage, user, messages})}
      </View>
    );
  }
}

const mapStateToProps = (state, props) => {
  const {coachSessionID} = props.route.params;
  const conversation = state.conversations[coachSessionID]
  let messages = {}
  if (conversation) messages = conversation.messages
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    infoUser: state.user.infoUser.userInfo,
    session: state.coachSessions[coachSessionID],
    messages,
  };
};

export default connect(
  mapStateToProps,
  {},
)(MessageTab);
