import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import {connect} from 'react-redux';
import {OTSession, OTPublisher, OTSubscriber} from 'opentok-react-native';
import Config from 'react-native-config';
import firebase from 'react-native-firebase';

import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import Button from '../../../layout/buttons/Button';

import {createCoachSession} from '../../../functions/coach';

import AllIcons from '../../../layout/icons/AllIcons';
import Loader from '../../../layout/loaders/Loader';
import {coachAction} from '../../../../actions/coachActions';
import {
  timeout,
  isUserAlone,
  isSomeoneSharingScreen,
} from '../../../functions/coach';
import {audioVideoPermission} from '../../../functions/streaming';
import {Col, Row} from 'react-native-easy-grid';

const {height, width} = Dimensions.get('screen');

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import FadeInView from 'react-native-fade-in-view';
import sizes from '../../../style/sizes';

const {height: screenHeight, width: screenWidth} = Dimensions.get('screen');
import PermissionView from './PermissionView';
import RightButtons from './RightButtons';
import DrawView from './DrawView';
import ShareScreenView from './ShareScreenView';
import MembersView from './MembersView';
import BottomButtons from './BottomButtons';
import PastSessions from './PastSessions';

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
      cameraPosition: 'front',
      videoSource: 'camera',

      hidePublisher: false,
      screen: false,
      draw: false,
      cameraFront: true,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.translateYViewPublisher = new Animated.Value(0);
    this.translateXViewPublisher = new Animated.Value(0);
    this.otSessionRef = React.createRef();
    this.sessionEventHandlers = {
      streamCreated: (event) => {
        console.log('Stream created!', event);
      },
      sessionDisconnected: async (event) => {
        console.log('session disconnected !!!!', event);
        const {userID} = this.props;
        console.log('userID', userID);
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
        console.log('session connected !!!!', event);
        const {userID} = this.props;
        await firebase
          .database()
          .ref(
            'coachSessions/' +
              this.state.coachSession.objectID +
              '/members/' +
              userID,
          )
          .update({isConnected: true});
        this.setState({
          isConnected: true,
        });
      },
    };
    this.componentDidMount = this.componentDidMount.bind(this);
  }
  async componentDidMount() {
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
  async loadCoachSession(coachSessionID) {
    const {coachAction} = this.props;
    const {userID, infoUser} = this.props;

    let objectID = this.props.navigation.getParam('objectID');
    // let objectID = 'fdxs572u7gk86iq0zc';

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
        console.log('coachSession', session);
        if (!session) return that.setState({newSession: true, loader: false});
        return that.setState({coachSession: session, loader: false});
      });
  }
  AddMembers() {
    const {navigate} = this.props.navigation;
    const currentRoot = this.props.navigation.state.routeName;

    const {coachSession} = this.state;
    const {objectID} = coachSession;
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
        return navigate(currentRoot);
      },
    });
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

  switchScreenshare = async () => {
    const {screen} = this.state;
    await this.setState({screen: 'undisplay'});
    await timeout(200);
    await this.setState({screen: !screen});
  };
  videoSource(shareScreen) {
    return 'camera';
    if (!shareScreen) return 'camera';
    return 'screen';
  }
  cameraPosition() {
    const {cameraFront} = this.state;
    if (cameraFront) return 'front';
    return 'back';
  }
  userPartOfSession(session) {
    const {userID} = this.props;
    if (!session) return false;
    if (!session.allMembers) return false;
    if (!session.allMembers[userID]) return false;
    return true;
  }
  newSessionView() {
    const {currentSessionID} = this.props;
    return (
      <View
        style={[
          styleApp.center2,
          {
            height: screenHeight,
            backgroundColor: colors.title,
            width: width,
          },
        ]}>
        <Button
          backgroundColor="green"
          onPressColor={colors.greenClick}
          styleButton={styleApp.marginView}
          enabled={true}
          text="Resume session"
          loader={false}
          click={async () => {
            await this.setState({
              loader: true,
              newSession: false,
              isConnected: false,
            });
            this.loadCoachSession(currentSessionID);
          }}
        />
        <View style={{height: 20}} />
        <Button
          backgroundColor="primary"
          onPressColor={colors.primaryLight}
          styleButton={styleApp.marginView}
          enabled={true}
          text="New session"
          loader={false}
          click={async () => {
            await this.setState({
              loader: true,
              newSession: false,
              isConnected: false,
            });
            this.loadCoachSession();
          }}
        />
      </View>
    );
  }
  streamPage() {
    const {
      loader,
      showPastSessionsPicker,
      coachSession,
      hidePublisher,
      newSession,
      isConnected,
    } = this.state;
    const {userID} = this.props;

    if (loader) return this.loaderView('Loading...');
    if (newSession) return this.newSessionView();

    const {sessionID} = coachSession.tokbox;
    if (!sessionID) return this.loaderView('Loading...');

    if (!this.userPartOfSession(coachSession))
      return (
        <View style={[styleApp.center, {height: 300, width: width}]}>
          <Text style={[styleApp.text, {color: colors.white}]}>
            You are not a member of this conversation
          </Text>
        </View>
      );

    const member = coachSession.members[userID];

    const {shareScreen} = member;
    const userIsAlone = isUserAlone(coachSession);
    const personSharingScreen = isSomeoneSharingScreen(coachSession, userID);
    console.log('personSharingScreen,', personSharingScreen);

    const cameraPosition = this.cameraPosition();
    const videoSource = this.videoSource(shareScreen);
    return (
      <View
        style={[
          styleApp.fullSize,
          {flex: 1, position: 'absolute', zIndex: -1},
        ]}>
        {!isConnected &&
          this.loaderView('We are connecting you to the session...')}

        <OTSession
          //eventHandlers={this.sesssionEventHandlers}
          apiKey={Config.OPENTOK_API}
          ref={this.otSessionRef}
          eventHandlers={this.sessionEventHandlers}
          sessionId={sessionID}
          token={member.token}>
          <OTSubscriber style={styles.OTSubscriber} />

          <Animated.View
            style={[
              userIsAlone ? styles.OTPublisherAlone : styles.OTPublisher,
              {backgroundColor: colors.greyDark},
              {
                transform: [
                  {translateY: this.translateYViewPublisher},
                  {translateX: this.translateXViewPublisher},
                ],
              },
            ]}>
            {!hidePublisher && (
              <OTPublisher
                eventHandlers={this.publisherEventHandlers}
                style={styleApp.fullSize}
                properties={{cameraPosition, videoSource}}
              />
            )}
          </Animated.View>

          <ShareScreenView
            shareScreen={member.shareScreen}
            personSharingScreen={personSharingScreen}
            session={coachSession}
          />

          {!personSharingScreen && !shareScreen && (
            <FadeInView duration={300} style={styles.footer}>
              <BottomButtons
                session={coachSession}
                AddMembers={this.AddMembers.bind(this)}
                showPastSessionsPicker={showPastSessionsPicker}
                clickReview={(val) => this.pastSessionsRef.open(val)}
              />
              <View style={{height: 20}}></View>
              <PastSessions
                translateYViewPublisher={this.translateYViewPublisher}
                onRef={(ref) => (this.pastSessionsRef = ref)}
              />
            </FadeInView>
          )}
        </OTSession>
      </View>
    );
  }

  render() {
    const {goBack, navigate} = this.props.navigation;
    const {loader, permissionsCamera, draw, isConnected} = this.state;
    const {userID} = this.props;
    const {coachSession} = this.state;
    const personSharingScreen = isSomeoneSharingScreen(coachSession, userID);
    return (
      <View
        style={[
          styleApp.stylePage,
          {height: height, width: width},
          {backgroundColor: colors.title},
        ]}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          loader={false}
          colorLoader={'white'}
          colorIcon1={colors.white}
          sizeLoader={40}
          sizeIcon1={21}
          nobackgroundColorIcon1={true}
          backgroundColorIcon1={'transparent'}
          initialBorderColorIcon={'transparent'}
          icon1="times"
          initialTitleOpacity={1}
          icon2={null}
          clickButton1={() => navigate('Stream')}
        />

        {this.userPartOfSession(coachSession) &&
          isConnected &&
          !personSharingScreen && (
            <View>
              <MembersView session={coachSession} />

              <RightButtons
                state={this.state}
                session={coachSession}
                setState={this.setState.bind(this)}
                switchScreenshare={this.switchScreenshare.bind(this)}
              />

              <DrawView draw={draw} />
            </View>
          )}

        {this.streamPage()}

        {!permissionsCamera && <PermissionView />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  footer: {
    bottom: 0,
    width: width,
    position: 'absolute',
    backgroundColor: 'transparent',
    flex: 1,
    zIndex: 5,
  },
  OTSubscriber: {
    width: screenWidth,
    height: screenHeight,
    zIndex: 1,
  },
  OTPublisherAlone: {
    width: screenWidth,
    height: screenHeight,
    position: 'absolute',
    top: 0,
    // overflow: 'hidden',
    //  top: sizes.marginTopApp + 10,
    zIndex: 2,
  },
  OTPublisher: {
    width: 110,
    height: 150,
    borderRadius: 5,
    position: 'absolute',
    bottom: 140,
    overflow: 'hidden',
    //  top: sizes.marginTopApp + 10,
    right: 20,
    zIndex: 2,
    borderWidth: 1,
    borderColor: colors.off,
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
  };
};

export default connect(mapStateToProps, {coachAction})(StreamPage);
