import React, {Component} from 'react';
import {View, Text, Animated, Switch, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';

import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import AllIcons from '../../../layout/icons/AllIcons';
import {appSettingsAction} from '../../../../actions/appSettingsActions';
import {toggleUserPublic} from '../../../functions/users';

import {heightFooter, heightHeaderHome} from '../../../style/sizes';

import ScrollView from '../../../layout/scrollViews/ScrollView2';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';

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
          {moreInfo && (
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
          )}
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
    const {wifiAutoUpload, isPrivate, appSettingsAction} = this.props;
    return (
      <View style={styleApp.marginView}>
        {this.settingsSwitch(
          wifiAutoUpload,
          async () => appSettingsAction('toggleWifiAutoUpload'),
          'Auto upload local videos',
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
  async save() {
    this.back();
  }
  back() {
    const {goBack} = this.props.navigation;
    goBack();
  }
  render() {
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
          clickButton1={() => this.back()}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.settings()}
          marginBottomScrollView={0}
          marginTop={heightHeaderHome}
          offsetBottom={heightFooter + 90}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    isPrivate: state.user.infoUser.userInfo.isPrivate,
    wifiAutoUpload: state.appSettings.wifiAutoUpload,
  };
};

export default connect(
  mapStateToProps,
  {appSettingsAction},
)(AppSettings);
