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

import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import CameraView from '../cameraView/index';
import Loader from '../../../layout/loaders/Loader';
import {timing} from '../../../animations/animations';

import {coachAction} from '../../../../actions/coachActions';
import {userAction} from '../../../../actions/userActions';
import {layoutAction} from '../../../../actions/layoutActions';
import {
  isUserAlone,
  createCoachSession,
  isSomeoneSharingScreen,
  userPartOfSession,
  isUserAdmin,
} from '../../../functions/coach';
import {audioVideoPermission} from '../../../functions/streaming';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import {
  offsetFooterStreaming,
  heightHeaderHome,
  heightFooter,
} from '../../../style/sizes';

import PermissionView from './components/PermissionView';
import WatchVideoPage from '../WatchVideoPage/index';
import MembersView from './components/MembersView';
import Footer from './footer/index';
import NewSessionView from '../WatchVideoPage/components/NewSessionView';

class StreamPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      isConnected: false,
      showPastSessionsPicker: false,
      coachSession: false,
      error: false,
      permissionsCamera: false,
      cameraFront: true,
      watchVideo: false,
      displayHomeView: true,
      publishAudio: false,
      myVideo: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.translateYFooter = new Animated.Value(0);
    this.translateYViewPublisher = new Animated.Value(0);
    this.translateXViewPublisher = new Animated.Value(0);
    this.otSessionRef = React.createRef();
    this.publisherEventHandlers = {
      streamCreated: async (event) => {
        const {userID, currentSessionID} = this.props;
        console.log('Publisher stream created!', event);

        await firebase
          .database()
          .ref(`coachSessions/${currentSessionID}/members/${userID}`)
          .update({
            isConnected: true,
            connectionIdTokbox: event.streamId,
          });
      },
      streamDestroyed: async (event) => {
        const {userID, currentSessionID} = this.props;
        await firebase
          .database()
          .ref(`coachSessions/${currentSessionID}/members/${userID}`)
          .update({
            isConnected: false,
          });
      },
    };
    this.sessionEventHandlers = {
      sessionDisconnected: async (event) => {
        const {userID, currentSessionID} = this.props;
        await firebase
          .database()
          .ref(`coachSessions/${currentSessionID}/members/${userID}`)
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
    console.log('Stream page mounted !!!!!!!');

    // reset drawing settings
    const {coachAction} = this.props;
    coachAction('setCoachSessionDrawSettings', {
      touchEnabled: false,
    });

    ///// Permission to camera / micro
    const permissionsCamera = await audioVideoPermission();
    await this.setState({permissionsCamera: permissionsCamera});
    if (!permissionsCamera) return;

    // //// load session
    // await this.setState({loader: true});
    // const {currentSessionID} = this.props;
    // if (currentSessionID) return this.setState({loader: false});
    // return this.loadCoachSession(currentSessionID);
  }
  componentDidUpdate(prevProps, prevState) {}
  async loadCoachSession(coachSessionID) {
    const {coachAction, currentSessionID} = this.props;
    const {coachSession} = this.state;
    console.log('loadCoachSession', coachSessionID);
    console.log(coachSession);
    //  return;
    if (coachSession && currentSessionID === coachSessionID)
      return this.setState({
        coachSession: coachSession,
        loader: false,
        error: false,
        displayHomeView: false,
      });
    if (!coachSessionID) this.endCoachSession();
    let objectID = false;
    const {userID, infoUser, route, userConnected} = this.props;

    if (route.params) objectID = route.params.objectID;

    //objectID = 'ojycbt6qejbk8r4a9ss';

    if (!userConnected)
      return this.setState({
        coachSession: false,
        loader: false,
      });
    if (!objectID)
      if (!coachSessionID)
        objectID = await createCoachSession({id: userID, info: infoUser});
      else objectID = coachSessionID;

    await coachAction('setCurrentCoachSessionID', objectID);
    const that = this;
    firebase
      .database()
      .ref('coachSessions/' + objectID)
      .on('value', async function (snap) {
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
        let member = {};
        if (members) members[userID];
        return that.setState({
          coachSession: session,
          loader: false,
          error: false,
          // isConnected: member.isConnected,
          displayHomeView: false,
        });
      });
  }
  async endCoachSession(coachSessionID) {
    await firebase
      .database()
      .ref('coachSessions/' + coachSessionID)
      .off();
    // await userAction('hideFooterApp');
    this.setState({coachSession: false});
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
      console.log('subscribers', streamId);
      const styleSubscriber = {
        height: height / subscribers.length,
        width: width,
        top: index * (height / subscribers.length),
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
    const {userID, userConnected, layoutAction} = this.props;

    const {sessionID} = coachSession.tokbox;
    if (!userConnected) return null;
    if (!sessionID) return this.loaderView('Creating the room...');

    const member = userPartOfSession(coachSession, userID);
    console.log('member session', member);

    let userIsAlone = isUserAlone(coachSession);
    const cameraPosition = this.cameraPosition();

    return (
      <View style={styleApp.fullSize}>
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
          icon1={'arrow-left'}
          typeIcon1="font"
          icon2={isUserAdmin(coachSession, userID) && 'person-add'}
          initialTitleOpacity={1}
          clickButton1={async () => {
            const {layoutAction} = this.props;
            this.setState({displayHomeView: true});
            await layoutAction('setLayout', {isFooterVisible: true});
          }}
          clickButton2={() => this.AddMembers(coachSession.objectID)}
          sizeIcon2={27}
          typeIcon2="mat"
          colorIcon2={colors.white}
        />

        {loader && this.loaderView(' ')}

        {!member
          ? this.loaderView('You are not a member of this conversation', true)
          : !isConnected
          ? this.loaderView('We are connecting you to the session...')
          : null}

        {}
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
  homeView() {
    const {error} = this.state;
    const {
      currentSessionID,
      userConnected,
      layoutAction,
      navigation,
    } = this.props;
    return (
      <NewSessionView
        currentSessionID={!currentSessionID ? '' : currentSessionID}
        userConnected={userConnected}
        layoutAction={layoutAction}
        error={error}
        navigation={navigation}
        loadCoachSession={this.loadCoachSession.bind(this)}
        endCoachSession={this.endCoachSession.bind(this)}
        setState={this.setState.bind(this)}
      />
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
  render() {
    const {
      coachSession,
      isConnected,
      permissionsCamera,
      loader,
      displayHomeView,
    } = this.state;
    const {userConnected, currentSessionID} = this.props;

    if (!permissionsCamera) return <PermissionView />;

    const {userID} = this.props;
    const personSharingScreen = isSomeoneSharingScreen(coachSession);
    return (
      <View style={styles.pageComponent}>
        <KeepAwake />

        {coachSession && (
          <View style={styles.viewStream}>{this.streamPage()}</View>
        )}

        {(!userConnected || displayHomeView) && this.homeView()}
        <WatchVideoPage
          state={this.state}
          onRef={(ref) => (this.watchVideoRef = ref)}
          personSharingScreen={personSharingScreen}
          session={coachSession}
          translateYFooter={this.translateYFooter}
          setState={this.setState.bind(this)}
        />

        {loader && this.loaderView(' ')}

        <Footer
          translateYFooter={this.translateYFooter}
          session={coachSession}
          state={this.state}
          currentSessionID={currentSessionID}
          setState={this.setState.bind(this)}
          watchVideoRef={this.watchVideoRef}
          displayFooter={isConnected}
          endCoachSession={this.endCoachSession.bind(this)}
        />
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
    width: width,
    height: height,
    position: 'absolute',
    zIndex: 4,
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
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    zIndex: -10,
  },
  loaderSessionTokBox: {
    height: height,
    backgroundColor: colors.primary2,
    width: width,
    position: 'absolute',
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
    currentSessionID: state.coach.currentSessionID,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps, {
  coachAction,
  userAction,
  layoutAction,
})(StreamPage);
