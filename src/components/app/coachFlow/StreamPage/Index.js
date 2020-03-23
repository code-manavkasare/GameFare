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
import BottomButtons from './BottomButtons';
import PastSessions from './PastSessions';

import {createCoachSession} from '../../../functions/coach';

import AllIcons from '../../../layout/icons/AllIcons';
import {coachAction} from '../../../../actions/coachActions';
import {timeout} from '../../../functions/coach';
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

class StreamPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      isConnected: false,
      showPastSessionsPicker: false,
      coachSession: false,
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
      streamCreated: event => {
        console.log('Stream created!', event);
      },
      streamDestroyed: event => {
        console.log('Stream destroyed!', event);
        firebase.database().ref('coachSessions/' + this.state.coachSession.objectID + '/members/' + this.props.userID).update({connected:false})
      },
      sessionDisconnected: async (event) => {
        console.log('session disconnected !!!!',event)
        await firebase.database().ref('coachSessions/' + this.state.coachSession.objectID + '/members/' + this.props.userID).update({connected:false})
        this.setState({
          isConnected: false,
        })
      },
      sessionConnected: async (event) => {
        console.log('session connected !!!!',event)
        await firebase.database().ref('coachSessions/' + this.state.coachSession.objectID + '/members/' + this.props.userID).update({connected:true})
        this.setState({
          isConnected: true,
        })
      }
    };
    this.componentDidMount = this.componentDidMount.bind(this);
  }
  async componentDidMount() {
    ///// Permission to camera / micro
    const permissionsCamera = await audioVideoPermission();
    await this.setState({permissionsCamera: permissionsCamera});
    if (!permissionsCamera) return;

    //// load session
    this.loadCoachSession();
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.currentSessionID !== this.props.currentSessionID)
      return false;
    return true;
  }
  async loadCoachSession() {
    const {coachAction, currentSessionID} = this.props;
    const {userID, infoUser} = this.props;

    let objectID = this.props.navigation.getParam('objectID');

    if (!objectID)
      if (!currentSessionID)
        objectID = await createCoachSession({id: userID, info: infoUser});
      else objectID = currentSessionID;

    await coachAction('setCurrentCoachSessionID', objectID);
    const that = this;
    firebase
      .database()
      .ref('coachSessions/' + objectID)
      .on('value', async function(snap) {
        let session = snap.val();
        console.log('coachSession', session);
        if (!session) return null;
        that.setState({coachSession: session, loader: false});
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

  loaderView() {
    const {loader} = this.state;
    if (loader) return <FadeInView duration={300} style={styles.loaderView} />;
    return null;
  }

  switchScreenshare = async () => {
    const {screen} = this.state;
    await this.setState({screen: 'undisplay'});
    await timeout(200);
    await this.setState({screen: !screen});
  };

  videoSource() {
    const {screen} = this.state;

    if (screen) return 'screen';
    return 'camera';
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
  streamPage() {
    const cameraPosition = this.cameraPosition();
    const videoSource = this.videoSource();
    const {
      loader,
      showPastSessionsPicker,
      coachSession,
      hidePublisher,
      screen,
      isConnected
    } = this.state;
    const {userID} = this.props;

    if (!coachSession) return this.loaderView();
    const {sessionID} = coachSession.tokbox;
    if (!sessionID) return this.loaderView();

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
    console.log('member', member);
    

    return (
      <View
        style={[
          styleApp.fullSize,
          {flex: 1, position: 'absolute', zIndex: -1},
        ]}>
        <OTSession
          //eventHandlers={this.sesssionEventHandlers}
          apiKey={Config.OPENTOK_API}
          ref={this.otSessionRef}
          eventHandlers={this.sessionEventHandlers}
          sessionId={sessionID}
          token={member.token}>
            {!isConnected &&<View style={{height:height,backgroundColor:colors.greyDark,width:width,position:'absolute',zIndez:40,opoacity:0.6}}></View>}
          <OTSubscriber style={styles.OTSubscriber} />

          <Animated.View
            style={[
              styles.OTPublisher,
              {backgroundColor: colors.grey},
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

          <ShareScreenView shareScreen={member.shareScreen} />

          {!shareScreen ? (
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
          ) : null}
        </OTSession>
      </View>
    );
  }

  render() {
    const {goBack, navigate} = this.props.navigation;
    const {loader, permissionsCamera, draw} = this.state;
    const {coachSession} = this.state;
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
          loader={loader}
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

        {this.userPartOfSession(coachSession) && (
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
