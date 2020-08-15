import React, {Component} from 'react';
import {Text, StyleSheet, View, Animated} from 'react-native';
import moment from 'moment';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {connect} from 'react-redux';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import sizes from '../../../style/sizes';
import {goBack} from '../../../../../NavigationService';

import ScrollView from '../../../layout/scrollViews/ScrollView2';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

import isEqual from 'lodash.isequal';

class SessionSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {loader: false};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  settings() {
    const {session, messages} = this.props;
    return (
      <View>
        <Text>{session.objectID}</Text>
      </View>
    );
  }
  render() {
    const {loader} = this.state;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[20, 25]}
          loader={loader}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          initialBorderWidth={1}
          icon1={'arrow-left'}
          sizeIcon1={17}
          clickButton1={() => goBack()}
          icon2={null}
          text2={'Select'}
          typeIcon2={'font'}
          sizeIcon2={17}
          clickButton2={() => true}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.settings()}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={30}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const mapStateToProps = (state, props) => {
  const {objectID} = props.route.params;
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    infoUser: state.user.infoUser.userInfo,
    session: state.coachSessions[objectID],
    messages: state.conversations[objectID],
  };
};

export default connect(
  mapStateToProps,
  {},
)(SessionSettings);
