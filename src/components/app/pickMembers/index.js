import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TextInput,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row, Grid} from 'react-native-easy-grid';
import FadeInView from 'react-native-fade-in-view';
import StatusBar from '@react-native-community/status-bar';
import Orientation from 'react-native-orientation-locker';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import {
  heightHeaderHome,
  marginTopApp,
  marginTopAppLandscape,
} from '../../style/sizes';
import Loader from '../../layout/loaders/Loader';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import PickMembers from './components/PickMembers.js';
import PickMembersHeader from './components/PickMembersHeader.js';

const {height} = Dimensions.get('screen');

export default class PickMembersPage extends React.Component {
  constructor(props) {
    super(props);
    this.focusListener = null;
    this.beforeRemoveListener = null;
  }
  async componentDidMount() {
    const {route, navigation} = this.props;
    const {noUpdateStatusBar} = route.params;
    StatusBar.setBarStyle('dark-content', true);
    this.focusListener = navigation.addListener('focus', () => {
      Orientation.lockToPortrait();
    });
    if (!noUpdateStatusBar) {
      this.beforeRemoveListener = navigation.addListener('beforeRemove', () => {
        StatusBar.setBarStyle('light-content', true);
      });
    }
  }
  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener();
    }
    if (this.beforeRemoveListener) {
      this.beforeRemoveListener();
    }
  }
  async onSelectMembers(members, sessions) {
    const {onSelectMembers, noNavigation} = this.props.route.params;
    onSelectMembers(members, sessions);
    if (!noNavigation) {
      this.close(false);
    }
  }
  close(cancel) {
    const {navigation, route} = this.props;
    const {popNum} = route.params;
    const {pop} = navigation;
    if (cancel) {
      pop();
    } else {
      pop(popNum ? popNum : 1);
    }
  }
  render() {
    const {route} = this.props;
    const {
      titleHeader,
      closeButton,
      icon2,
      text2,
      displayCurrentUser,
      allowSelectMultiple,
      selectFromGamefare,
      selectFromSessions,
      clickButton2,
    } = route.params;
    return (
      <View style={{backgroundColor: colors.white, height: height}}>
        <PickMembersHeader
          title={titleHeader}
          icon1={closeButton ? 'times' : 'arrow-left'}
          clickButton1={() => this.close(true)}
          icon2={icon2}
          text2={text2}
          clickButton2={() => clickButton2()}
          loader={false}
        />
        <PickMembers
          displayCurrentUser={displayCurrentUser}
          allowSelectMultiple={allowSelectMultiple}
          selectFromSessions={selectFromSessions}
          selectFromGamefare={selectFromGamefare}
          onSelectMembers={(members, sessions) =>
            this.onSelectMembers(members, sessions)
          }
        />
      </View>
    );
  }
}
