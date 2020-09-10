import React from 'react';
import {View, Animated} from 'react-native';
import {connect} from 'react-redux';

import {deleteNotification} from '../../../actions/notificationsActions.js';

import {userObject} from '../../functions/users';

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
  componentDidMount() {
    const {coachSessionID} = this.props.route.params;
    const {deleteNotification} = this.props;
    deleteNotification(coachSessionID);
  }
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
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    infoUser: state.user.infoUser.userInfo,
    session: state.coachSessions[coachSessionID],
    messages: state.conversations[coachSessionID],
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    deleteNotification: (coachSessionID) => {
      dispatch(deleteNotification(coachSessionID));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MessageTab);
