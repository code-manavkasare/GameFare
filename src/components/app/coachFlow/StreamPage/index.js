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
import {offsetFooterStreaming, heightHeaderHome} from '../../../style/sizes';

import PermissionView from './components/PermissionView';
import WatchVideoPage from '../WatchVideoPage/index';
import MembersView from './components/MembersView';
import Footer from './footer/index';
import NewSessionView from '../WatchVideoPage/components/NewSessionView';

class StreamPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      isConnected: false,
      showPastSessionsPicker: false,
      coachSession: false,
      newSession: false,
      permissionsCamera: false,
      cameraFront: true,
      watchVideo: false,
      publishAudio: false,
      myVideo: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.translateYFooter = new Animated.Value(0);
    this.translateYViewPublisher = new Animated.Value(0);
    this.translateXViewPublisher = new Animated.Value(0);
    this.otSessionRef = React.createRef();
    this.sessionEventHandlers = {
      streamCreated: (event) => {
        console.log('Stream created!', event);
      },
      sessionDisconnected: async (event) => {
        const {userID} = this.props;
        await firebase
          .database()
          .ref(
            'coachSessions/' +
              this.state.coachSession.objectID +
              '/members/' +
              userID,
          )
          .update({isConnected: false});
        this.setState({
          isConnected: false,
        });
      },
      sessionConnected: async (event) => {
        const {userID} = this.props;
        console.log('session connected !!', event);
        let updates = {};
        updates[
          `coachSessions/${this.state.coachSession.objectID}/members/${userID}/isConnected`
        ] = true;
        updates[
          `coachSessions/${this.state.coachSession.objectID}/members/${userID}/connectionIdTokbox`
        ] = event.connection.connectionId;
        await firebase
          .database()
          .ref()
          .update(updates);
        this.setState({
          isConnected: true,
        });
      },
    };
    this.componentDidMount = this.componentDidMount.bind(this);
  }
  async componentDidMount() {
    // reset drawing settings
    const {coachAction} = this.props;
    coachAction('setCoachSessionDrawSettings', {
      touchEnabled: false,
    });

    ///// Permission to camera / micro
    const permissionsCamera = await audioVideoPermission();
    await this.setState({permissionsCamera: permissionsCamera});
    if (!permissionsCamera) return;

    //// load session
    const {currentSessionID} = this.props;
    if (currentSessionID)
      return this.setState({loader: false, newSession: true});
    return this.loadCoachSession(currentSessionID);
  }
  componentDidUpdate(prevProps, prevState) {}
  async loadCoachSession(coachSessionID) {
    const {coachAction} = this.props;
    const {userID, infoUser} = this.props;

    let objectID = this.props.navigation.getParam('objectID');
    objectID = 'q9y9f1mtkak8e5apgc';

    if (!objectID)
      if (!coachSessionID)
        objectID = await createCoachSession({id: userID, info: infoUser});
      else objectID = coachSessionID;

    await coachAction('setCurrentCoachSessionID', objectID);
    const that = this;
    firebase
      .database()
      .ref('coachSessions/' + objectID)
      .on('value', async function(snap) {
        let session = snap.val();
        if (!session) return that.setState({newSession: true, loader: false});
        return that.setState({coachSession: session, loader: false});
      });
  }
  async endCoachSession() {
    const {objectID} = this.state.coachSession;
    await firebase
      .database()
      .ref('coachSessions/' + objectID)
      .off();
    this.setState({newSession: true});
  }

  loaderView(text) {
    return (
      <FadeInView
        duration={250}
        style={[styleApp.center, styles.loaderSessionTokBox]}>
        <Text style={[styleApp.text, {color: colors.white, marginBottom: 25}]}>
          {text}
        </Text>
        <Loader size={34} color={'white'} />
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
        <View
          // onPress={() => this.handleStreamPress(streamId)}
          key={streamId}
          style={styleSubscriber}>
          <OTSubscriberView streamId={streamId} style={styleApp.fullSize} />
        </View>
      );
    });
  };
  streamPage() {
    const {
      loader,
      coachSession,
      newSession,
      isConnected,
      publishAudio,
    } = this.state;
    const {userID, currentSessionID, userConnected} = this.props;

    if (loader) return this.loaderView(' ');
    if (newSession || !userConnected)
      return (
        <NewSessionView
          currentSessionID={currentSessionID}
          userConnected={userConnected}
          loadCoachSession={this.loadCoachSession.bind(this)}
          setState={this.setState.bind(this)}
        />
      );
    const {sessionID} = coachSession.tokbox;
    if (!sessionID) return this.loaderView('Loading...');

    const member = userPartOfSession(coachSession, userID);
    console.log('member', member);
    if (!member)
      return (
        <View style={[styleApp.center, {height: 300, width: width}]}>
          <Text style={[styleApp.text, {color: colors.white}]}>
            You are not a member of this conversation
          </Text>
        </View>
      );

    let userIsAlone = isUserAlone(coachSession);
    const cameraPosition = this.cameraPosition();

    return (
      <View style={[styles.fullSize]}>
        {!isConnected &&
          this.loaderView('We are connecting you to the session...')}

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
          />

          <OTSubscriber style={styles.OTSubscriber}>
            {this.renderSubscribers}
          </OTSubscriber>
        </OTSession>

        <MembersView session={coachSession} />
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
        return navigate('StreamPageCoaching');
      },
    });
  };
  render() {
    const {dismiss} = this.props.navigation;
    const {
      coachSession,
      isConnected,
      permissionsCamera,
      newSession,
    } = this.state;
    const {userID} = this.props;
    const personSharingScreen = isSomeoneSharingScreen(coachSession);
    return (
      <View style={styles.pageComponent}>
        <KeepAwake />
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          inputRange={[5, 10]}
          colorLoader={'white'}
          colorIcon1={colors.white}
          sizeLoader={40}
          sizeIcon1={21}
          nobackgroundColorIcon1={true}
          backgroundColorIcon1={'transparent'}
          backgroundColorIcon2={'transparent'}
          initialBorderColorIcon={'transparent'}
          // icon1="times"
          icon2={
            !newSession &&
            coachSession &&
            isUserAdmin(coachSession, userID) &&
            'user-plus'
          }
          initialTitleOpacity={1}
          clickButton1={() => dismiss()}
          clickButton2={() => this.AddMembers(coachSession.objectID)}
          sizeIcon2={21}
          typeIcon2="font"
          colorIcon2={colors.white}
        />
        <View style={styles.viewStream}>{this.streamPage()}</View>

        {!permissionsCamera && <PermissionView />}

        <WatchVideoPage
          state={this.state}
          onRef={(ref) => (this.watchVideoRef = ref)}
          personSharingScreen={personSharingScreen}
          session={coachSession}
          translateYFooter={this.translateYFooter}
          setState={this.setState.bind(this)}
        />

        {!newSession && (
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  pageComponent: {backgroundColor: colors.title, ...styleApp.fullSize},
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
    zIndex: 40,
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

export default connect(mapStateToProps, {coachAction})(StreamPage);
