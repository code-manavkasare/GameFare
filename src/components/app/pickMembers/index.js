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
  onSelectMembers(members, contacts) {
    const {onSelectMembers} = this.props.route.params;
    onSelectMembers(members, contacts);
    this.close();
  }
  close() {
    const {pop} = this.props.navigation;
    pop();
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
      allowSelectContacts,
    } = route.params;
    return (
      <View style={{backgroundColor: colors.white, height: height}}>
        <PickMembersHeader
          title={titleHeader}
          icon1={closeButton ? 'times' : 'arrow-left'}
          clickButton1={() => this.close()}
          icon2={icon2}
          text2={text2}
          clickButton2={() => clickButton2()}
          loader={false}
        />
        <PickMembers
          displayCurrentUser={displayCurrentUser}
          allowSelectMultiple={allowSelectMultiple}
          allowSelectContacts={allowSelectContacts}
          onSelectMembers={(members, contacts) => this.onSelectMembers(members, contacts)}
        />
      </View>
    );
  }
}
