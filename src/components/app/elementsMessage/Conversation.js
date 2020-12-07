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
import {heightHeaderHome} from '../../style/sizes';
import {
  userConnectedSelector,
  userIDSelector,
  userInfoSelector,
} from '../../../store/selectors/user';
import {sessionSelector} from '../../../store/selectors/sessions';
import {messagesSelector} from '../../../store/selectors/conversations';

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
      const {id} = this.props.route.params;
      let {notifications} = store.getState().user.infoUser;
      if (!notifications) notifications = [];
      notifications = Object.values(notifications);
      const {userID} = this.props;
      await deleteNotifications(userID, id, notifications);
      updateNotificationBadge(notifications.length);
      this.bindSession();
    });
  };
  bindSession() {
    const {id} = this.props.route.params;
    bindSession(id);
    bindConversation(id);
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
        <View style={{height: heightHeaderHome}} />

        {MyTabs({session, initialMessage, user, messages})}
      </View>
    );
  }
}

const mapStateToProps = (state, props) => {
  const {id} = props.route.params;
  return {
    userID: userIDSelector(state),
    userConnected: userConnectedSelector(state),
    infoUser: userInfoSelector(state),
    session: sessionSelector(state, {id}),
    messages: messagesSelector(state, {id}),
  };
};

export default connect(mapStateToProps)(MessageTab);
