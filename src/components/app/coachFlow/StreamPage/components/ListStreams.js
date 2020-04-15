import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import isEqual from 'lodash.isequal';

import {connect} from 'react-redux';

import StreamView from './StreamView/index';

import {
  heightCardSession,
  marginTopApp,
  width,
  heightHeaderStream,
  offsetBottomHeaderStream,
} from '../../../../style/sizes';
import colors from '../../../../style/colors';

class ListStreams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coachSessions: this.props.coachSessions,
    };
    this.itemsRef = [];
  }
  componentDidMount() {
    // this.props.onRef(this);
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
      return (
        <StreamView
          key={session.id}
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
      );
    });
  };

  render() {
    return (
      <View style={{borderBottomWidth: 1, borderColor: colors.off}}>
        {this.list()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  rowButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // marginTop: 20,
    width: width,
  },
});

const mapStateToProps = (state) => {
  return {
    coachSessions: state.user.infoUser.coachSessions,
  };
};

export default connect(
  mapStateToProps,
  {},
)(ListStreams);
