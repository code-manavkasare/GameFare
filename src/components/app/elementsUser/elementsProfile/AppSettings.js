import React, {Component} from 'react';
import {View, Text, Animated, Switch} from 'react-native';
import {connect} from 'react-redux';
import StatusBar from '@react-native-community/status-bar';
import {Col, Row} from 'react-native-easy-grid';

import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import {appSettingsAction} from '../../../../actions/appSettingsActions';

import {
  heightFooter,
  heightHeaderHome,
  marginTopAppLanscape,
} from '../../../style/sizes';

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
    const {batterySaver} = this.props;
    return (
      <View style={styleApp.marginView}>
        {/* {this.settingsSwitch(
          batterySaver,
          async () => {
            this.props.appSettingsAction('toggleBatterySaver');
          },
          'Battery saver',
        )} */}
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
          sizeIcon1={16}
          nobackgroundColorIcon1={true}
          initialBorderWidth={1}
          initialBorderColorHeader={colors.white}
          icon1="arrow-left"
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
    batterySaver: state.appSettings.batterySaver,
  };
};

export default connect(
  mapStateToProps,
  {appSettingsAction},
)(AppSettings);
