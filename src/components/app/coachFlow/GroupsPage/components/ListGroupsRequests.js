import React, {Component} from 'react';
import {} from 'react-native';
import {connect} from 'react-redux';

import {navigate} from '../../../../../../NavigationService';
import CardStreamView from './CardStreamView';
import {FlatListComponent} from '../../../../layout/Views/FlatList';
import {heightFooter, marginBottomApp} from '../../../../style/sizes';
import {boolShouldComponentUpdate} from '../../../../functions/redux';
import {sessionsRequestsSelector} from '../../../../../store/selectors/sessions';
import {userConnectedSelector} from '../../../../../store/selectors/user';

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
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'ListGroupsrequests',
    });
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
        paddingBottom={heightFooter + marginBottomApp}
      />
    );
  };

  render() {
    return this.list();
  }
}

const mapStateToProps = (state) => {
  return {
    coachSessions: sessionsRequestsSelector(state),
    userConnected: userConnectedSelector(state),
  };
};

export default connect(mapStateToProps)(ListStreams);
