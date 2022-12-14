import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
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
import axios from 'axios';

import colors from '../../../../../style/colors';
import styleApp from '../../../../../style/style';
import {
  heightHeaderHome,
  marginTopApp,
  marginTopAppLandscape,
  ratio,
} from '../../../../../style/sizes';

import {coachAction} from '../../../../../../store/actions/coachActions';
import {layoutAction} from '../../../../../../store/actions/layoutActions';

import {
  logMixpanel,
  sentryCaptureException,
} from '../../../../../functions/logs';
import {
  isUserAlone,
  isSomeoneSharingScreen,
  userPartOfSession,
  getVideosSharing,
  getMember,
  timeout,
} from '../../../../../functions/coach';
import {openVideoPlayer} from '../../../../../functions/videoManagement';
import {permission} from '../../../../../functions/pictures';
import FocusListeners from '../../../../../hoc/focusListeners';
import Header from './components/Header';
import Loader from '../../../../../layout/loaders/Loader';

import MembersView from './components/MembersView';
import CameraPage from '../../../../../app/camera/index';
import Footer from './footer/index';
import {
  userConnectedSelector,
  userIDSelector,
} from '../../../../../../store/selectors/user';
import {currentScreenSizeSelector} from '../../../../../../store/selectors/layout';
import {
  currentSessionIDSelector,
  reconnectingSelector,
  sessionSelector,
} from '../../../../../../store/selectors/sessions';
import {connectionTypeSelector} from '../../../../../../store/selectors/connectionType';
import {boolShouldComponentUpdate} from '../../../../../functions/redux';

class GroupsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      error: false,
      cameraFront: true,
      watchVideo: false,
      publishAudio: !__DEV__,
      publishVideo: true,
      open: false,
      portrait: true,
      date: 0,
    };
    this.translateYFooter = new Animated.Value(0);
    this.otSessionRef = React.createRef();
    this.otPublisherRef = React.createRef();
    this.watchVideoRef = React.createRef();

    this.sessionEventHandlers = {
      sessionConnected: (event) => {},
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
        this.setState({error: true, isConnected: false});
        logMixpanel({
          label: 'ERROR: sessionEventHandlers error',
          params: {
            event,
            date: new Date(),
          },
        });
        sentryCaptureException(event);
      },
      otrnError: (event) => {
        // cannot use variables from closure as component may be unmounted when this is called
        console.log(
          'OTRN ERROR - StreamView: error in communication between native OTSession instance and JS component -- ',
          event,
        );
        logMixpanel({
          label: 'ERROR: sessionEventHandlers otrnError ',
          params: event,
        });
        sentryCaptureException(event);
      },
    };

    this.publisherEventHandlers = {
      streamCreated: async (event) => {
        const {publishVideo} = this.state;
        const {userID, currentScreenSize, currentSessionID} = this.props;
        const {portrait} = currentScreenSize;
        const {streamId, connectionId} = event;
        logMixpanel({
          label: 'publisherEventHandlers streamCreated ' + currentSessionID,
          params: {
            currentSessionID,
            streamId,
            connectionId,
          },
        });
        await database()
          .ref(`coachSessions/${currentSessionID}/members/${userID}`)
          .update({
            streamIdTokBox: streamId,
            connectionIdTokbox: connectionId,
            connectionTimeStamp: Date.now(),
            disconnectionTimeStamp: false,
            portrait: portrait,
            isConnected: true,
            publishVideo,
            recording: {enabled: true},
          });
      },
      streamDestroyed: (event) => {
        const {currentSessionID} = this.props;
        const {streamId, connectionId} = event;
        logMixpanel({
          label: 'publisherEventHandlers streamDestroyed ' + currentSessionID,
          params: {
            currentSessionID,
            streamId,
            connectionId,
          },
        });
      },
    };
  }

  componentDidMount() {
    this.refreshTokenMember();
  }
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'StreamView',
    });
  }
  componentDidUpdate(prevProps, prevState) {
    const {
      userID,
      currentSessionID,
      userConnected,
      currentScreenSize,
      route,
      session,
    } = this.props;
    const {portrait} = currentScreenSize;
    if (!currentSessionID && prevProps.currentSessionID)
      this.props.layoutAction('setGeneralSessionRecording', false);
    if (currentSessionID) {
      if (portrait !== prevProps.currentScreenSize.portrait) {
        database()
          .ref(`coachSessions/${currentSessionID}/members/${userID}`)
          .update({
            portrait: portrait,
          });
      }
      if (userConnected) {
        permission('library');
        this.refreshTokenMember();

        if (!isEqual(prevProps.session, session) && session) {
          this.refreshTokenMember();
          const personSharingScreen = isSomeoneSharingScreen(session);
          if (
            !isEqual(
              Object.keys(
                prevProps.session?.members[personSharingScreen]?.sharedVideos ??
                  {},
              ),
              Object.keys(
                session?.members[personSharingScreen]?.sharedVideos ?? {},
              ),
            )
          ) {
            this.openVideoShared();
          }
        }
      }
    }
    if (
      route?.params?.params?.action !== prevProps.route?.params?.params?.action
    ) {
      try {
        this.cameraRef?.bottomButtonsRef?.recordButtonRef?.clickRecord();
        this.footerRef?.bottomButtonsRef?.clickRecord();
      } catch (e) {}
    }
  }
  isTokenUpToDate = () => {
    const {userID, session: coachSession} = this.props;
    const member = getMember(coachSession, userID);
    return !(
      coachSession.vonageSessionId &&
      (member.expireTimeToken < Date.now() || !member.expireTimeToken)
    );
  };
  async refreshTokenMember() {
    const {
      currentSessionID: coachSessionID,
      userID,
      session: coachSession,
    } = this.props;
    const member = getMember(coachSession, userID);

    if (!member || !coachSession) {
      return;
    }

    if (!this.isTokenUpToDate()) {
      var url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}updateSessionTokenUser`;
      return axios.get(url, {
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
    const {
      userID,
      currentSessionID: coachSessionID,
      session: coachSession,
    } = this.props;
    const personSharingScreen = isSomeoneSharingScreen(coachSession);
    if (personSharingScreen && userID !== personSharingScreen) {
      const videos =
        coachSession.members[personSharingScreen]?.sharedVideos ?? {};
      openVideoPlayer({
        coachSessionID,
        archives: Object.keys(videos),
        open: true,
      });
    }
  }
  loaderView(text, hideLoader) {
    const {portrait} = this.props.currentScreenSize;
    const styleText = {
      ...styleApp.textBold,
      color: colors.white,
      fontSize: 20,
      marginBottom: 25,
    };
    const loaderViewStyle = {
      ...styleApp.center,
      ...styles.loaderSessionTokBox,
      paddingBottom: portrait ? 0 : 155,
    };
    return (
      <View style={loaderViewStyle}>
        {<Text style={styleText}>{text}</Text>}
        {!hideLoader ? <Loader size={55} color={colors.white} /> : null}
      </View>
    );
  }
  cameraPosition() {
    const {cameraFront} = this.state;
    if (cameraFront) {
      return 'front';
    }
    return 'back';
  }
  renderSubscribers = (subscribers) => {
    const {session: coachSession} = this.props;
    const {
      currentHeight,
      currentWidth,
      portrait,
    } = this.props.currentScreenSize;

    const members = subscribers
      .map((streamId) => {
        return Object.values(coachSession.members).filter((member) => {
          return member.streamIdTokBox === streamId;
        })[0];
      })
      .filter((member) => member !== undefined);
    let length = members.length;

    return members.map((member, index) => {
      let streamId = member?.streamIdTokBox;

      let ratioVideo = ratio(16, 9);
      if (member?.portrait) {
        ratioVideo = ratio(9, 16);
      }

      let styleSubscriber = {
        ...styleApp.center,
        height: currentHeight / length,
        width: currentWidth,
        top: index * (currentHeight / length),
        position: 'absolute',
        backgroundColor: colors.black,
      };
      if (!portrait) {
        styleSubscriber = {
          ...styleApp.center,
          height: currentHeight,
          width: currentWidth / length,
          left: index * (currentWidth / length),
          position: 'absolute',
          backgroundColor: colors.black,
        };
      }
      const ratioScreen = ratio(styleSubscriber.width, styleSubscriber.height);
      let w = styleSubscriber.width;
      let h = styleSubscriber.width * ratioVideo;
      if (ratioScreen < ratioVideo) {
        h = styleSubscriber.height;
        w = styleSubscriber.height / ratioVideo;
      }
      return (
        <View key={streamId} style={styleSubscriber}>
          {member?.publishVideo === true ? (
            <OTSubscriberView
              streamId={streamId}
              style={{width: w, height: h}}
            />
          ) : member?.publishVideo == false ? (
            <View
              style={{
                ...styleApp.center,
                ...styles.pausedView,
                width: w,
                height: h,
              }}>
              <Text style={[styleApp.textBold, {color: colors.white}]}>
                Paused
              </Text>
            </View>
          ) : null}
        </View>
      );
    });
  };
  pausedView(userIsAlone) {
    let style = this.stylePublisher(userIsAlone);
    const {portrait} = this.props.currentScreenSize;

    style = {
      ...style,
      backgroundColor: colors.greyDark,
      ...styleApp.center,
      zIndex: 2,
    };

    let styleTextAlone = {};
    if (!userIsAlone) {
      styleTextAlone = {
        fontSize: 9,
        marginBottom: portrait ? 5 : 0,
      };
    }

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
    if (userIsAlone) {
      return styles.OTPublisherAlone;
    }

    const {portrait} = this.props.currentScreenSize;
    let marginTop = marginTopApp;
    if (!portrait) {
      marginTop = marginTopAppLandscape;
    }
    let width = portrait ? 70 : 142;
    let height = portrait ? 123 : 80;
    return {
      height,
      width,
      ...styles.OTSubscriberNotAlone,
      top: marginTop + heightHeaderHome,
    };
  }

  header(isConnected) {
    const {userID, session, currentSessionID, navigation} = this.props;
    return (
      <Header
        coachSessionID={currentSessionID}
        organizerID={session && session?.info.organizer}
        isConnected={isConnected}
        navigation={navigation}
        permissionOtherUserToRecord={
          session
            ? getMember(session, userID)?.permissionOtherUserToRecord
            : false
        }
        chargeForSession={getMember(session, userID)?.chargeForSession}
        setState={this.setState.bind(this)}
        state={this.state}
      />
    );
  }
  cameraView() {
    const {navigation} = this.props;
    return (
      <View style={styles.localCameraContainer}>
        <CameraPage
          navigation={navigation}
          onRef={(ref) => {
            this.cameraRef = ref;
          }}
        />
      </View>
    );
  }
  streamPage() {
    const {
      currentSessionID,
      currentScreenSize,
      session: coachSession,
      reconnecting,
      userID,
      userConnected,
      connectionType,
    } = this.props;
    const {currentHeight: height, currentWidth: width} = currentScreenSize;
    if (
      !userConnected ||
      !currentSessionID ||
      !coachSession ||
      !coachSession.tokbox
    ) {
      return this.cameraView();
    }
    const {publishAudio, publishVideo} = this.state;
    const personSharingScreen = isSomeoneSharingScreen(coachSession);
    const videosBeingShared = getVideosSharing(
      coachSession,
      personSharingScreen,
    );
    const {sessionID} = coachSession?.tokbox;

    const member = userPartOfSession(coachSession, userID);
    const {isConnected} = member;
    let userIsAlone = isUserAlone(coachSession);
    const cameraPosition = this.cameraPosition();
    const viewStreamStyle = {
      ...styles.viewStream,
      height,
      width,
    };
    return (
      <View style={viewStreamStyle}>
        {this.header(isConnected)}
        {!member
          ? this.loaderView('You are not a member of this conversation', true)
          : !this.isTokenUpToDate()
          ? this.loaderView('Granted access...')
          : !connectionType
          ? this.loaderView('Waiting for network...')
          : !isConnected
          ? this.loaderView('Connecting')
          : null}

        <MembersView
          members={coachSession.members}
          coachSessionID={currentSessionID}
        />
        {!publishVideo ? this.pausedView(userIsAlone) : null}
        <View style={styleApp.fullSize}>
          {member.tokenTokbox && connectionType && this.isTokenUpToDate() ? (
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
          ) : null}
        </View>

        <Footer
          translateYFooter={this.translateYFooter}
          setState={this.setState.bind(this)}
          watchVideoRef={this.watchVideoRef}
          otPublisherRef={this.otPublisherRef}
          personSharingScreen={personSharingScreen}
          videosBeingShared={videosBeingShared}
          onRef={(ref) => (this.footerRef = ref)}
          members={coachSession.members}
          coachSessionID={currentSessionID}
          publishAudio={publishAudio}
          publishVideo={publishVideo}
          getCameraPosition={() => {
            return cameraPosition;
          }}
        />
        {reconnecting ? (
          <View
            style={[
              styleApp.center,
              styleApp.fullSize,
              {position: 'absolute'},
            ]}>
            <Loader size={55} color={colors.white} />
          </View>
        ) : null}
      </View>
    );
  }
  session() {
    const {navigation} = this.props;
    return (
      <View style={styleApp.stylePage}>
        <FocusListeners navigation={navigation} statusBarOnFocus />
        <KeepAwake />
        {this.streamPage()}
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
    zIndex: 0,
  },
  pausedView: {
    height: '100%',
    width: '100%',
    ...styleApp.center,
  },
  OTSubscriber: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 8,
  },
  OTSubscriberNotAlone: {
    borderRadius: 18,
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
    backgroundColor: colors.black,
    width: '100%',
    zIndex: 9,
    opacity: 1,
  },
  localCameraContainer: {
    ...styleApp.fullSize,
    position: 'absolute',
    zIndex: 9,
    opacity: 1,
  },
  loaderView: {
    height: '100%',
    width: '100%',
    backgroundColor: colors.red,
    opacity: 0.4,
    zIndex: 5,
    position: 'absolute',
  },
});

const mapStateToProps = (state, props) => {
  const currentSessionID = currentSessionIDSelector(state);
  return {
    userID: userIDSelector(state),
    userConnected: userConnectedSelector(state),
    currentScreenSize: currentScreenSizeSelector(state),
    currentSessionID,
    session: sessionSelector(state, {id: currentSessionID}),
    reconnecting: reconnectingSelector(state),
    connectionType: connectionTypeSelector(state),
  };
};

export default connect(
  mapStateToProps,
  {
    coachAction,
    layoutAction,
  },
)(GroupsPage);
