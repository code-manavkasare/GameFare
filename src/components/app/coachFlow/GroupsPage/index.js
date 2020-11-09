import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import Orientation from 'react-native-orientation-locker';
import isEqual from 'lodash.isequal';

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
  };
  shouldComponentUpdate(prevProps, prevState) {
    const {coachSessionsRequests} = this.props;
    if (
      !isEqual(coachSessionsRequests, prevProps.coachSessionsRequests) ||
      !isEqual(prevState, this.state)
    )
      return true;
    return false;
  }
  render() {
    const {navigation, coachSessionsRequests} = this.props;
    const tabBarVisible = coachSessionsRequests.length !== 0;
    return (
      <View style={styleApp.stylePage}>
        <HeaderListStream
          AnimatedHeaderValue={this.AnimatedHeaderValue}
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
          AnimatedHeaderValue:
            coachSessionsRequests.length === 0 && this.AnimatedHeaderValue,
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
    coachSessionsRequests,
  };
};

export default connect(
  mapStateToProps,
  {},
)(StreamTab);
