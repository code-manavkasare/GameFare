import React, {Component} from 'react';
import {View, Text, Animated, Switch, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import database from '@react-native-firebase/database';

import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import AllIcons from '../../../layout/icons/AllIcons';
import {appSettingsAction} from '../../../../store/actions/appSettingsActions';
import {toggleUserPublic} from '../../../functions/users';

import {heightFooter, heightHeaderModal} from '../../../style/sizes';

import ScrollView from '../../../layout/scrollViews/ScrollView2';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import {
  isPrivateSelector,
  permissionOtherUserToRecordSelector,
  userIDSelector,
} from '../../../../store/selectors/user';
import {wifiAutoUploadSelector} from '../../../../store/selectors/appSettings';

class AppSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  settingsSwitch(value, onValueChange, description, moreInfo) {
    const {navigation} = this.props;
    return (
      <Row style={{paddingTop: 10, paddingBottom: 10}}>
        <Col size={70} style={styleApp.center2}>
          <Text style={styleApp.text}>{description}</Text>
        </Col>
        <Col size={10} style={styleApp.center}>
          {moreInfo ? (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styleApp.fullSize, styleApp.center]}
              onPress={() => navigation.navigate('Alert', moreInfo)}>
              <AllIcons
                name="info-circle"
                type="font"
                size={20}
                color={colors.secondary}
              />
            </TouchableOpacity>
          ) : null}
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
  setPermission = (nextVal) => {
    const {userID} = this.props;
    return database()
      .ref(`users/${userID}/`)
      .update({
        permissionOtherUserToRecord: nextVal,
      });
  };
  toggleAutoUpload = () => {
    const {wifiAutoUpload, userID, appSettingsAction} = this.props;
    database()
      .ref(`users/${userID}/appSettings/`)
      .update({
        wifiAutoUpload: !wifiAutoUpload,
      });
    return appSettingsAction('toggleWifiAutoUpload');
  };
  settings() {
    const {wifiAutoUpload, isPrivate, permissionOtherUserToRecord} = this.props;
    return (
      <View style={styleApp.marginView}>
        {this.settingsSwitch(
          wifiAutoUpload,
          async () => this.toggleAutoUpload(),
          'Auto upload local videos',
        )}
        {this.settingsSwitch(
          permissionOtherUserToRecord,
          async () => this.setPermission(!permissionOtherUserToRecord),
          'Allow participants to trigger a recording on your phone during video calls?',
        )}
        {this.settingsSwitch(
          !isPrivate,
          async () => toggleUserPublic(),
          'Public profile',
          {
            title: 'Public profile',
            subtitle:
              "Anyone will be able to look for your profile and contact you. If you set your profile as private, you'll have to accept the requests first.",
            textButton: 'Got it!',
            colorButton: 'secondary',
            onPressColor: colors.secondary,
            close: true,
          },
        )}
      </View>
    );
  }

  render() {
    const {navigation} = this.props;
    return (
      <View style={[styleApp.stylePage]}>
        <HeaderBackButton
          marginTop={10}
          inputRange={[0, 20]}
          colorLoader={'white'}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          initialBorderColorIcon={colors.white}
          textHeader="Settings"
          sizeLoader={40}
          sizeIcon1={17}
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
          marginTop={heightHeaderModal + 5}
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
    isPrivate: isPrivateSelector(state),
    permissionOtherUserToRecord: permissionOtherUserToRecordSelector(state),
    wifiAutoUpload: wifiAutoUploadSelector(state),
  };
};

export default connect(
  mapStateToProps,
  {appSettingsAction},
)(AppSettings);
