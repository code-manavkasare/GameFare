import React, {Component} from 'react';
import {View, Text, Image} from 'react-native';

import {connect} from 'react-redux';
import isEqual from 'lodash.isequal';

import {navigate} from '../../../../../../NavigationService';
import CardStreamView from './CardStreamView';
import {FlatListComponent} from '../../../../layout/Views/FlatList';
import {newSession} from '../../../../functions/coach';
import styleApp from '../../../../style/style';
import colors from '../../../../style/colors';
import sizes from '../../../../style/sizes';
import Button from '../../../../layout/buttons/Button';

class ListStreams extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.itemsRef = [];
  }
  shouldComponentUpdate(prevProps, prevState) {
    const {coachSessions, userConnected} = this.props;
    if (
      !isEqual(coachSessions, prevProps.coachSessions) ||
      !isEqual(userConnected, prevProps.userConnected) ||
      !isEqual(prevState, this.state)
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
    const styleViewLiveLogo = {
      ...styleApp.center,
      backgroundColor: colors.off,
      height: 45,
      width: 45,
      borderRadius: 22.5,
      borderWidth: 1,
      borderColor: colors.grey,
      marginTop: -100,
      marginLeft: 65,
    };
    const coachSessions = this.sessionsArray();
    const {userConnected} = this.props;
 
  
    return (
      <FlatListComponent
        list={coachSessions}
        cardList={({item: session}) => (
          <CardStreamView
            coachSessionID={session.id}
            key={session.id}
            scale={1}
            onRef={(ref) => this.itemsRef.push(ref)}
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
