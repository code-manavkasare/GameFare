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
  timeout,
  isEven,
  styleStreamView,
} from '../../../../../functions/coach';

import colors from '../../../../../style/colors';
import styleApp from '../../../../../style/style';
import {heightHeaderHome, heightCardSession} from '../../../../../style/sizes';

import WatchVideoPage from '../../../WatchVideoPage/index';
import MembersView from './components/MembersView';
import Footer from './footer/index';
import CardStreamView from './components/CardStreamView';

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
      myVideo: false,
      pageFullScreen: false,
      coordinates: {x: 0, y: 0},
      opened: false,
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
    // reset drawing settings
    const {coachAction} = this.props;
    coachAction('setCoachSessionDrawSettings', {
      touchEnabled: false,
    });

    this.loadCoachSession();
  }
  async open(nextVal) {
    const {
      layoutAction,
      getScrollY,
      index,
      offsetScrollView,
      navigation,
      route,
      closeCurrentSession,
      coachSessionID,
    } = this.props;
    if (nextVal)
      await navigation.setParams({objectID: coachSessionID, openSession: true});
    else await navigation.setParams({openSession: false});

    if (nextVal) {
      const getScrollYValue = getScrollY();
      let xView = isEven(Number(index)) ? 0 : width / 2;
      let yView =
        offsetScrollView +
        (heightCardSession + 20) * Math.floor(Number(index) / 2) -
        getScrollYValue;

      ////// close current opened session
      const currentOpenSession = route.params.objectID;
      if (currentOpenSession && coachSessionID !== currentOpenSession)
        await closeCurrentSession(currentOpenSession);
      /////////////////////////

      await this.setState({
        coordinates: {x: xView, y: yView},
        pageFullScreen: true,
        opened: true,
      });
    }

    await layoutAction('setLayout', {isFooterVisible: !nextVal});

    Animated.spring(
      this.animatedPage,
      openStream(nextVal ? 1 : 0, 200),
    ).start();
    await timeout(220);

    const {coordinates, coachSession} = this.state;
    this.setState({
      pageFullScreen: nextVal,
      coordinates: !nextVal ? {x: 0, y: 0} : coordinates,
    });
    if (!coachSession && nextVal) this.loadCoachSession();
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
    const {coachSessionID} = this.props;
    // await firebase
    //   .database()
    //   .ref('coachSessions/' + coachSessionID)
    //   .off();
    await this.setState({opened: false});
    if (hangup) return this.open(false);
    return true;
  }

  loaderView(text, hideLoader) {
    return (
      <FadeInView
        duration={250}
        style={[styleApp.center, styles.loaderSessionTokBox]}>
        <Text style={[styleApp.text, {color: colors.white, marginBottom: 25}]}>
          {text}
        </Text>
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
    return subscribers.map((streamId, index) => {
      let heightViewSubscriber = height;
      const styleSubscriber = {
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
  streamPage() {
    const {
      coachSession,
      isConnected,
      publishAudio,
      loader,
      pageFullScreen,
    } = this.state;
    const {userID, userConnected} = this.props;

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

        <OTSession
          apiKey={Config.OPENTOK_API}
          ref={this.otSessionRef}
          eventHandlers={this.sessionEventHandlers}
          sessionId={sessionID}
          style={styleApp.fullSize}
          token={member.tokenTokbox}>
          <OTPublisher
            style={!userIsAlone ? styles.OTSubscriberAlone : styles.OTPublisher}
            properties={{
              cameraPosition,
              videoSource: 'camera',
              publishAudio: publishAudio,
            }}
            eventHandlers={this.publisherEventHandlers}
          />
          <OTSubscriber style={styles.OTSubscriber}>
            {this.renderSubscribers}
          </OTSubscriber>

          <MembersView session={coachSession} hide={!pageFullScreen} />
        </OTSession>
      </View>
    );
  }
  animatedValues() {
    const {x, y} = this.state.coordinates;
    let initialScaleX = (width / 2 - 30) / width;
    let initialScaleY = heightCardSession / height;
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
      outputRange: [x + 20 - ((1 - initialScaleX) * width) / 2, 0],
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
  render() {
    const {
      coachSession,
      isConnected,
      loader,
      coordinates,
      pageFullScreen,
      opened,
    } = this.state;

    const {navigation, index, coachSessionID} = this.props;
    const personSharingScreen = isSomeoneSharingScreen(coachSession);

    const {styleContainerStreamView, styleCard} = styleStreamView(
      index,
      coordinates,
      pageFullScreen,
    );

    const {scaleXCard, scaleYCard, xCard, yCard} = this.animatedValues();
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
              navigation={navigation}
              open={this.open.bind(this)}
            />
          )}

          {coachSession && opened && (
            <View style={styles.viewStream}>{this.streamPage()}</View>
          )}

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
}

const styles = StyleSheet.create({
  pageComponent: {
    backgroundColor: colors.title,
    ...styleApp.fullSize,
    // ...styleApp.center,
  },
  viewStream: {
    ...styleApp.fullSize,
    backgroundColor: colors.title,
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
