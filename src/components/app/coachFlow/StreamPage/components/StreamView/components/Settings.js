import React, {Component} from 'react';
import {View, Text, Image, StyleSheet, Animated, Switch} from 'react-native';
import {connect} from 'react-redux';
import StatusBar from '@react-native-community/status-bar';
import {Col, Row} from 'react-native-easy-grid';
import FadeInView from 'react-native-fade-in-view';

import HeaderBackButton from '../../../../../../layout/headers/HeaderBackButton';
import {coachAction} from '../../../../../../../actions/coachActions';

import {
  heightFooter,
  heightHeaderHome,
  marginTopAppLanscape,
} from '../../../../../../style/sizes';

import ScrollView from '../../../../../../layout/scrollViews/ScrollView2';
import Button from '../../../../../../layout/buttons/Button';

import colors from '../../../../../../style/colors';
import styleApp from '../../../../../../style/style';
import AsyncImage from '../../../../../../layout/image/AsyncImage';
import ButtonColor from '../../../../../../layout/Views/Button';
import AllIcon from '../../../../../../layout/icons/AllIcons';
import Loader from '../../../../../../layout/loaders/Loader';
import database from '@react-native-firebase/database';

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      permissionOtherUserToRecord: this.props.route.params
        .permissionOtherUserToRecord,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    StatusBar.setBarStyle('dark-content', true);
    // this.getCourtCalibration();'
    console.log('routes', this.props.route);
  }
  settings() {
    let {settings, userID} = this.props;
    if (!settings) settings = {};
    const {permissionOtherUserToRecord} = this.state;
    return (
      <View style={styleApp.marginView}>
        <Row>
          <Col size={80} style={styleApp.center2}>
            <Text style={styleApp.text}>
              Allow call participants to remotely trigger a recording
            </Text>
          </Col>
          <Col size={20} style={styleApp.center3}>
            <Switch
              trackColor={{false: '#767577', true: '#81b0ff'}}
              thumbColor={'white'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={async () => {
                const {coachSessionID} = this.props.route.params;
                await this.setState({
                  permissionOtherUserToRecord: !permissionOtherUserToRecord,
                });
                database()
                  .ref(`coachSessions/${coachSessionID}/members/${userID}`)
                  .update({
                    permissionOtherUserToRecord: !permissionOtherUserToRecord,
                  });
              }}
              value={permissionOtherUserToRecord}
            />
          </Col>
        </Row>
      </View>
    );
  }
  async save() {
    this.back();
  }
  back() {
    const {goBack} = this.props.navigation;
    StatusBar.setBarStyle('light-content', true);
    goBack();
  }
  render() {
    const {currentScreenSize} = this.props;
    const {portrait} = currentScreenSize;
    let marginTop = heightHeaderHome;
    if (!portrait) marginTop = marginTopAppLanscape + heightHeaderHome;

    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          inputRange={[5, 10]}
          colorLoader={'white'}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          initialBorderColorIcon={colors.white}
          //   colorIcon1={colors.greyDark}
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
          marginTop={marginTop}
          offsetBottom={heightFooter + 90}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    currentScreenSize: state.layout.currentScreenSize,
    settings: state.user.infoUser.settings,
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(Settings);
