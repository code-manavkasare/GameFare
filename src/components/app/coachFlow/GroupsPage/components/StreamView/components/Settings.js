import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Switch,
  StatusBar,
} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';

import HeaderBackButton from '../../../../../../layout/headers/HeaderBackButton';

import {
  heightFooter,
  heightHeaderHome,
  marginTopAppLanscape,
} from '../../../../../../style/sizes';

import ScrollView from '../../../../../../layout/scrollViews/ScrollView2';

import colors from '../../../../../../style/colors';
import styleApp from '../../../../../../style/style';
import database from '@react-native-firebase/database';
import {
  userIDSelector,
  userInfoSelector,
  userSettingsSelector,
} from '../../../../../../../store/selectors/user';
import {currentScreenSizeSelector} from '../../../../../../../store/selectors/layout';

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      permissionOtherUserToRecord: this.props.route.params
        .permissionOtherUserToRecord,
      chargeForSession: this.props.route.params.chargeForSession,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  settingsSwitch(value, onValueChange, description) {
    return (
      <Row style={{marginTop: 10}}>
        <Col size={80} style={styleApp.center2}>
          <Text style={styleApp.text}>{description}</Text>
        </Col>
        <Col size={20} style={styleApp.center3}>
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={'white'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={onValueChange}
            value={value}
          />
        </Col>
      </Row>
    );
  }
  settings() {
    let {settings, userID, infoUser, recordingPermission} = this.props;
    if (!settings) {
      settings = {};
    }
    const {permissionOtherUserToRecord, chargeForSession} = this.state;
    const that = this;
    return (
      <View style={styleApp.marginView}>
        {this.settingsSwitch(
          permissionOtherUserToRecord,
          async () => {
            const {coachSessionID} = that.props.route.params;
            await that.setState({
              permissionOtherUserToRecord: !permissionOtherUserToRecord,
            });
            database()
              .ref(`coachSessions/${coachSessionID}/members/${userID}`)
              .update({
                permissionOtherUserToRecord: !permissionOtherUserToRecord,
              });
          },
          'Allow call participants to remotely trigger a recording',
        )}
      </View>
    );
  }

  render() {
    const {currentScreenSize, navigation} = this.props;
    const {portrait} = currentScreenSize;
    let marginTop = heightHeaderHome;
    if (!portrait) {
      marginTop = marginTopAppLanscape + heightHeaderHome;
    }

    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          inputRange={[5, 10]}
          colorLoader={'white'}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          initialBorderColorIcon={colors.white}
          textHeader="Settings"
          sizeLoader={40}
          sizeIcon1={21}
          nobackgroundColorIcon1={true}
          initialBorderWidth={1}
          initialBorderColorHeader={colors.white}
          icon1="chevron-left"
          backgroundColorIcon2={colors.title + '70'}
          sizeIcon2={20}
          typeIcon2="font"
          colorIcon2={colors.white}
          initialTitleOpacity={1}
          clickButton1={() => navigation.goBack()}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.settings()}
          marginBottomScrollView={0}
          marginTop={marginTop}
          offsetBottom={heightFooter + 90}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userID: userIDSelector(state),
    infoUser: userInfoSelector(state),
    currentScreenSize: currentScreenSizeSelector(state),
    settings: userSettingsSelector(state),
    recordingPermission: state.appSettings.recordingPermission,
  };
};

export default connect(mapStateToProps)(Settings);
