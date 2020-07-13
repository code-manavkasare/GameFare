import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions, Animated} from 'react-native';
import {connect} from 'react-redux';
import StatusBar from '@react-native-community/status-bar';
import database from '@react-native-firebase/database';
import Orientation from 'react-native-orientation-locker';

import {coachAction} from '../../../../actions/coachActions';
import {layoutAction} from '../../../../actions/layoutActions';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import {heightFooter, heightHeaderHome} from '../../../style/sizes';
import ScrollView from '../../../layout/scrollViews/ScrollView2';

import LogoutView from './components/LogoutView';
import PermissionView from './components/PermissionView';

import ListStreams from './components/ListStreams';
import Loader from '../../../layout/loaders/Loader';
import HeaderListStream from './components/HeaderListStream';
import ButtonNotification from '../../elementsUser/elementsProfile/ButtonNotification';

class StreamTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      permissionsCamera: false,
      initialLoader: true,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.openSession = this.openSession.bind(this);
  }
  componentDidMount = () => {
    const {navigation} = this.props;
    const {params} = this.props.route;
    if (params?.objectID) this.openSession(params.objectID);
    this.focusListener = navigation.addListener('focus', () => {
      Orientation.lockToPortrait();
    });
  };
  componentDidUpdate = (prevProps, prevState) => {
    const {params} = this.props.route;
    if (prevProps.route.params?.date !== params?.date && params?.date)
      this.openSession(params.objectID);
  };
  openSession = async (objectID) => {
    const {
      currentSessionID,
      navigation,
      layoutAction,
      coachAction,
    } = this.props;
    const {navigate} = navigation;
    if (currentSessionID !== objectID) {
      let session = await database()
        .ref(`coachSessions/${objectID}`)
        .once('value');
      session = session.val();
      await coachAction('setCurrentSession', false);
      await coachAction('setCurrentSession', session);
    }

    await layoutAction('setLayout', {isFooterVisible: false});
    StatusBar.setBarStyle('light-content', true);
    navigate('Session', {
      screen: 'Session',
      params: {coachSessionID: objectID, date: Date.now()},
    });
  };
  viewLoader = () => {
    return (
      <View style={[{height: 120}, styleApp.center]}>
        <Loader size={55} color={colors.primary} />
      </View>
    );
  };
  StreamTab = (currentHeight) => {
    const {permissionsCamera, initialLoader} = this.state;
    return (
      <View style={[styles.containerTabPage, {minHeight: currentHeight - 100}]}>
        <ButtonNotification displayBeforeLoader={true} />
        {initialLoader && this.viewLoader()}

        {!permissionsCamera ? (
          <PermissionView
            initialLoader={initialLoader}
            setState={this.setState.bind(this)}
          />
        ) : null}
        <ListStreams
          permissionsCamera={permissionsCamera}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          newSession={() => this.HeaderRef.newSession()}
        />
      </View>
    );
  };

  render() {
    const {permissionsCamera} = this.state;
    const {currentScreenSize, userConnected} = this.props;
    const {currentHeight} = currentScreenSize;
    if (!userConnected) return <LogoutView />;
    return (
      <View style={styleApp.stylePage}>
        <HeaderListStream
          userConnected={userConnected}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          hideButtonNewSession={!userConnected || !permissionsCamera}
          onRef={(ref) => (this.HeaderRef = ref)}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.StreamTab(currentHeight)}
          marginBottomScrollView={0}
          marginTop={heightHeaderHome}
          offsetBottom={heightFooter + 90}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerTabPage: {
    ...styleApp.fullSize,
    paddingTop: 10,
  },
  titlePage: {
    ...styleApp.title,
    color: colors.title,
    marginBottom: 10,
    marginLeft: 20,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    userConnected: state.user.userConnected,
    currentScreenSize: state.layout.currentScreenSize,
    currentSessionID: state.coach.currentSessionID,
  };
};

export default connect(
  mapStateToProps,
  {coachAction, layoutAction},
)(StreamTab);
