import React from 'react';
import {View, Animated} from 'react-native';
import {connect} from 'react-redux';

import {userObject} from '../../functions/users';
import {
  deleteNotifications,
  updateNotificationBadge,
} from '../../functions/notifications.js';

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
    const {coachSessionID} = this.props.route.params;
    const {notifications, userID} = this.props;
    await deleteNotifications(userID, coachSessionID, notifications);
    updateNotificationBadge(this.props.notifications.length);
  };
  render() {
    const {infoUser, userID, navigation, session, route, messages} = this.props;
    const {initialMessage, coachSessionID: objectID} = route.params;
    const {loader} = this.state;
    if (!session) return null;
    const user = userObject(infoUser, userID);
    return (
      <View style={styleApp.stylePage}>
        <HeaderConversation
          navigation={navigation}
          userID={userID}
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
  const {notifications} = state.user.infoUser;
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    infoUser: state.user.infoUser.userInfo,
    session: state.coachSessions[coachSessionID],
    messages: state.conversations[coachSessionID],
    notifications: notifications ? Object.values(notifications) : [],
  };
};

export default connect(
  mapStateToProps,
  {},
)(MessageTab);
