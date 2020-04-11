import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
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
import {Col, Row} from 'react-native-easy-grid';

const {height, width} = Dimensions.get('screen');

import HeaderBackButton from '../../../../layout/headers/HeaderBackButton';
import Loader from '../../../../layout/loaders/Loader';
import {timing, native, openStream} from '../../../../animations/animations';

import {coachAction} from '../../../../../actions/coachActions';
import {userAction} from '../../../../../actions/userActions';
import {layoutAction} from '../../../../../actions/layoutActions';
import {
  isUserAlone,
  isSomeoneSharingScreen,
  userPartOfSession,
  isUserAdmin,
  timeout,
} from '../../../../functions/coach';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import {heightHeaderHome} from '../../../../style/sizes';

import WatchVideoPage from '../../WatchVideoPage/index';
import MembersView from './MembersView';
import Footer from '../footer/index';

const isEven = (n) => {
  return !(n & 1);
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
      myVideo: false,
      pageFullScreen: false,
      coordinates: {x: 0, y: 0},
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.translateYFooter = new Animated.Value(0);
    this.translateYViewPublisher = new Animated.Value(0);
    this.translateXViewPublisher = new Animated.Value(0);
    this.animatedPage = new Animated.Value(0);
    this.otSessionRef = React.createRef();

    this.publisherEventHandlers = {
      streamCreated: async (event) => {
        const {userID, coachSessionID} = this.props;
        console.log('Publisher stream created!', event);

        await firebase
          .database()
          .ref(`coachSessions/${coachSessionID}/members/${userID}`)
          .update({
            isConnected: true,
            connectionIdTokbox: event.streamId,
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
          coachSession: false,
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
  }

  componentDidUpdate(prevProps, prevState) {}
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
    await firebase
      .database()
      .ref('coachSessions/' + coachSessionID)
      .off();
    await this.setState({coachSession: false});
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
    const {coachSession, isConnected, publishAudio, loader} = this.state;
    const {userID, userConnected} = this.props;

    const {sessionID} = coachSession.tokbox;
    if (!userConnected) return null;
    if (!sessionID) return this.loaderView('Creating the room...');

    const member = userPartOfSession(coachSession, userID);

    let userIsAlone = isUserAlone(coachSession);
    const cameraPosition = this.cameraPosition();

    return (
      <View style={styleApp.fullSize}>
        {loader && this.loaderView(' ')}

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

          <MembersView session={coachSession} />
        </OTSession>
      </View>
    );
  }
  AddMembers = (objectID) => {
    const {navigate} = this.props.navigation;
    navigate('PickMembers', {
      usersSelected: {},
      selectMultiple: true,
      closeButton: true,
      loaderOnSubmit: true,
      displayCurrentUser: true,
      titleHeader: 'Add someone to the session',
      onGoBack: async (members) => {
        for (var i in Object.values(members)) {
          const member = Object.values(members)[i];
          await firebase
            .database()
            .ref('coachSessions/' + objectID + '/members/' + member.id)
            .update(member);
        }
        return navigate('Stream');
      },
    });
  };
  animatedValues() {
    const {heightCardSession} = this.props;
    const {x, y} = this.state.coordinates;
    let initialScaleX = (width / 2 - 40) / width;
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
  async open(nextVal) {
    const {
      layoutAction,
      getScrollY,
      index,
      offsetScrollView,
      heightCardSession,
      navigation,
      route,
      closeCurrentSession,
      coachSessionID,
    } = this.props;
    if (nextVal) {
      const getScrollYValue = getScrollY();
      let xView = isEven(Number(index)) ? 0 : width / 2;
      let yView =
        offsetScrollView +
        (heightCardSession + 20) * Math.floor(Number(index) / 2) -
        getScrollYValue;
      console.log('xView!!!!', xView);

      ////// close current opened session

      const currentOpenSession = route.params.objectID;
      console.log('currentOpenSession', currentOpenSession);
      console.log('coachSessionID', coachSessionID);
      if (currentOpenSession && coachSessionID !== currentOpenSession)
        await closeCurrentSession(currentOpenSession);
      /////////////////////////

      await this.setState({
        coordinates: {x: xView, y: yView},
        pageFullScreen: true,
      });

      await navigation.setParams({objectID: coachSessionID, openSession: true});
    } else await navigation.setParams({openSession: false});
    console.log('coordinates coordinates', this.state.coordinates);
    await layoutAction('setLayout', {isFooterVisible: !nextVal});
    //     this.setState({
    //   pageFullScreen: nextVal,
    //   coordinates: !nextVal ? {x: 0, y: 0} : this.state.coordinates,
    // });
    Animated.spring(
      this.animatedPage,
      openStream(nextVal ? 1 : 0, 200),
    ).start();
    await timeout(220);
    const {coordinates, coachSession, pageFullScreen} = this.state;
    this.setState({
      pageFullScreen: nextVal,
      coordinates: !nextVal ? {x: 0, y: 0} : coordinates,
    });
    if (!coachSession && nextVal) this.loadCoachSession();
  }
  render() {
    const {
      coachSession,
      isConnected,
      loader,
      coordinates,
      pageFullScreen,
    } = this.state;

    const {userID, heightCardSession} = this.props;
    const personSharingScreen = isSomeoneSharingScreen(coachSession);

    let containerStreamView = {
      borderRadius: 9,
      marginTop: 0,
      width: width / 2 - 40,
      overflow: 'hidden',
      height: heightCardSession,
      borderWidth: 1,
      borderColor: colors.off,
    };
    let styleCard = {
      height: heightCardSession,
      width: width - 20 / 2,
      borderRadius: 6,
      position: 'relative',
    };
    if (pageFullScreen) {
      styleCard = [
        // transform: [{translateX: xCard}, {translateY: yCard}],
        // {transform: [{translateX: xCard}, {translateY: yCard}]},
        {
          position: 'absolute',
          height: height,
          width: width,
          backgroundColor: colors.title,
        },
      ];
      containerStreamView = {
        position: 'absolute',
        // backgroundColor:'blue',
        // backgroundColor: colors.title,
        zIndex: 50,
        top: -coordinates.y,
        left: -coordinates.x,
        height: height,
        width: width,
        borderRadius: 10,
      };
    }
    console.log('pageFullScreen!!', pageFullScreen);

    const {scaleXCard, scaleYCard, xCard, yCard} = this.animatedValues();
    console.log('scaleX', scaleXCard);
    console.log('scaleYCard', scaleYCard);
    return (
      <View style={containerStreamView}>
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
            <HeaderBackButton
              AnimatedHeaderValue={this.AnimatedHeaderValue}
              inputRange={[5, 10]}
              colorLoader={'white'}
              colorIcon1={colors.white}
              sizeLoader={40}
              sizeIcon1={22}
              nobackgroundColorIcon1={true}
              backgroundColorIcon1={'transparent'}
              backgroundColorIcon2={'transparent'}
              initialBorderColorIcon={'transparent'}
              icon1={'chevron-down'}
              typeIcon1="font"
              icon2={
                !coachSession
                  ? null
                  : isUserAdmin(coachSession, userID)
                  ? 'person-add'
                  : null
              }
              initialTitleOpacity={1}
              clickButton1={async () => {
                this.open(false);
              }}
              clickButton2={() => this.AddMembers(coachSession.objectID)}
              sizeIcon2={27}
              typeIcon2="mat"
              colorIcon2={colors.white}
            />
          )}

          {coachSession && (
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
            <TouchableOpacity
              onPress={() => this.open(true)}
              activeOpacity={1}
              style={[
                styleApp.fullView,
                {backgroundColor: colors.greyDark + '60'},
              ]}>
              {coachSession && (
                <Row
                  style={{
                    //  position: 'absolute',
                    bottom: 0,
                    //  backgroundColor: 'red',
                    paddingLeft: 10,
                    zIndex: 20,
                    height: 40,
                    width: width / 2 - 40,
                    paddingRight: 10,
                  }}>
                  <Col size={60}>
                    {/* <Image
                      source={require('../../../../../img/icons/endCall.png')}
                      style={{width: 25, height: 25}}
                    /> */}
                  </Col>
                  <Col size={20} />
                  <Col
                    size={20}
                    activeOpacity={0.7}
                    style={styleApp.center}
                    onPress={() => this.endCoachSession()}>
                    <Image
                      source={require('../../../../../img/icons/endCall.png')}
                      style={{width: 25, height: 25}}
                    />
                  </Col>
                </Row>
              )}
            </TouchableOpacity>
          )}

          {loader && this.loaderView(' ')}

          {pageFullScreen && (
            <Footer
              translateYFooter={this.translateYFooter}
              session={coachSession}
              state={this.state}
              setState={this.setState.bind(this)}
              watchVideoRef={this.watchVideoRef}
              displayFooter={isConnected}
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
