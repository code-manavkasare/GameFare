import React, {Component} from 'react';
import {} from 'react-native';
import {connect} from 'react-redux';
import isEqual from 'lodash.isequal';

import {navigate} from '../../../../../../NavigationService';
import CardStreamView from './CardStreamView';
import {FlatListComponent} from '../../../../layout/Views/FlatList';
import sizes from '../../../../style/sizes';

class ListStreams extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidUpdate(prevProps, prevState) {
    const {coachSessions} = this.props;
    if (prevProps.coachSessions.length === 1 && coachSessions.length === 0)
      return navigate('Messages');
  }
  shouldComponentUpdate(nextProps, nextState) {
    const {coachSessions, userConnected} = this.props;
    if (
      !isEqual(coachSessions, nextProps.coachSessions) ||
      !isEqual(userConnected, nextProps.userConnected) ||
      !isEqual(nextState, this.state)
    )
      return true;
    return false;
  }

  sessionsArray = () => {
    let {coachSessions} = this.props;
    if (!coachSessions) return [];
    return Object.values(coachSessions).sort(function(a, b) {
      return b.timestamp - a.timestamp;
    });
  };
  list = () => {
    const coachSessions = this.sessionsArray();
    const {AnimatedHeaderValue} = this.props;

    return (
      <FlatListComponent
        list={coachSessions}
        AnimatedHeaderValue={AnimatedHeaderValue}
        cardList={({item: session}) => (
          <CardStreamView
            coachSessionID={session.id}
            key={session.id}
            scale={1}
          />
        )}
        numColumns={1}
        inverted={false}
        incrementRendering={6}
        initialNumberToRender={8}
        paddingBottom={sizes.heightFooter + sizes.marginBottomApp}
      />
    );
  };

  render() {
    return this.list();
  }
}

const mapStateToProps = (state) => {
  let coachSessions = state.user.infoUser.coachSessionsRequests;
  if (!coachSessions) coachSessions = [];
  return {
    coachSessions,
    userConnected: state.user.userConnected,
  };
};

export default connect(
  mapStateToProps,
  {},
)(ListStreams);
