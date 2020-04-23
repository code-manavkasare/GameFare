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
import isEqual from 'lodash.isequal';
import StatusBar from '@react-native-community/status-bar';

const {height, width} = Dimensions.get('screen');

import Header from './components/Header';
import Loader from '../../../../../layout/loaders/Loader';
import {native, timing, openStream} from '../../../../../animations/animations';

import {coachAction} from '../../../../../../actions/coachActions';
import {userAction} from '../../../../../../actions/userActions';
import {layoutAction} from '../../../../../../actions/layoutActions';
import {
  isUserAlone,
  isSomeoneSharingScreen,
  userPartOfSession,
  styleStreamView,
  getVideoSharing,
  timeout,
} from '../../../../../functions/coach';

import colors from '../../../../../style/colors';
import styleApp from '../../../../../style/style';
import {
  heightHeaderHome,
  heightCardSession,
  marginTopApp,
} from '../../../../../style/sizes';

import WatchVideoPage from '../../../WatchVideoPage/index';
import MembersView from './components/MembersView';
import Footer from './footer/index';
import CardStreamView from './components/CardStreamView';

const getInitialScale = (
  widthCardSession,
  heightCardSession,
  currentHeight,
  currentWidth,
) => {
  return {
    initialScaleX: widthCardSession / currentWidth,
    initialScaleY: heightCardSession / currentHeight,
  };
};

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
      publishAudio: false,
      publishVideo: true,
      myVideo: false,
      pageFullScreen: false,
      open: false,
      coordinates: {x: 0, y: 0},
      portrait: true,
      sessionInfo: this.props.sessionInfo,
    };
    this.translateYFooter = new Animated.Value(0);
    this.translateYViewPublisher = new Animated.Value(0);
    this.translateXViewPublisher = new Animated.Value(0);
    this.animatedPage = new Animated.Value(0);
    this.opacityHeader = new Animated.Value(0);
    this.opacityStreamView = new Animated.Value(0);
    this.translateXCard = new Animated.Value(0);
    this.opacityCard = new Animated.Value(1);
    this.otSessionRef = React.createRef();
    this.watchVideoRef = React.createRef();

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
    const {coachSessionID} = this.props;
    const {sessionInfo} = this.props;
    const {autoOpen, objectID} = sessionInfo;
    if (coachSessionID === objectID && autoOpen) this.open(true);
    this.loadCoachSession();
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(nextState, this.state)) return true;
    if (nextProps.userConnected !== this.props.userConnected) return true;
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
  componentDidUpdate(prevProps, prevState) {
    console.log('componentDidUpdate');
    Object.entries(this.props).forEach(
      ([key, val]) =>
        prevProps[key] !== val &&
        console.log(`Prop '${key}' changed '${this.props.coachSessionID}'`),
    );
    if (this.state) {
      Object.entries(this.state).forEach(
        ([key, val]) =>
          prevState[key] !== val &&
          console.log(`State '${key}' changed '${this.props.coachSessionID}'`),
      );
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (
      props.sessionInfo.objectID === props.coachSessionID &&
      props.sessionInfo.scrollDisabled === state.sessionInfo.scrollDisabled
    ) {
      console.log(
        'getDerivedStateFromProps props.sessionInfo',
        props.sessionInfo,
      );
      return {
        sessionInfo: props.sessionInfo,
      };
    }
    return {};
  }

  async open(nextVal) {
    const {
      layoutAction,
      getScrollY,
      index,
      offsetScrollView,
      closeCurrentSession,
      coachSessionID,
      currentScreenSize,
    } = this.props;
    const {sessionInfo} = this.state;
    if (nextVal) {
      await this.props.coachAction('setSessionInfo', {
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
      await this.opacityCard.setValue(0);
      Animated.parallel([
        Animated.timing(this.animatedPage, openStream(1, 250)),
        Animated.timing(this.opacityStreamView, timing(1, 180)),
        Animated.timing(this.opacityHeader, timing(1, 230)),
        // Animated.timing(this.opacityCard, timing(0, 0)),
      ]).start(() =>
        this.translateXCard.setValue(currentScreenSize.currentWidth),
      );
    } else {
      await layoutAction('setLayout', {isFooterVisible: true});
      await this.translateXCard.setValue(0);
      await StatusBar.setBarStyle('dark-content', true);
      Animated.parallel([
        Animated.timing(this.animatedPage, openStream(0.05, 230)),
        Animated.timing(this.opacityStreamView, timing(1, 200)),
        Animated.timing(this.opacityHeader, timing(0, 110)),
      ]).start(async () => {
        this.setState({
          pageFullScreen: false,
        });
        this.opacityCard.setValue(1);
        this.props.coachAction('setSessionInfo', {
          scrollDisabled: false,
          autoOpen: false,
        });
      });
      await timeout(200);
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
        if (!session) return null;
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
      const video = getVideoSharing(personSharingScreen, session);
      this.watchVideoRef.open({
        watchVideo: true,
        myVideo: false,
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
    const {currentHeight, currentWidth} = this.props.currentScreenSize;
    return subscribers.map((streamId, index) => {
      const styleSubscriber = {
        height: currentHeight / subscribers.length,
        width: currentWidth,
        top: index * (currentHeight / subscribers.length),
        position: 'absolute',
      };
      return (
        <View key={streamId} style={styleSubscriber}>
          <OTSubscriberView streamId={streamId} style={styleApp.fullSize} />
        </View>
      );
    });
  };
  pausedView(userIsAlone) {
    let style = userIsAlone
      ? styles.OTPublisherAlone
      : styles.OTSubscriberNotAlone;

    style = {
      ...style,
      backgroundColor: colors.grey,
      ...styleApp.center,
      zIndex: 2,
    };

    return (
      <View style={style}>
        <Text style={[styleApp.text, {color: colors.white}]}>Paused</Text>
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
        // position: 'absolute',
      };
    }
    return {
      height: currentScreenSize.currentHeight,
      width: currentScreenSize.currentWidth,
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

    if (!coachSession.tokbox) return null;

    const {sessionID} = coachSession.tokbox;
    if (!userConnected) return null;
    if (!sessionID) return this.loaderView('Creating the room...');

    const member = userPartOfSession(coachSession, userID);

    let userIsAlone = isUserAlone(coachSession);
    const cameraPosition = this.cameraPosition();
    console.log(
      'render stream component',
      member.tokenTokbox,
      sessionID,
      Config.OPENTOK_API,
    );
    return (
      <Animated.View
        style={[styleApp.fullSize, {opacity: this.opacityStreamView}]}>
        {!member
          ? this.loaderView('You are not a member of this conversation', true)
          : !isConnected
          ? this.loaderView('We are connecting you to the session...')
          : null}

        <MembersView session={coachSession} />
        {/* {this.pausedView(userIsAlone)} */}
        {!publishVideo && this.pausedView(userIsAlone)}
        <View style={this.styleSession()}>
          <OTSession
            apiKey={Config.OPENTOK_API}
            // ref={this.otSessionRef}
            eventHandlers={this.sessionEventHandlers}
            sessionId={sessionID}
            token={member.tokenTokbox}>
            <OTPublisher
              style={
                userIsAlone
                  ? styles.OTPublisherAlone
                  : styles.OTSubscriberNotAlone
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
                  : {height: 0, width: 0, position: 'absolute', marginTop: 60}
              }>
              {this.renderSubscribers}
            </OTSubscriber>
          </OTSession>
        </View>
      </Animated.View>
    );
  }
  animatedValues() {
    const {x, y} = this.state.coordinates;
    const {currentHeight, currentWidth} = this.props.currentScreenSize;
    const {initialScaleX, initialScaleY} = getInitialScale(
      currentWidth,
      heightCardSession,
      currentHeight,
      currentWidth,
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
      outputRange: [x - ((1 - initialScaleX) * currentWidth) / 2, 0],
      extrapolate: 'clamp',
    });
    const yCard = this.animatedPage.interpolate({
      inputRange: [0, 1],
      outputRange: [y - ((1 - initialScaleY) * currentHeight) / 2, 0],
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
      sessionInfo,
    } = this.state;

    const {index, coachSessionID, timestamp, currentScreenSize} = this.props;
    const personSharingScreen = isSomeoneSharingScreen(coachSession);

    const {styleContainerStreamView, styleCard} = styleStreamView(
      index,
      coordinates,
      pageFullScreen,
      currentScreenSize,
    );
    const {scaleXCard, scaleYCard, xCard, yCard} = this.animatedValues();
    console.log('render shared element', pageFullScreen);

    return (
      <View style={styleContainerStreamView}>
        {
          <CardStreamView
            coachSessionID={coachSessionID}
            endCoachSession={this.endCoachSession.bind(this)}
            open={this.open.bind(this)}
            coachSession={coachSession}
            translateXCard={this.translateXCard}
            timestamp={timestamp}
            sessionInfo={sessionInfo}
            opacityCard={this.opacityCard}
            isConnected={isConnected}
          />
        }
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

          <Header
            coachSession={coachSession}
            opacityHeader={this.opacityHeader}
            open={this.open.bind(this)}
            setState={this.setState.bind(this)}
            state={this.state}
          />

          {open && <View style={styles.viewStream}>{this.streamPage()}</View>}

          <WatchVideoPage
            state={this.state}
            onRef={(ref) => (this.watchVideoRef = ref)}
            personSharingScreen={personSharingScreen}
            session={coachSession}
            translateYFooter={this.translateYFooter}
            setState={this.setState.bind(this)}
          />

          {loader && this.loaderView(' ')}

          {isConnected && (
            <Footer
              translateYFooter={this.translateYFooter}
              session={coachSession}
              state={this.state}
              opacityHeader={this.opacityHeader}
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
    const {coachSessionID} = this.props;
    const {sessionInfo} = this.state;
    const {objectID, autoOpen} = sessionInfo;
    console.log('render stream view', coachSessionID);
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
    width: 90,
    height: 120,
    borderRadius: 5,
    overflow: 'hidden',
    position: 'absolute',
    right: 20,
    top: heightHeaderHome + marginTopApp + 10,
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
    zIndex: 5,
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
