import React from 'react';
import {View, Animated} from 'react-native';
import {connect} from 'react-redux';

import {messageAction} from '../../../actions/messageActions';

import ListMessages from './ListMessages';
import {userObject} from '../../functions/users';

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

  async setConversation(data) {
    await this.props.messageAction('setConversation', data);
  }

  render() {
    const {infoUser, userID, navigation, session, route} = this.props;
    const {initialMessage} = route.params;
    const {loader} = this.state;
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

        <ListMessages
          navigation={navigation}
          user={user}
          session={session}
          objectID={session.objectID}
          onRef={(ref) => (this.conversationRef = ref)}
          initialMessage={initialMessage ? initialMessage : ''}
        />
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
  };
};

export default connect(
  mapStateToProps,
  {messageAction},
)(MessageTab);
