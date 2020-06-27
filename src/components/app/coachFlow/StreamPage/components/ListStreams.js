import React, {Component} from 'react';
import {View, Text} from 'react-native';
import isEqual from 'lodash.isequal';

import {connect} from 'react-redux';

import CardStreamView from './CardStreamView';
import styleApp from '../../../../style/style';

class ListStreams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coachSessions: false,
    };
    this.itemsRef = [];
  }
  static getDerivedStateFromProps(props, state) {
    if (!isEqual(props.coachSessions, state.coachSessions)) {
      return {
        coachSessions: props.coachSessions,
      };
    }
    return {};
  }
  sessionsArray = () => {
    let {coachSessions} = this.state;
    if (!coachSessions) return [];
    return Object.values(coachSessions).sort(function(a, b) {
      return b.timestamp - a.timestamp;
    });
  };
  list = () => {
    const coachSessions = this.sessionsArray();
    const {userConnected, permissionsCamera} = this.props;
    if (!userConnected || !permissionsCamera || !coachSessions) return null;
    if (Object.values(coachSessions).length === 0)
      return (
        <Text style={[styleApp.text, {paddingLeft: '5%'}]}>
          You don't have any session yet.
        </Text>
      );
    return Object.values(coachSessions).map((session, i) => (
      <CardStreamView coachSessionID={session.id} key={session.id} />
    ));
  };

  render() {
    return this.list();
  }
}

const mapStateToProps = (state) => {
  return {
    coachSessions: state.user.infoUser.coachSessions,
    userConnected: state.user.userConnected,
    sessionInfo: state.coach.sessionInfo,
  };
};

export default connect(
  mapStateToProps,
  {},
)(ListStreams);
