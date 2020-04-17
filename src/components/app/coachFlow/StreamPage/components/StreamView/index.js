import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Dimensions} from 'react-native';
import {connect} from 'react-redux';
import {
  OTSession,
  OTPublisher,
  OTSubscriber,
  OTSubscriberView,
} from 'opentok-react-native';
import Config from 'react-native-config';
import firebase from 'react-native-firebase';
import KeepAwake from 'react-native-keep-awake';
import FadeInView from 'react-native-fade-in-view';

import CameraView from '../../../cameraView/index';

const {height, width} = Dimensions.get('screen');

import Header from './components/Header';
import Loader from '../../../../../layout/loaders/Loader';
import {timing, native, openStream} from '../../../../../animations/animations';

import {coachAction} from '../../../../../../actions/coachActions';
import {userAction} from '../../../../../../actions/userActions';
import {layoutAction} from '../../../../../../actions/layoutActions';
import {
  isUserAlone,
  isSomeoneSharingScreen,
  userPartOfSession,
  styleStreamView,
} from '../../../../../functions/coach';

import colors from '../../../../../style/colors';
import styleApp from '../../../../../style/style';
import {
  heightHeaderHome,
  heightCardSession,
  widthCardSession,
} from '../../../../../style/sizes';

import WatchVideoPage from '../../../WatchVideoPage/index';
import MembersView from './components/MembersView';
import Footer from './footer/index';
import CardStreamView from './components/CardStreamView';

const getInitialScale = (widthCardSession, heightCardSession) => {
  return {
    initialScaleX: widthCardSession / width,
    initialScaleY: heightCardSession / height,
  };
};

const getPositionView = (
  offsetScrollView,
  widthCardSession,
  heightCardSession,
  index,
  getScrollY,
) => {
  const numberCardPerRow = Math.round(width / widthCardSession);
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
      displayHomeView: true,
      publishAudio: false,
      publishVideo: true,
      myVideo: false,
      pageFullScreen: false,
      open: false,
      coordinates: {x: 0, y: 0},
    };
    this.translateYFooter = new Animated.Value(0);
    this.translateYViewPublisher = new Animated.Value(0);
    this.translateXViewPublisher = new Animated.Value(0);
    this.animatedPage = new Animated.Value(0);
    this.otSessionRef = React.createRef();

    this.publisherEventHandlers = {
      streamCreated: async (event) => {
        const {userID, coachSessionID} = this.props;
        await firebase
          .database()
          .ref(`coachSessions/${coachSessionID}/members/${userID}`)
          .update({
            isConnected: true,
            connectionIdTokbox: event.streamId,
          });
        this.setState({
          isConnected: true,
        });
      },
      streamDestroyed: async (event) => {
        const {userID, coachSessionID} = this.props;
        await firebase
          .database()
          .ref(`coachSessions/${coachSessionID}/members/${userID}`)
          .update({
            isConnected: false,
          });
        this.setState({
          isConnected: false,
        });
      },
    };
    this.sessionEventHandlers = {
      sessionDisconnected: async (event) => {
        const {userID, coachSessionID} = this.props;
        await firebase
          .database()
          .ref(`coachSessions/${coachSessionID}/members/${userID}`)
          .update({
            isConnected: false,
          });
        this.setState({
          isConnected: false,
        });
      },
      sessionConnected: async (event) => {
        this.setState({
          isConnected: true,
        });
      },
    };
    this.componentDidMount = this.componentDidMount.bind(this);
  }
  async componentDidMount() {
    this.props.onRef(this);
    console.log('stream view mounted!', this.props.coachSessionID);
    const {coachSessionID} = this.props;
    const {autoOpen, objectID} = this.props.sessionInfo;
    if (coachSessionID === objectID && autoOpen) this.open(true);
    this.loadCoachSession();
  }
  componentWillUnmount() {
    const {coachSessionID} = this.props;
    console.log('stream view will unmount', coachSessionID);
    firebase
      .database()
      .ref('coachSessions/' + coachSessionID)
      .off();
  }
  async open(nextVal) {
    const {
      layoutAction,
      getScrollY,
      index,
      offsetScrollView,
      closeCurrentSession,
      coachSessionID,
      sessionInfo,
    } = this.props;
    if (nextVal) {
      await this.props.coachAction('setSessionInfo', {
        objectID: coachSessionID,
        scrollDisabled: true,
      });
      const {x, y} = getPositionView(
        offsetScrollView,
        widthCardSession,
        heightCardSession,
        index,
        getScrollY(),
      );
      console.log('x,y got', {x, y});

      ////// close current opened session
      const currentOpenSession = sessionInfo.objectID;
      if (currentOpenSession && coachSessionID !== currentOpenSession)
        await closeCurrentSession(currentOpenSession);
      /////////////////////////

      await this.setState({
        coordinates: {x: x, y: y},
        pageFullScreen: true,
        open: true,
      });
      await layoutAction('setLayout', {isFooterVisible: false});
      Animated.parallel([
        Animated.timing(this.animatedPage, native(1, 250)),
      ]).start();
    } else {
      await layoutAction('setLayout', {isFooterVisible: true});
      Animated.timing(this.animatedPage, native(0, 250)).start(() => {
        console.log('set full screen to false', coachSessionID);
        this.setState({
          pageFullScreen: false,
        });
        this.props.coachAction('setSessionInfo', {
          scrollDisabled: false,
        });
      });
    }
  }
  async loadCoachSession() {
    await this.setState({loader: true});
    const {userID, coachSessionID} = this.props;

    const that = this;
    firebase
      .database()
      .ref('coachSessions/' + coachSessionID)
      .on('value', async function(snap) {
        let session = snap.val();
        console.log('session loaded:', session);
        if (!session)
          return that.setState({
            error: {
              message: 'This session does exist anymore.',
            },
            coachSession: false,
            loader: false,
          });
        if (!session.info)
          return that.setState({
            error: {
              message: 'This session does exist anymore.',
            },
            coachSession: false,
            loader: false,
          });
        const members = session.members;
        if (members) members[userID];
        return that.setState({
          coachSession: session,
          loader: false,
          error: false,
          displayHomeView: false,
        });
      });
  }
  async endCoachSession(hangup) {
    const {coachAction} = this.props;
    await this.setState({open: false});
    if (hangup) return this.open(false);
    return true;
  }

  loaderView(text, hideLoader) {
    const {pageFullScreen} = this.state;
    if (!pageFullScreen) return null;
    return (
      <FadeInView
        duration={250}
        style={[styleApp.center, styles.loaderSessionTokBox]}>
        {pageFullScreen && (
          <Text
            style={[styleApp.text, {color: colors.white, marginBottom: 25}]}>
            {text}
          </Text>
        )}
        {!hideLoader && <Loader size={34} color={'white'} />}
      </FadeInView>
    );
  }
  cameraPosition() {
    const {cameraFront} = this.state;
    if (cameraFront) return 'front';
    return 'back';
  }
  renderSubscribers = (subscribers) => {
    let styleSubscriber = {};
    let heightViewSubscriber = height;
    return subscribers.map((streamId, index) => {
      styleSubscriber = {
        height: heightViewSubscriber / subscribers.length,
        width: width,
        top: index * (heightViewSubscriber / subscribers.length),
        position: 'absolute',
      };
      return (
        <View key={streamId} style={styleSubscriber}>
          <OTSubscriberView streamId={streamId} style={styleApp.fullSize} />
        </View>
      );
    });
  };
  styleSession() {
    const {pageFullScreen} = this.state;
    if (!pageFullScreen) {
      return {
        height: 0,
        marginTop: 0,
        width: 0,
        marginLeft: width,
        borderRadius: 6,
        // position: 'absolute',
      };
    }
    return {
      height: height,
      width: width,
    };
  }
  streamPage() {
    const {
      coachSession,
      isConnected,
      publishAudio,
      publishVideo,
      loader,
      pageFullScreen,
    } = this.state;
    const {userID, userConnected} = this.props;

    if (!coachSession.tokbox) return null;

    const {sessionID} = coachSession.tokbox;
    if (!userConnected) return null;
    if (!sessionID) return this.loaderView('Creating the room...');

    const member = userPartOfSession(coachSession, userID);

    let userIsAlone = isUserAlone(coachSession);
    const cameraPosition = this.cameraPosition();

    return (
      <View style={styleApp.fullSize}>
        {!member
          ? this.loaderView('You are not a member of this conversation', true)
          : !isConnected
          ? this.loaderView('We are connecting you to the session...')
          : null}

        <View style={this.styleSession()}>
          <OTSession
            apiKey={Config.OPENTOK_API}
            ref={this.otSessionRef}
            eventHandlers={this.sessionEventHandlers}
            sessionId={sessionID}
            style={styleApp.fullSize}
            token={member.tokenTokbox}>
            <OTPublisher
              style={
                !userIsAlone ? styles.OTSubscriberAlone : styles.OTPublisher
              }
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
                  : {height: 0, width: 0, position: 'absolute'}
              }>
              {this.renderSubscribers}
            </OTSubscriber>

            <MembersView session={coachSession} hide={!pageFullScreen} />

            {!publishVideo && (
              <CameraView
                onRef={(ref) => (this.cameraRef = ref)}
                styleCamera={{height: 300, width: 200}}
                cameraFront={true}
                captureAudio={false}
              />
            )}
          </OTSession>
        </View>
      </View>
    );
  }
  animatedValues() {
    const {x, y} = this.state.coordinates;

    const {initialScaleX, initialScaleY} = getInitialScale(
      widthCardSession,
      heightCardSession,
    );

    const scaleXCard = this.animatedPage.interpolate({
      inputRange: [0, 1],
      outputRange: [initialScaleX, 1],
      extrapolate: 'clamp',
    });
    const scaleYCard = this.animatedPage.interpolate({
      inputRange: [0, 1],
      outputRange: [initialScaleY, 1],
      extrapolate: 'clamp',
    });

    const xCard = this.animatedPage.interpolate({
      inputRange: [0, 1],
      outputRange: [x - ((1 - initialScaleX) * width) / 2, 0],
      extrapolate: 'clamp',
    });
    const yCard = this.animatedPage.interpolate({
      inputRange: [0, 1],
      outputRange: [y - ((1 - initialScaleY) * height) / 2, 0],
      extrapolate: 'clamp',
    });

    return {
      scaleXCard,
      scaleYCard,
      xCard,
      yCard,
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
    } = this.state;

    const {index, coachSessionID, timestamp, sessionInfo} = this.props;
    const personSharingScreen = isSomeoneSharingScreen(coachSession);

    const {styleContainerStreamView, styleCard} = styleStreamView(
      index,
      coordinates,
      pageFullScreen,
    );

    const {scaleXCard, scaleYCard, xCard, yCard} = this.animatedValues();
    console.log('render element stream', this.state);
    return (
      <View style={styleContainerStreamView}>
        <Animated.View
          ref={(ref) => {
            this.streamViewRef = ref;
          }}
          style={[
            styleCard,
            pageFullScreen && {
              transform: [
                {translateX: xCard},
                {translateY: yCard},
                {scaleX: scaleXCard},
                {scaleY: scaleYCard},
              ],
            },
          ]}>
          <KeepAwake />

          {pageFullScreen && (
            <Header
              coachSession={coachSession}
              open={this.open.bind(this)}
              setState={this.setState.bind(this)}
              state={this.state}
            />
          )}

          {open && <View style={styles.viewStream}>{this.streamPage()}</View>}

          <WatchVideoPage
            state={this.state}
            onRef={(ref) => (this.watchVideoRef = ref)}
            personSharingScreen={personSharingScreen}
            session={coachSession}
            translateYFooter={this.translateYFooter}
            setState={this.setState.bind(this)}
          />

          {!pageFullScreen && (
            <CardStreamView
              coachSessionID={coachSessionID}
              endCoachSession={this.endCoachSession.bind(this)}
              open={this.open.bind(this)}
              coachSession={coachSession}
              timestamp={timestamp}
              isConnected={isConnected}
            />
          )}
          {loader && this.loaderView(' ')}

          {pageFullScreen && isConnected && (
            <Footer
              translateYFooter={this.translateYFooter}
              session={coachSession}
              state={this.state}
              setState={this.setState.bind(this)}
              watchVideoRef={this.watchVideoRef}
              endCoachSession={this.endCoachSession.bind(this)}
            />
          )}
        </Animated.View>
      </View>
    );
  }
  render() {
    const {sessionInfo, coachSessionID} = this.props;
    return (
      <View
        style={[
          styles.col,
          {zIndex: sessionInfo.objectID === coachSessionID ? 20 : 3},
        ]}>
        {this.sharedElement()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  col: {
    height: heightCardSession,
    width: widthCardSession,
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
  OTSubscriber: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 8,
  },
  OTSubscriberAlone: {
    width: 90,
    height: 120,
    borderRadius: 5,
    overflow: 'hidden',
    position: 'absolute',
    right: 20,
    top: heightHeaderHome + 10,
    zIndex: 4,
  },
  OTPublisher: {
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
    zIndex: 5,
    opacity: 1,
  },
  loaderView: {
    height: '100%',
    width: width,
    backgroundColor: colors.primaryLight,
    opacity: 0.4,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    userConnected: state.user.userConnected,
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
