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

  collapseAll = () => {
    for (var i in this.itemsRef) {
      let item = this.itemsRef[i]
      try { item.expand(0) } catch (e) { }
    }
  }

  list = () => {
    const coachSessions = this.sessionsArray();
    const {userConnected, permissionsCamera} = this.props;
    if (!userConnected || !permissionsCamera || !coachSessions) return null;
    if (Object.values(coachSessions).length === 0)
      return (
        <Text style={[styleApp.text, {paddingLeft: '5%'}]}>
          You don't have any sessions yet.
        </Text>
      );
    return Object.values(coachSessions).map((session, i) => (
      <CardStreamView 
        coachSessionID={session.id} 
        key={session.id} 
        scale={1.1}
        collapseAll={this.collapseAll.bind(this)}
        onRef = {(ref) => (this.itemsRef.push(ref))}
      />
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
