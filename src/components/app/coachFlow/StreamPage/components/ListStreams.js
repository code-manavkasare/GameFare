import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import isEqual from 'lodash.isequal';

import {connect} from 'react-redux';

import StreamView from './StreamView/index';

import {
  heightCardSession,
  marginTopApp,
  width,
  height,
  heightHeaderStream,
  offsetBottomHeaderStream,
} from '../../../../style/sizes';
import styleApp from '../../../../style/style';

class ListStreams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coachSessions: this.props.coachSessions,
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

  openSession(objectID) {
    this.itemsRef[objectID].open();
  }
  sessionsArray = () => {
    let {coachSessions} = this.state;
    if (!coachSessions) coachSessions = {};
    return Object.values(coachSessions).sort(function(a, b) {
      return b.timestamp - a.timestamp;
    });
  };

  list = () => {
    const coachSessions = this.sessionsArray();
    const {AnimatedHeaderValue} = this.props;
    console.log('render list coach Sessions', coachSessions);
    return Object.values(coachSessions).map((session, i) => {
      const {sessionInfo} = this.props;
      const {objectID} = sessionInfo;
      const zIndex = objectID === session.id ? 20 : 0;
      return (
        <View key={session.id} style={{position: 'relative', zIndex: zIndex}}>
          <StreamView
            index={Number(i)}
            offsetScrollView={
              marginTopApp + heightHeaderStream + offsetBottomHeaderStream
            }
            heightCardSession={heightCardSession}
            coachSessionID={session.id}
            timestamp={session.timestamp}
            getScrollY={() => {
              return AnimatedHeaderValue._value;
            }}
            closeCurrentSession={async (currentSessionID) => {
              return this.itemsRef[currentSessionID].endCoachSession();
            }}
            onRef={(ref) => (this.itemsRef[session.id] = ref)}
          />
        </View>
      );
    });
  };

  render() {
    return (
      <View>
        {this.list()}
        <View style={[styleApp.divider2, {width: '100%'}]} />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    coachSessions: state.user.infoUser.coachSessions,
    sessionInfo: state.coach.sessionInfo,
    ListStreams,
  };
};

export default connect(
  mapStateToProps,
  {},
)(ListStreams);
