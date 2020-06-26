import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
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

let coachSession = require('./components/testSession.json');
import StatusBar from '@react-native-community/status-bar';

const {height, width} = Dimensions.get('screen');

import Mixpanel from 'react-native-mixpanel';
import {mixPanelToken} from '../../../../../database/firebase/tokens';
Mixpanel.sharedInstanceWithToken(mixPanelToken);

import {navigate} from '../../../../../../../NavigationService';

import Header from './components/Header';
import Loader from '../../../../../layout/loaders/Loader';
import {native, openStream} from '../../../../../animations/animations';

import {coachAction} from '../../../../../../actions/coachActions';
import {userAction} from '../../../../../../actions/userActions';
import {layoutAction} from '../../../../../../actions/layoutActions';
import {
  isUserAlone,
  isSomeoneSharingScreen,
  userPartOfSession,
  getVideoSharing,
  timeout,
} from '../../../../../functions/coach';

import colors from '../../../../../style/colors';
import styleApp from '../../../../../style/style';
import {
  heightHeaderHome,
  heightCardSession,
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
      coachSession: coachSession,
      error: false,
      cameraFront: true,
      watchVideo: false,
      publishAudio: !__DEV__,
      publishVideo: !__DEV__,
      pageFullScreen: false,
      open: false,
      coordinates: {x: 0, y: 0},
      portrait: true,
      sessionInfo: this.props.sessionInfo,
    };
    this.translateYFooter = new Animated.Value(0);
    this.animatedPage = new Animated.Value(0);
    this.opacityHeader = new Animated.Value(1);
    this.opacityStreamView = new Animated.Value(1);
    this.opacityCard = new Animated.Value(1);
    this.otSessionRef = React.createRef();
    this.otPublisherRef = React.createRef();
    this.watchVideoRef = React.createRef();

    this.sessionEventHandlers = {
      streamCreated: (event) => {
        const {userID, coachSessionID} = this.props;
        console.log('sessionEventHandlers streamCreated ' + coachSessionID);
        Mixpanel.trackWithProperties(
          'sessionEventHandlers streamCreated ' + coachSessionID,
          {
            userID,
            coachSessionID,
            event,
          },
        );
      },
      sessionConnected: async (event) => {
        const {userID, coachSessionID, currentScreenSize} = this.props;
        console.log('sessionEventHandlers sessionConnected ' + coachSessionID);
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
    };

    this.publisherEventHandlers = {
      streamCreated: async (event) => {
        const {userID, coachSessionID, currentScreenSize} = this.props;
        const {portrait} = currentScreenSize;
        const {streamId, connectionId} = event;
        console.log('publisherEventHandlers streamCreated ' + coachSessionID);
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
            portrait: portrait,
            isConnected: true,
          });
        this.setState({
          isConnected: true,
        });
      },
      streamDestroyed: async (event) => {
        const {userID, coachSessionID, currentScreenSize} = this.props;
        const {streamId, connectionId} = event;
        console.log('publisherEventHandlers streamDestroyed ' + coachSessionID);
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
        this.setState({
          isConnected: false,
        });
      },
    };
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  async componentDidMount() {}
  static getDerivedStateFromProps(props, state) {
    if (props.sessionInfo !== state.sessionInfo) {
      return {
        sessionInfo: props.sessionInfo,
      };
    }
    return {};
  }

  componentDidUpdate(prevProps, prevState) {
    const {portrait} = this.props.currentScreenSize;
    const {userID, coachSessionID} = this.props;

    if (
      portrait !== prevProps.currentScreenSize.portrait &&
      this.state.isConnected
    )
      database()
        .ref(`coachSessions/${coachSessionID}/members/${userID}`)
        .update({
          portrait: portrait,
        });
    if (
      prevState.coachSession.vonageSessionId !==
        this.state.coachSession.vonageSessionId &&
      this.state.coachSession.vonageSessionId
    ) {
      this.refreshTokenMember();
    }
  }
  popupPermissionRecording() {
    let {userID, coachSessionID} = this.props;
    const {coachSession} = this.state;

    const member = this.member(coachSession);
    if (!member) return;
    const {permissionOtherUserToRecord} = member;
    const setPermission = (nextVal) => {
      return database()
        .ref(`coachSessions/${coachSessionID}/members/${userID}`)
        .update({
          permissionOtherUserToRecord: nextVal,
        });
    };

    if (permissionOtherUserToRecord === undefined)
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
    const member = this.member(coachSession);
    if (!member || !coachSession) return;
    const {coachSessionID, userID} = this.props;
    if (
      coachSession.vonageSessionId &&
      (member.expireTimeToken < Date.now() || !member.expireTimeToken)
    ) {
      console.log('updateSessionTokenUser', coachSession.vonageSessionId);
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
  member(session) {
    const {userID} = this.props;
    const members = session.members;
    if (members) return members[userID];
    return {};
  }
  openVideoShared(session) {
    const {userID} = this.props;
    const personSharingScreen = isSomeoneSharingScreen(session);
    if (personSharingScreen && userID !== personSharingScreen) {
      const video = getVideoSharing(session, personSharingScreen);
      this.watchVideoRef.open({
        watchVideo: true,
        ...video,
      });
    }
  }
  async endCoachSession(hangup) {
    await this.setState({open: false, isConnected: false});
    const {coachSessionID, userID} = this.props;
    Mixpanel.trackWithProperties('End Session ' + coachSessionID, {
      userID,
      coachSessionID,
      date: new Date(),
    });
    return true;
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
  styleSession() {
    const {currentScreenSize} = this.props;
    return {
      height: currentScreenSize.currentHeight,
      width: currentScreenSize.currentWidth,
    };
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
    const {coachSession, isConnected, publishAudio, publishVideo} = this.state;
    const {userID, userConnected, coachSessionID} = this.props;
    const personSharingScreen = isSomeoneSharingScreen(coachSession);
    const videoBeingShared = getVideoSharing(coachSession, personSharingScreen);
    if (!coachSession.tokbox) return null;

    const {sessionID} = coachSession.tokbox;
    if (!userConnected) return null;
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
        <View style={this.styleSession()}>
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
          opacityHeader={this.opacityHeader}
          setState={this.setState.bind(this)}
          watchVideoRef={this.watchVideoRef}
          endCoachSession={this.endCoachSession.bind(this)}
          otPublisherRef={this.otPublisherRef}
          personSharingScreen={personSharingScreen}
          videoBeingShared={videoBeingShared}
          onRef={(ref) => (this.footerRef = ref)}
          members={coachSession.members}
          coachSessionID={this.props.coachSessionID}
          publishAudio={publishAudio}
          publishVideo={publishVideo}
        />
      </View>
    );
  }
  session() {
    const {coachSession, isConnected, loader, open, sessionInfo} = this.state;

    const {index, coachSessionID, timestamp, currentScreenSize} = this.props;
    const personSharingScreen = isSomeoneSharingScreen(coachSession);
    const videoBeingShared = getVideoSharing(coachSession, personSharingScreen);

    return (
      <View style={styleApp.stylePage}>
        <KeepAwake />

        <Header
          coachSessionID={coachSessionID}
          organizerID={coachSession && coachSession.info.organizer}
          permissionOtherUserToRecord={
            coachSession
              ? this.member(coachSession)?.permissionOtherUserToRecord
              : false
          }
          opacityHeader={this.opacityHeader}
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

        {open && <View style={styles.viewStream}>{this.streamPage()}</View>}

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

        {loader && this.loaderView(' ')}
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
    sessionInfo: state.coach.sessionInfo,
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
