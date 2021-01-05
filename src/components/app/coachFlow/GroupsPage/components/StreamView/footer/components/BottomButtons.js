import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image, Alert} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import queue, {Worker} from 'react-native-job-queue';
import RecordingMenu from './RecordingMenu';

import {goBack, navigate} from '../../../../../../../../../NavigationService';
import GuidedInteraction from '../../../../../../../utility/initialInteractions/GuidedInteraction';
import ButtonColor from '../../../../../../../layout/Views/Button';
import AllIcons from '../../../../../../../layout/icons/AllIcons';

import {layoutAction} from '../../../../../../../../store/actions/layoutActions';
import {getDimention} from '../../../../../../../style/sizes';
const {width} = getDimention();
import {store} from '../../../../../../../../store/reduxStore';

import {
  startRemoteRecording,
  stopRemoteRecording,
  updateTimestamp,
  setupOpentokStopRecordingFlow,
  toggleVideoPublish,
  closeSession,
} from '../../../../../../../functions/coach';
import {getOpentokVideoInfo} from '../../../../../../../functions/pictures';

import {offsetFooterStreaming} from '../../../../../../../style/sizes';
import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';

import {native} from '../../../../../../../animations/animations';

import {
  permission,
  goToSettings,
} from '../../../../../../../functions/pictures';
import isEqual from 'lodash.isequal';
import {coachAction} from '../../../../../../../../store/actions/coachActions';
import {
  userConnectedSelector,
  userIDSelector,
  userInfoSelector,
} from '../../../../../../../../store/selectors/user';
import {
  endCurrentSessionSelector,
  reconnectingSelector,
  recordingSessionSelector,
} from '../../../../../../../../store/selectors/sessions';
import {cloudVideosSelector} from '../../../../../../../../store/selectors/archives';
import {watchVideosLive} from '../../../../../../../database/firebase/videosManagement';
import VideoBeingShared from '../../../../../../videoLibraryPage/components/VideoBeingShared';

class BottomButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      endCurrentSession: false,
      anyMemberRecording: false,
      recordingUser: undefined,
      shouldStartRecording: false,
      shouldStopRecording: false,
      discardFile: false,
      publishVideo: this.props.publishVideo,
      publishAudio: this.props.publishAudio,
      unreadVideos: 0,
      seenVideos: 0,
      finalizeRecordingMember: false,
    };
    this.recordingIndicator = {
      color: new Animated.Value(0),
    };
  }
  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
    this.configureQueue();
  }
  static getDerivedStateFromProps(props, state) {
    var newState = {};
    const {members, userID, archivedStreams, recording} = props;
    const {seenVideos, finalizeRecordingMember} = state;
    // unseen videos indicator
    const archivedVideosLength = archivedStreams
      ? Object.keys(archivedStreams).length
      : 0;
    if (archivedVideosLength > seenVideos && seenVideos > 0) {
      newState = {...newState, unreadVideos: archivedVideosLength - seenVideos};
    } else {
      newState = {...newState, seenVideos: archivedVideosLength};
    }
    // receive firebase startRemoteRecording/stopRemoteRecording instruction
    const firebaseSelf = members ? members[userID] : undefined;
    if (firebaseSelf && firebaseSelf.recording) {
      const {isRecording} = firebaseSelf.recording;
      if (isRecording && !recording) {
        newState = {...newState, shouldStartRecording: true};
      } else if (!isRecording && recording) {
        newState = {...newState, shouldStopRecording: true};
      } else {
        newState = {
          ...newState,
          shouldStopRecording: false,
          shouldStartRecording: false,
        };
      }
    }
    const anyMemberRecording = Object.values(members).reduce((m, val) => {
      return m || val?.recording?.isRecording;
    }, false);
    newState = {
      ...newState,
      anyMemberRecording,
    };
    if (
      finalizeRecordingMember &&
      !isEqual(members[finalizeRecordingMember.id], finalizeRecordingMember)
    ) {
      newState = {
        ...newState,
        finalizeRecordingMember: members[finalizeRecordingMember.id],
      };
    }
    return newState;
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      layoutAction,
      endCurrentSession,
      currentSessionReconnecting,
    } = this.props;
    const {anyMemberRecording} = this.state;
    if (!prevProps.endCurrentSession && endCurrentSession) {
      this.onEndCurrentSession();
    }
    if (currentSessionReconnecting && this.recordingMenuRef.state.visible) {
      this.recordingMenuRef.close();
    }
    const {shouldStartRecording, shouldStopRecording, discardFile} = this.state;

    if (shouldStartRecording && !prevState.shouldStartRecording) {
      queue.addJob('startRecording');
    } else if (shouldStopRecording && !prevState.shouldStopRecording) {
      queue.addJob('stopRecording', {discardFile});
    }

    if (
      ((anyMemberRecording !== undefined) !== prevState.undefined) !==
      undefined
    ) {
      layoutAction('setGeneralSessionRecording', anyMemberRecording);
    }
  }

  configureQueue() {
    queue.removeWorker('startRecording');
    queue.removeWorker('stopRecording');
    queue.addWorker(
      new Worker('startRecording', this.startRecording.bind(this)),
    );
    queue.addWorker(new Worker('stopRecording', this.stopRecording.bind(this)));
  }
  clickRecord = async () => {
    const {currentSessionReconnecting} = this.props;
    if (currentSessionReconnecting) {
      return;
    }
    return this.recordingMenuRef.state.visible
      ? this.recordingMenuRef.close()
      : this.recordingMenuRef.open();
  };
  startRemoteRecording = async (member) => {
    const {coachSessionID, userID} = this.props;
    const recordingUser = member.id;
    await startRemoteRecording(recordingUser, coachSessionID, userID);
  };
  stopRemoteRecording = async (member) => {
    const {coachSessionID, userID} = this.props;
    const {portrait} = member;
    const recordingUser = member.id;
    await stopRemoteRecording(recordingUser, coachSessionID, portrait, userID);

    await this.setState({finalizeRecordingMember: member});
    return true;
  };
  startRecording = async (prevStartError = false) => {
    const {coachSessionID, userID, getCameraPosition} = this.props;
    const messageCallback = async (response) => {
      if (response.error) {
        if (response.message === 'INIT_ERR' && !prevStartError) {
          this.startRecording(true);
        } else {
          console.log(`Error initializing recording: ${response.message}`);
        }
        return false;
      }
      const cameraPosition = getCameraPosition();
      let {orientation} = store.getState().layout.currentScreenSize;

      /// If camera position is rear facing and device is landscape
      /// transformation needs to be reversed
      if (cameraPosition === 'back') {
        orientation =
          orientation === 'landscapeLeft'
            ? 'landscapeRight'
            : orientation === 'landscapeRight'
            ? 'landscapeLeft'
            : orientation;
      }

      updateTimestamp(coachSessionID, userID, Date.now(), orientation);
    };
    const permissionLibrary = await permission('library');
    if (!permissionLibrary) {
      return navigate('Alert', {
        textButton: 'Open Settings',
        title:
          'You need to allow access to your library before you record a video.',
        subtitle:
          'At the end of the record, we will save the file under your library.',
        colorButton: 'blue',
        onPressColor: colors.blueLight,
        onGoBack: () => goToSettings(),
        icon: (
          <Image
            source={require('../../../../../../../../img/icons/technology.png')}
            style={{width: 25, height: 25}}
          />
        ),
      });
    } else {
      const {otPublisherRef, coachAction} = this.props;
      const succeeded = await otPublisherRef.current.startRecording(
        messageCallback,
      );
      coachAction('setRecording', true);
    }
  };
  stopRecording = async ({discardFile}) => {
    const {
      members,
      userID,
      coachSessionID,
      otPublisherRef,
      coachAction,
    } = this.props;
    const messageCallback = async (response) => {
      coachAction('setRecording', false);
      if (!discardFile) {
        if (response.error) {
          return Alert.alert(`Error storing recording: ${response.message}`);
        } else {
          const {videoUrl} = response;
          const videoInfo = await getOpentokVideoInfo(videoUrl);
          const member = members[userID];
          setupOpentokStopRecordingFlow(
            videoInfo,
            member?.recording?.flags,
            coachSessionID,
            userID,
          );
        }
      }
    };
    await otPublisherRef.current.stopRecording(messageCallback);
  };
  publishVideo() {
    const {setState, coachSessionID, userID} = this.props;
    const {publishVideo} = this.state;
    return (
      <ButtonColor
        view={() => {
          return (
            <Animated.View style={styleApp.center}>
              <AllIcons
                type={'font'}
                color={publishVideo ? colors.white : colors.grey}
                size={18}
                name={publishVideo ? 'video' : 'video-slash'}
              />
            </Animated.View>
          );
        }}
        color={'transparent'}
        onPressColor={'transparent'}
        click={async () => {
          await this.setState({publishVideo: !publishVideo});
          setState({publishVideo: !publishVideo});
          toggleVideoPublish(coachSessionID, userID, !publishVideo);
        }}
        style={styles.buttonRound}
      />
    );
  }
  publishAudio() {
    const {setState} = this.props;
    const {publishAudio} = this.state;
    return (
      <ButtonColor
        view={() => {
          return (
            <Animated.View style={styleApp.center}>
              <AllIcons
                type={'font'}
                color={publishAudio ? colors.white : colors.grey}
                size={18}
                name={publishAudio ? 'microphone' : 'microphone-slash'}
              />
            </Animated.View>
          );
        }}
        color={'transparent'}
        onPressColor={'transparent'}
        click={async () => {
          await this.setState({publishAudio: !publishAudio});
          setState({publishAudio: !publishAudio});
        }}
        style={styles.buttonRound}
      />
    );
  }
  videoLibrary() {
    const {coachSessionID} = this.props;
    const clickButton = async () => {
      navigate('SelectVideosFromLibrary', {
        headerTitle: 'Watch Videos Live',
        modalMode: true,
        selectOnly: true,
        selectableMode: true,
        hideLocal: true,
        confirmVideo: async (selectedVideos) => {
          goBack();
          await watchVideosLive({
            selectedVideos,
            coachSessionID,
            forcePlay: true,
            overrideCurrent: true,
          });
        },
      });
    };
    return (
      <ButtonColor
        view={() => {
          return (
            <GuidedInteraction
              text={'Watch videos together in this call'}
              type={'overlay'}
              interaction={'liveVideos'}
              onPress={clickButton}
              offset={{x: 15}}
              delay={2000}
              style={{...styleApp.fullSize, ...styleApp.center}}>
              <Animated.View style={styleApp.center}>
                <AllIcons
                  type={'font'}
                  color={colors.white}
                  size={18}
                  name={'film'}
                />
              </Animated.View>
            </GuidedInteraction>
          );
        }}
        color={'transparent'}
        onPressColor={'transparent'}
        click={clickButton}
        style={styles.buttonRound}
      />
    );
  }
  indicatorAnimation = () => {
    const {recording} = this.state;
    if (recording) {
      //Start animation
      Animated.parallel([
        Animated.timing(this.recordingIndicator.color, native(1, 1000)),
      ]).start(() => {
        Animated.parallel([
          Animated.timing(this.recordingIndicator.color, native(0, 1000)),
        ]).start(() => {
          this.indicatorAnimation();
        });
      });
    } else {
      //Stop animating
      this.recordingIndicator.color.setValue(0);
    }
  };
  async onEndCurrentSession() {
    const {members, userID, recording} = this.props;
    const self = members[userID];
    if (recording) {
      await this.setState({shouldStopRecording: true, discardFile: true});
      this.stopRemoteRecording(self);
    }
  }
  buttonEndCall() {
    return (
      <ButtonColor
        view={() => {
          return (
            <Image
              source={require('../../../../../../../../img/icons/endCall.png')}
              style={{width: 25, height: 25}}
            />
          );
        }}
        color={'transparent'}
        onPressColor={'transparent'}
        click={() => closeSession({noNavigation: true})}
        style={styles.buttonRound}
      />
    );
  }
  rowButtons() {
    return (
      <Row style={styles.rowButtons}>
        <Col style={styleApp.center}>{this.publishVideo()}</Col>
        <Col style={styleApp.center}>{this.publishAudio()}</Col>
        <Col style={styleApp.center}>{this.videoLibrary()}</Col>
        <Col style={styleApp.center}>{this.buttonEndCall()}</Col>
      </Row>
    );
  }
  recordingSelector() {
    const {members, coachSessionID} = this.props;
    const {finalizeRecordingMember} = this.state;

    const selectMember = (member) => {
      if (member.recording && member.recording.isRecording) {
        return this.stopRemoteRecording(member);
      }
      return this.startRemoteRecording(member);
    };
    return (
      <RecordingMenu
        onRef={(ref) => (this.recordingMenuRef = ref)}
        members={members ? Object.values(members) : []}
        coachSessionID={coachSessionID}
        close={() => {}}
        selectMember={selectMember.bind(this)}
        finalizeRecordingMember={finalizeRecordingMember}
      />
    );
  }
  render() {
    return (
      <View style={styleApp.center}>
        <VideoBeingShared />
        {this.rowButtons()}
        {this.recordingSelector()}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  rowButtons: {
    height: 100 + offsetFooterStreaming,
    paddingTop: 10,
    width: 0.9 * width,
    paddingBottom: 20,
  },

  buttonRound: {
    ...styleApp.fullSize,
    height: 55,
    width: 55,
    borderRadius: 27.5,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: userIDSelector(state),
    infoUser: userInfoSelector(state),
    recording: recordingSessionSelector(state),
    archivedStreams: cloudVideosSelector(state),
    currentSessionConnected: userConnectedSelector(state),
    currentSessionReconnecting: reconnectingSelector(state),
    endCurrentSession: endCurrentSessionSelector(state),
  };
};

export default connect(
  mapStateToProps,
  {coachAction, layoutAction},
)(BottomButton);
