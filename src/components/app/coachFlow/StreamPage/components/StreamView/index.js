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
import StatusBar from '@react-native-community/status-bar';

const {height, width} = Dimensions.get('screen');

import Mixpanel from 'react-native-mixpanel';
import {mixPanelToken} from '../../../../../database/firebase/tokens';
console.log('mixPanelToken', mixPanelToken);
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
  styleStreamView,
  getVideoSharing,
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
import Footer from './footer/index';
import CardStreamView from './components/CardStreamView';
import axios from 'axios';

const getPositionView = (
  offsetScrollView,
  widthCardSession,
  heightCardSession,
  index,
  getScrollY,
) => {
  const numberCardPerRow = 1;
  var remainder = index % numberCardPerRow;
  let x = widthCardSession * remainder;
  let y =
    offsetScrollView +
    heightCardSession * Math.floor(index / numberCardPerRow) -
    getScrollY;
  return {x, y};
};

class StreamPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      isConnected: false,
      coachSession: false,
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
      streamDestroyed: (event) => {
        const {userID, coachSessionID} = this.props;
        console.log('sessionEventHandlers streamDestroyed ' + coachSessionID);
        Mixpanel.trackWithProperties(
          'sessionEventHandlers streamDestroyed ' + coachSessionID,
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
        const {portrait} = currentScreenSize;
        const {streamId, connectionId} = event;
        await database()
          .ref(`coachSessions/${coachSessionID}/members/${userID}`)
          .update({
            isConnected: true,
            streamIdTokBox: streamId,
            connectionIdTokbox: connectionId,
            portrait: portrait,
          });
        this.setState({
          isConnected: true,
        });
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
        // await database()
        //   .ref(`coachSessions/${coachSessionID}/members/${userID}`)
        //   .update({
        //     isConnected: true,
        //     streamIdTokBox: streamId,
        //     connectionIdTokbox: connectionId,
        //     portrait: portrait,
        //   });
        // this.setState({
        //   isConnected: true,
        // });
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

  async componentDidMount() {
    this.props.onRef(this);
    this.loadCoachSession();

    const {coachSessionID, closeCurrentSession} = this.props;
    const {sessionInfo} = this.props;
    const {autoOpen, objectID, prevObjectID} = sessionInfo;
    console.log('mount Session', coachSessionID, sessionInfo);
    if (prevObjectID && prevObjectID !== coachSessionID) {
      console.log('close session,' + objectID);
      await closeCurrentSession(prevObjectID);
    }
    if (coachSessionID === objectID && autoOpen) this.open(true);
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(nextState, this.state)) return true;
    if (nextProps.userConnected !== this.props.userConnected) return true;
    if (!isEqual(nextProps.settings, this.props.settings)) return true;
    if (!isEqual(nextProps.currentScreenSize, this.props.currentScreenSize))
      return true;
    if (
      nextProps.sessionInfo.objectID === this.props.coachSessionID &&
      nextProps.sessionInfo.scrollDisabled ===
        this.props.sessionInfo.scrollDisabled
    )
      return true;
    return false;
  }
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
  async open(nextVal) {
    const {
      layoutAction,
      getScrollY,
      index,
      offsetScrollView,
      coachAction,
      coachSessionID,
      closeCurrentSession,
      currentScreenSize,
    } = this.props;
    const {sessionInfo} = this.state;
    console.log('open session', nextVal, coachSessionID);
    if (nextVal) {
      ////// close current opened session
      const currentOpenSession = sessionInfo.objectID;
      if (currentOpenSession && currentOpenSession !== coachSessionID)
        await closeCurrentSession(currentOpenSession);
      /////////////////////////
      await coachAction('setSessionInfo', {
        objectID: coachSessionID,
        scrollDisabled: true,
        autoOpen: true,
      });
      const {x, y} = getPositionView(
        offsetScrollView,
        currentScreenSize.currentWidth,
        heightCardSession,
        index,
        getScrollY(),
      );

      await StatusBar.setBarStyle('light-content', true);

      await this.setState({
        coordinates: {x: x, y: y},
        pageFullScreen: true,
        open: true,
      });
      await layoutAction('setLayout', {isFooterVisible: false});
      Animated.spring(this.animatedPage, native(1, 250)).start(async () => {
        this.refreshTokenMember();
        this.popupPermissionRecording();
      });
    } else {
      await layoutAction('setLayout', {isFooterVisible: true});
      await StatusBar.setBarStyle('dark-content', true);
      Animated.timing(this.animatedPage, openStream(0, 230)).start(async () => {
        this.setState({
          pageFullScreen: false,
          coordinates: {x: 0, y: 0},
        });
        this.props.coachAction('setSessionInfo', {
          scrollDisabled: false,
          autoOpen: false,
        });
      });
    }
  }
  popupPermissionRecording() {
    let {settings, userID} = this.props;
    if (!settings) settings = {};
    const {permissionOtherUserToRecord} = settings;

    const setPermission = (nextVal) => {
      return database()
        .ref(`users/${userID}/settings`)
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
    const {coachSessionID, userID} = this.props;
    console.log('refreshTokenMember');
    if (
      coachSession.vonageSessionId &&
      (member.expireTimeToken < Date.now() || !member.expireTimeToken)
    ) {
      var url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}updateSessionTokenUser`;
      console.log('call cloud function', {
        coachSessionID,
        userID,
        coachSessionIDOpentok: coachSession.vonageSessionId,
        isOrganizer: coachSession.info.organizer === userID,
      });
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
  async loadCoachSession() {
    await this.setState({loader: true});
    const {userID, coachSessionID} = this.props;

    const that = this;
    console.log('start load session', coachSessionID);
    database()
      .ref('coachSessions/' + coachSessionID)
      .on('value', async function(snap) {
        let session = snap.val();
        if (!session) return null;
        if (!session.info)
          return that.setState({
            error: {
              message: 'This session does exist anymore.',
            },
            coachSession: false,
            loader: false,
          });

        that.openVideoShared(session);
        return that.setState({
          coachSession: session,
          loader: false,
          error: false,
        });
      });
  }
  openVideoShared(session) {
    const {pageFullScreen} = this.state;
    const {userID} = this.props;
    const personSharingScreen = isSomeoneSharingScreen(session);
    if (
      personSharingScreen &&
      pageFullScreen &&
      userID !== personSharingScreen
    ) {
      const video = getVideoSharing(session, personSharingScreen);
      this.watchVideoRef.open({
        watchVideo: true,
        ...video,
      });
    }
  }
  async endCoachSession(hangup) {
    if (hangup) await this.open(false);
    await this.setState({open: false});
    return true;
  }
  loaderView(text, hideLoader) {
    const {pageFullScreen} = this.state;
    const styleText = {
      ...styleApp.textBold,
      color: colors.white,
      fontSize: 20,
      marginBottom: 25,
    };
    if (!pageFullScreen) return null;
    return (
      <View style={[styleApp.center, styles.loaderSessionTokBox]}>
        {pageFullScreen && <Text style={styleText}>{text}</Text>}
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
    const {currentHeight, currentWidth} = this.props.currentScreenSize;
    return subscribers.map((streamId, index) => {
      const member = Object.values(coachSession.members).filter(
        (member) => member.streamIdTokBox === streamId,
      )[0];
      const ratioScreen = ratio(
        currentWidth,
        currentHeight / subscribers.length,
      );
      let ratioVideo = ratio(16, 9);
      if (member?.portrait) ratioVideo = ratio(9, 16);

      let w = currentWidth;
      let h = currentWidth * ratioVideo;
      if (ratioScreen < ratioVideo) {
        h = currentHeight;
        w = currentHeight / ratioVideo;
      }
      const styleSubscriber = {
        ...styleApp.center,
        height: currentHeight / subscribers.length,
        width: currentWidth,
        top: index * (currentHeight / subscribers.length),
        position: 'absolute',
        backgroundColor: colors.title,
      };
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
    const {pageFullScreen} = this.state;
    const {currentScreenSize} = this.props;
    if (!pageFullScreen) {
      return {
        height: 0,
        marginTop: 0,
        width: 0,
        marginLeft: width,
        borderRadius: 6,
      };
    }
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
    const {
      coachSession,
      isConnected,
      publishAudio,
      publishVideo,
      pageFullScreen,
    } = this.state;
    const {userID, userConnected} = this.props;
    const personSharingScreen = isSomeoneSharingScreen(coachSession);
    const videoBeingShared = getVideoSharing(coachSession, personSharingScreen);
    if (!coachSession.tokbox) return null;

    const {sessionID} = coachSession.tokbox;
    if (!userConnected) return null;
    if (!sessionID) return this.loaderView('Room creation');

    const member = userPartOfSession(coachSession, userID);

    let userIsAlone = isUserAlone(coachSession);
    const cameraPosition = this.cameraPosition();
    console.log('render stream view ', isConnected);
    return (
      <Animated.View
        style={[styleApp.fullSize, {opacity: this.opacityStreamView}]}>
        {!member
          ? this.loaderView('You are not a member of this conversation', true)
          : !isConnected
          ? this.loaderView('Connection')
          : null}

        <MembersView members={coachSession.members} />
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

              <OTSubscriber
                style={
                  pageFullScreen
                    ? styles.OTSubscriber
                    : {height: 0, width: 0, position: 'absolute', marginTop: 60}
                }>
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
        />
      </Animated.View>
    );
  }
  animatedValues() {
    const {currentWidth} = this.props.currentScreenSize;
    const translateXStream = this.animatedPage.interpolate({
      inputRange: [0, 1],
      outputRange: [currentWidth, 0],
      extrapolate: 'clamp',
    });
    const translateXCard = this.animatedPage.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -currentWidth],
      extrapolate: 'clamp',
    });

    return {
      translateXStream,
      translateXCard,
    };
  }
  sharedElement() {
    const {
      coachSession,
      isConnected,
      loader,
      coordinates,
      pageFullScreen,
      open,
      sessionInfo,
    } = this.state;

    const {index, coachSessionID, timestamp, currentScreenSize} = this.props;
    const personSharingScreen = isSomeoneSharingScreen(coachSession);
    const videoBeingShared = getVideoSharing(coachSession, personSharingScreen);
    const {styleContainerStreamView, styleCard} = styleStreamView(
      index,
      coordinates,
      pageFullScreen,
      currentScreenSize,
    );
    const {translateXStream, translateXCard} = this.animatedValues();

    return (
      <View style={styleContainerStreamView}>
        <CardStreamView
          coachSessionID={coachSessionID}
          endCoachSession={this.endCoachSession.bind(this)}
          open={this.open.bind(this)}
          members={coachSession.members}
          translateXCard={translateXCard}
          timestamp={timestamp}
          sessionInfo={sessionInfo}
          opacityCard={this.opacityCard}
          isConnected={isConnected}
          coordinates={coordinates}
        />

        <Animated.View
          ref={(ref) => {
            this.streamViewRef = ref;
          }}
          style={[
            styleCard,
            pageFullScreen && {
              transform: [{translateX: translateXStream}],
            },
          ]}>
          <KeepAwake />

          <Header
            coachSessionID={coachSessionID}
            organizerID={coachSession && coachSession.info.organizer}
            opacityHeader={this.opacityHeader}
            open={this.open.bind(this)}
            setState={this.setState.bind(this)}
            state={this.state}
          />

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
        </Animated.View>
      </View>
    );
  }
  render() {
    const {coachSessionID} = this.props;
    const {sessionInfo} = this.state;
    const {objectID, autoOpen} = sessionInfo;
    return (
      <View
        style={[
          styles.col,
          {zIndex: objectID === coachSessionID && autoOpen ? 20 : 3},
        ]}>
        {this.sharedElement()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  col: {
    height: heightCardSession,
    width: '100%',
    flexDirection: 'column',
    position: 'relative',
  },
  pageComponent: {
    backgroundColor: colors.white,
    ...styleApp.fullSize,
    // ...styleApp.center,
  },
  viewStream: {
    ...styleApp.fullSize,
    backgroundColor: colors.white,
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
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    currentScreenSize: state.layout.currentScreenSize,
    sessionInfo: state.coach.sessionInfo,
    settings: state.user.infoUser.settings,
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
