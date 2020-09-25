import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import Orientation from 'react-native-orientation-locker';
import isEqual from 'lodash.isequal';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import sizes from '../../../style/sizes';

import tabsGroups from '../../../navigation/MainApp/components/GroupsPage';
import HeaderListStream from './components/HeaderListStream';

class StreamTab extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount = () => {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      Orientation.lockToPortrait();
    });
  };
  componentDidUpdate = (prevProps, prevState) => {
    const {coachSessionsRequests, navigation} = this.props;
    console.log(
      'prevProps.coachSessions.length',
      prevProps.coachSessionsRequests.length,
    );
    if (
      prevProps.coachSessionsRequests.length === 1 &&
      coachSessionsRequests.length === 0
    )
      return navigation.navigate('Messages');
    return false;
  };
  shouldComponentUpdate(prevProps, prevState) {
    const {coachSessionsRequests, userConnected} = this.props;
    if (
      !isEqual(coachSessionsRequests, prevProps.coachSessionsRequests) ||
      !isEqual(userConnected, prevProps.userConnected) ||
      !isEqual(prevState, this.state)
    )
      return true;
    return false;
  }
  render() {
    const {userConnected, navigation, coachSessionsRequests} = this.props;
    const tabBarVisible = coachSessionsRequests.length !== 0;
    return (
      <View style={styleApp.stylePage}>
        <HeaderListStream
          userConnected={userConnected}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          hideButtonNewSession={!userConnected}
          onRef={(ref) => (this.HeaderRef = ref)}
          navigation={navigation}
        />
        <View
          style={{
            height: tabBarVisible ? sizes.heightHeaderHome : 0,
          }}
        />

        {tabsGroups({
          tabBarVisible,
          numberSesionRequests: coachSessionsRequests.length,
        })}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  let coachSessionsRequests = state.user.infoUser.coachSessionsRequests;
  if (!coachSessionsRequests) coachSessionsRequests = [];
  coachSessionsRequests = Object.values(coachSessionsRequests);
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    coachSessionsRequests,
  };
};

export default connect(
  mapStateToProps,
  {},
)(StreamTab);
