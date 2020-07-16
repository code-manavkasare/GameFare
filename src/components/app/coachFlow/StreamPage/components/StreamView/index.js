import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import {connect} from 'react-redux';
import {
  OTSession,
  OTPublisher,
  OTSubscriber,
  OTSubscriberView,
} from 'gamefare-local-opentok';
import Config from 'react-native-config';
import database from '@react-native-firebase/database';
import KeepAwake from 'react-native-keep-awake';
import isEqual from 'lodash.isequal';
import StatusBar from '@react-native-community/status-bar';
import Orientation from 'react-native-orientation-locker';

const {width} = Dimensions.get('screen');

import Mixpanel from 'react-native-mixpanel';
import {mixPanelToken} from '../../../../../database/firebase/tokens';
Mixpanel.sharedInstanceWithToken(mixPanelToken);

import {navigate} from '../../../../../../../NavigationService';

import Header from './components/Header';
import Loader from '../../../../../layout/loaders/Loader';

import {coachAction} from '../../../../../../actions/coachActions';
import {userAction} from '../../../../../../actions/userActions';
import {layoutAction} from '../../../../../../actions/layoutActions';
import {
  isUserAlone,
  isSomeoneSharingScreen,
  userPartOfSession,
  getVideoSharing,
  getMember,
} from '../../../../../functions/coach';

import {permission} from '../../../../../functions/pictures';

import colors from '../../../../../style/colors';
import styleApp from '../../../../../style/style';
import {
  heightHeaderHome,
  marginTopApp,
  marginTopAppLandscape,
  ratio,
} from '../../../../../style/sizes';

import WatchVideoPage from '../../../WatchVideoPage/index';
import MembersView from './components/MembersView';
import UploadButton from '../../../../elementsUpload/UploadButton';
import Footer from './footer/index';
import axios from 'axios';

class StreamPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      isConnected: false,
      coachSession: false,
      coachSessionID: false,
      error: false,
      cameraFront: true,
      watchVideo: false,
      publishAudio: !__DEV__,
      publishVideo: !__DEV__,
      // videoSource: 'camera',
      open: false,
      portrait: true,
      date: 0,
    };
    this.translateYFooter = new Animated.Value(0);
    this.otSessionRef = React.createRef();
    this.otPublisherRef = React.createRef();
    this.watchVideoRef = React.createRef();

    this.sessionEventHandlers = {
      sessionConnected: (event) => {
        const {coachSessionID} = this.state;
        const {userID} = this.props;
        Mixpanel.trackWithProperties(
          'sessionEventHandlers sessionConnected ' + coachSessionID,
          {
            userID,
            coachSessionID,
            event,
            date: new Date(),
          },
        );
      },
      sessionReconnecting: (event) => {
        // loss of signal, session is trying to reconnect,
        // will either send sessionReconnected or sessionDisconnected after this
        const {coachAction} = this.props;
        coachAction('setCurrentSessionReconnecting', true);
      },
      sessionDisconnected: (event) => {
        // user disconnected from session or loss of signal and could not reconnect
        const {coachAction, reconnecting} = this.props;
        if (reconnecting) {
          Alert.alert('Signal loss, could not connect to session.');
          coachAction('endCurrentSession');
        }
      },
      sessionReconnected: (event) => {
        const {coachAction} = this.props;
        coachAction('setCurrentSessionReconnecting', false);
      },
      error: (event) => {
        // cannot use variables from closure (i.e. coachSessionID) as component may be unmounted when this is called
        console.log(
          'ERROR - StreamView: connecting to session, or session dropped due to an error after successful connection -- ',
          event,
        );
        Mixpanel.trackWithProperties('ERROR: sessionEventHandlers error', {
          event,
          date: new Date(),
        });
      },
      otrnError: (event) => {
        // cannot use variables from closure as component may be unmounted when this is called
        console.log(
          'OTRN ERROR - StreamView: error in communication between native OTSession instance and JS component -- ',
          event,
        );
        Mixpanel.trackWithProperties('ERROR: sessionEventHandlers otrnError ', {
          event,
          date: new Date(),
        });
      },
    };

    this.publisherEventHandlers = {
      streamCreated: async (event) => {
        const {coachSessionID} = this.state;
        const {userID, currentScreenSize} = this.props;
        const {portrait} = currentScreenSize;
        const {streamId, connectionId} = event;
        Mixpanel.trackWithProperties(
          'publisherEventHandlers streamCreated ' + coachSessionID,
          {
            userID,
            coachSessionID,
            streamId,
            connectionId,
            date: new Date(),
          },
        );
        await database()
          .ref(`coachSessions/${coachSessionID}/members/${userID}`)
          .update({
            streamIdTokBox: streamId,
            connectionIdTokbox: connectionId,
            connectionTimeStamp: Date.now(),
            portrait: portrait,
            isConnected: true,
            recording: {enabled: true},
          });
        this.setState({
          isConnected: true,
        });
      },
      streamDestroyed: (event) => {
        const {coachSessionID} = this.state;
        const {userID} = this.props;
        const {streamId, connectionId} = event;
        Mixpanel.trackWithProperties(
          'publisherEventHandlers streamDestroyed ' + coachSessionID,
          {
            userID,
            coachSessionID,
            streamId,
            connectionId,
            date: new Date(),
          },
        );
      },
    };
  }
  componentDidMount() {
    const {navigation} = this.props;
    this.refreshTokenMember();
    this.focusListener = navigation.addListener('focus', () => {
      Orientation.unlockAllOrientations();
    });
  }

  static getDerivedStateFromProps(props, state) {
    let newState = {date: Date.now()};
    if (!isEqual(props.currentSession, state.coachSession))
      newState = {
        ...newState,
        coachSession: props.currentSession,
        open: props.currentSession ? true : false,
        coachSessionID: props.currentSessionID,
      };
    return newState;
  }

  componentDidUpdate(prevProps, prevState) {
    const unrenderConditionPrev =
      !prevProps.recording && prevProps.endCurrentSession;
    const unrenderConditionThis =
      !this.props.recording && this.props.endCurrentSession;
    if (!unrenderConditionPrev && unrenderConditionThis) {
      this.endCoachSession();
    } else {
      const {isConnected} = this.state;
      const {
        userID,
        currentSessionID,
        userConnected,
        currentScreenSize,
      } = this.props;
      const {portrait} = currentScreenSize;
      if (portrait !== prevProps.currentScreenSize.portrait && isConnected) {
        database()
          .ref(`coachSessions/${currentSessionID}/members/${userID}`)
          .update({
            portrait: portrait,
          });
      }
      if (userConnected) {
        if (prevState.date !== this.state.date && this.state.open) {
          this.popupPermissionRecording();
          this.refreshTokenMember();
        }
        if (
          !isEqual(prevState.coachSession, this.state.coachSession) &&
          this.state.coachSession
        ) {
          this.refreshTokenMember();
          this.openVideoShared();
        }
      }
    }
  }
  async permissionLibrary() {}
  popupPermissionRecording() {
    let {userID, currentSessionID: coachSessionID} = this.props;
    const {coachSession} = this.state;

    const member = getMember(coachSession, userID);
    if (!member) return;
    const {permissionOtherUserToRecord} = member;
    const setPermission = (nextVal) => {
      permission('library');
      return database()
        .ref(`coachSessions/${coachSessionID}/members/${userID}`)
        .update({
          permissionOtherUserToRecord: nextVal,
        });
    };
    if (permissionOtherUserToRecord === undefined && coachSessionID)
      return navigate('Alert', {
        textButton: 'Allow',
        title:
          'Allow participants to trigger a recording on your phone during this call?',
        displayList: true,

        listOptions: [
          {
            operation: () => setPermission(false),
          },
          {
            operation: () => setPermission(true),
          },
        ],
      });
  }
  async refreshTokenMember() {
    const {coachSession} = this.state;
    const {currentSessionID: coachSessionID, userID} = this.props;
    const member = getMember(coachSession, userID);

    if (!member || !coachSession) return;

    if (
      coachSession.vonageSessionId &&
      (member.expireTimeToken < Date.now() || !member.expireTimeToken)
    ) {
      var url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}updateSessionTokenUser`;
      await axios.get(url, {
        params: {
          coachSessionID,
          userID,
          coachSessionIDOpentok: coachSession.vonageSessionId,
          isOrganizer: (coachSession.info.organizer === userID).toString(),
        },
      });
    }
  }
  openVideoShared() {
    const {coachSession} = this.state;
    const {userID} = this.props;
    const personSharingScreen = isSomeoneSharingScreen(coachSession);
    if (personSharingScreen && userID !== personSharingScreen) {
      const video = getVideoSharing(coachSession, personSharingScreen);
      this.watchVideoRef.open({
        watchVideo: true,
        ...video,
      });
    }
  }
  async endCoachSession() {
    await this.setState({open: false, isConnected: false, coachSession: false});
    const {coachSessionID, userID, coachAction} = this.props;
    Mixpanel.trackWithProperties('End Session ' + coachSessionID, {
      userID,
      coachSessionID,
      date: new Date(),
    });
    await coachAction('unsetCurrentSession');
    this.close();
    return true;
  }
  close() {
    const {layoutAction} = this.props;
    layoutAction('setLayout', {isFooterVisible: true});
    StatusBar.setBarStyle('dark-content', true);
    navigate('Stream');
  }
  loaderView(text, hideLoader) {
    const styleText = {
      ...styleApp.textBold,
      color: colors.white,
      fontSize: 20,
      marginBottom: 25,
    };
    return (
      <View style={[styleApp.center, styles.loaderSessionTokBox]}>
        {<Text style={styleText}>{text}</Text>}
        {!hideLoader && <Loader size={55} color={colors.white} />}
      </View>
    );
  }
  cameraPosition() {
    const {cameraFront} = this.state;
    if (cameraFront) return 'front';
    return 'back';
  }
  renderSubscribers = (subscribers) => {
    const {coachSession} = this.state;
    const {
      currentHeight,
      currentWidth,
      portrait,
    } = this.props.currentScreenSize;
    return subscribers.map((streamId, index) => {
      const member = Object.values(coachSession.members).filter(
        (member) => member.streamIdTokBox === streamId,
      )[0];

      let ratioVideo = ratio(16, 9);
      if (member?.portrait) ratioVideo = ratio(9, 16);

      let styleSubscriber = {
        ...styleApp.center,
        height: currentHeight / subscribers.length,
        width: currentWidth,
        top: index * (currentHeight / subscribers.length),
        position: 'absolute',
        backgroundColor: colors.title,
      };
      if (!portrait)
        styleSubscriber = {
          ...styleApp.center,
          height: currentHeight,
          width: currentWidth / subscribers.length,
          left: index * (currentWidth / subscribers.length),
          position: 'absolute',
          backgroundColor: colors.title,
        };
      const ratioScreen = ratio(styleSubscriber.width, styleSubscriber.height);
      let w = styleSubscriber.width;
      let h = styleSubscriber.width * ratioVideo;
      if (ratioScreen < ratioVideo) {
        h = styleSubscriber.height;
        w = styleSubscriber.height / ratioVideo;
      }
      return (
        <View key={streamId} style={styleSubscriber}>
          <OTSubscriberView streamId={streamId} style={{width: w, height: h}} />
        </View>
      );
    });
  };
  pausedView(userIsAlone) {
    let style = this.stylePublisher(userIsAlone);

    style = {
      ...style,
      backgroundColor: colors.greyDark,
      ...styleApp.center,
      zIndex: 2,
    };

    let styleTextAlone = {};
    if (!userIsAlone)
      styleTextAlone = {
        fontSize: 9,
        marginBottom: 27,
      };

    return (
      <View style={style}>
        <Text
          style={[styleApp.textBold, styleTextAlone, {color: colors.white}]}>
          Paused
        </Text>
      </View>
    );
  }
  stylePublisher(userIsAlone) {
    if (userIsAlone) return styles.OTPublisherAlone;

    const {portrait} = this.props.currentScreenSize;
    let marginTop = marginTopApp;
    if (!portrait) marginTop = marginTopAppLandscape;
    return {
      ...styles.OTSubscriberNotAlone,
      top: marginTop + (heightHeaderHome - 48) / 2,
    };
  }
  streamPage() {
    const {
      coachSession,
      isConnected,
      publishAudio,
      publishVideo,
      coachSessionID,
    } = this.state;
    const {userID, reconnecting} = this.props;
    const personSharingScreen = isSomeoneSharingScreen(coachSession);
    const videoBeingShared = getVideoSharing(coachSession, personSharingScreen);
    if (!coachSession.tokbox) return null;

    const {sessionID} = coachSession.tokbox;
    if (!sessionID) return this.loaderView('Room creation');

    const member = userPartOfSession(coachSession, userID);

    let userIsAlone = isUserAlone(coachSession);
    const cameraPosition = this.cameraPosition();
    return (
      <View style={styleApp.fullSize}>
        {!member
          ? this.loaderView('You are not a member of this conversation', true)
          : !isConnected
          ? this.loaderView('Connecting')
          : null}

        <MembersView
          members={coachSession.members}
          coachSessionID={coachSessionID}
        />
        {!publishVideo && this.pausedView(userIsAlone)}
        <View style={styleApp.fullSize}>
          {member.tokenTokbox && (
            <OTSession
              apiKey={Config.OPENTOK_API}
              ref={this.otSessionRef}
              eventHandlers={this.sessionEventHandlers}
              sessionId={sessionID}
              token={member.tokenTokbox}>
              <OTPublisher
                ref={this.otPublisherRef}
                style={this.stylePublisher(userIsAlone)}
                properties={{
                  cameraPosition,
                  videoSource: 'camera',
                  publishAudio: publishAudio,
                  publishVideo: publishVideo,
                }}
                eventHandlers={this.publisherEventHandlers}
              />
              <OTSubscriber style={styles.OTSubscriber}>
                {this.renderSubscribers}
              </OTSubscriber>
            </OTSession>
          )}
        </View>

        <Footer
          translateYFooter={this.translateYFooter}
          setState={this.setState.bind(this)}
          watchVideoRef={this.watchVideoRef}
          otPublisherRef={this.otPublisherRef}
          personSharingScreen={personSharingScreen}
          videoBeingShared={videoBeingShared}
          onRef={(ref) => (this.footerRef = ref)}
          members={coachSession.members}
          coachSessionID={coachSessionID}
          publishAudio={publishAudio}
          publishVideo={publishVideo}
        />
        {reconnecting && (
          <View
            style={[
              styleApp.center,
              styleApp.fullSize,
              {position: 'absolute'},
            ]}>
            <Loader size={55} color={colors.white} />
          </View>
        )}
      </View>
    );
  }
  session() {
    const {userConnected, currentSessionID, userID} = this.props;
    const {coachSession, isConnected, open, coachSessionID} = this.state;
    if (!userConnected || !currentSessionID) return null;

    const {currentScreenSize} = this.props;
    const personSharingScreen = isSomeoneSharingScreen(coachSession);
    const videoBeingShared = getVideoSharing(coachSession, personSharingScreen);
    if (!open) return null;
    return (
      <View style={styleApp.stylePage}>
        <KeepAwake />

        <Header
          coachSessionID={coachSessionID}
          organizerID={coachSession && coachSession?.info.organizer}
          close={this.close.bind(this)}
          permissionOtherUserToRecord={
            coachSession
              ? getMember(coachSession, userID)?.permissionOtherUserToRecord
              : false
          }
          chargeForSession={getMember(coachSession, userID)?.chargeForSession}
          setState={this.setState.bind(this)}
          state={this.state}
        />

        {isConnected && (
          <UploadButton
            backdrop
            style={{
              ...styles.uploadButton,
              top: currentScreenSize.portrait
                ? marginTopApp + 55
                : marginTopAppLandscape + 75,
            }}
            expandableView
            expandableViewStyle={{
              width: currentScreenSize.currentWidth * 0.7,
              minHeight: 150,
            }}
          />
        )}

        <View style={styles.viewStream}>{this.streamPage()}</View>

        <WatchVideoPage
          state={this.state}
          onRef={(ref) => (this.watchVideoRef = ref)}
          translateYFooter={this.translateYFooter}
          setState={this.setState.bind(this)}
          personSharingScreen={personSharingScreen}
          videoBeingShared={videoBeingShared}
          sharedVideos={coachSession.sharedVideos}
          coachSessionID={coachSessionID}
        />

        {/* {loader && this.loaderView(' ')} */}
      </View>
    );
  }
  render() {
    return this.session();
  }
}

const styles = StyleSheet.create({
  viewStream: {
    ...styleApp.fullSize,
    position: 'absolute',
    zIndex: -1,
  },
  pausedView: {
    height: '100%',
    width: '100%',
    //  backgroundColor: colors.grey,
    ...styleApp.center,
  },
  OTSubscriber: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 8,
  },
  OTSubscriberNotAlone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'absolute',
    right: '5%',
    zIndex: 4,
  },
  OTPublisherAlone: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    zIndex: -10,
  },
  loaderSessionTokBox: {
    height: '100%',
    backgroundColor: colors.primary2,
    width: '100%',
    zIndex: 10,
    opacity: 1,
  },
  loaderView: {
    height: '100%',
    width: width,
    backgroundColor: colors.red,
    opacity: 0.4,
    zIndex: 30,
    position: 'absolute',
  },
  uploadButton: {
    height: heightHeaderHome,
    paddingLeft: '5%',
    paddingRight: '5%',
    position: 'absolute',
    zIndex: 15,
    width: '100%',
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    currentScreenSize: state.layout.currentScreenSize,
    currentSessionID: state.coach.currentSessionID,
    currentSession: state.coach.currentSession,
    endCurrentSession: state.coach.endCurrentSession,
    recording: state.coach.recording,
    reconnecting: state.coach.reconnecting,
  };
};

export default connect(
  mapStateToProps,
  {
    coachAction,
    userAction,
    layoutAction,
  },
)(StreamPage);
