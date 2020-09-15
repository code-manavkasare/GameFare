import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image, Alert} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import queue, {Worker} from 'react-native-job-queue';
import RecordingMenu from './RecordingMenu';

import {navigate} from '../../../../../../../../../NavigationService';
import ButtonColor from '../../../../../../../layout/Views/Button';
import AllIcons from '../../../../../../../layout/icons/AllIcons';

import {uploadQueueAction} from '../../../../../../../../actions/uploadQueueActions';
import {layoutAction} from '../../../../../../../../actions/layoutActions';
import sizes from '../../../../../../../style/sizes';

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
import {coachAction} from '../../../../../../../../actions/coachActions';

class BottomButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      endCurrentSession: false,
      showPastSessionsPicker: false,
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
  static getDerivedStateFromProps(props, state) {
    var newState = {};
    const {members, userID, archivedStreams, coach} = props;
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
      if (isRecording && !coach.recording) {
        newState = {...newState, shouldStartRecording: true};
      } else if (!isRecording && coach.recording) {
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

  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
    this.configureQueue();
  }
  componentDidUpdate(prevProps, prevState) {
    const {layoutAction} = this.props;
    const {endCurrentSession, currentSessionReconnecting} = this.props.coach;
    const {anyMemberRecording} = this.state;
    if (!prevProps.coach.endCurrentSession && endCurrentSession) {
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
    const {coachSessionID, userID} = this.props;
    const messageCallback = async (response) => {
      if (response.error) {
        if (response.message === 'INIT_ERR' && !prevStartError) {
          this.startRecording(true);
        } else {
          console.log(`Error initializing recording: ${response.message}`);
        }
        return false;
      }
      updateTimestamp(coachSessionID, userID, Date.now());
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
      if (succeeded) {
        coachAction('setRecording', true);
      } else {
        coachAction('setRecording', true);
        coachAction('setRecording', false);
      }
    }
  };
  stopRecording = async ({discardFile}) => {
    const {
      members,
      userID,
      coachSessionID,
      uploadQueueAction,
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
    const {members, userID, coach} = this.props;
    const self = members[userID];
    if (coach.recording) {
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
    width: 0.7 * sizes.width,
    paddingBottom: 20,
  },
  CardUploading: {
    position: 'absolute',
    height: 70,
    width: 200,
    backgroundColor: colors.white,
    borderRadius: 35,
    borderColor: colors.off,
    borderWidth: 1,
    paddingLeft: 10,
    paddingRight: 10,
    top: -60,
  },
  whiteButtonRecording: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    borderWidth: 5,
    borderColor: colors.off,
    width: 55,
    borderRadius: 42.5,
  },
  buttonReconnecting: {
    ...styleApp.center,
    backgroundColor: colors.darkGray,
    opacity: 0.5,
    overflow: 'hidden',
    height: 40,
    width: 40,
    borderRadius: 40,
  },
  buttonStartStreaming: {
    ...styleApp.center,
    backgroundColor: colors.transparent,
    opacity: 0.8,
    overflow: 'hidden',
    height: 40,
    width: 40,
    borderRadius: 40,
  },
  buttonStopStreaming: {
    ...styleApp.center,
    backgroundColor: colors.greyDark,
    opacity: 0.8,
    overflow: 'hidden',
    height: 25,
    width: 25,
    borderRadius: 5,
  },
  recordingOverlay: {
    backgroundColor: colors.redLight,
    height: '100%',
    width: '100%',
  },
  unreadIndicator: {
    ...styleApp.textBold,
    height: 13,
    width: 13,
    position: 'absolute',
    backgroundColor: colors.white,
    top: -4,
    left: 16,
    borderRadius: 10,
  },
  unreadIndText: {
    ...styleApp.textBold,
    fontSize: 10,
    marginTop: 0.5,
    textAlign: 'center',
  },
  viewRecordingTime: {
    position: 'absolute',
    top: -20,
    zIndex: 20,
    width: 90,
    height: 25,
    borderRadius: 5,
    ...styleApp.center,
    backgroundColor: colors.red,
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
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    coach: state.coach,
    archivedStreams: state.user.infoUser.archivedStreams,
    currentSessionConnected: state.coach.connected,
    currentSessionReconnecting: state.coach.reconnecting,
  };
};

export default connect(
  mapStateToProps,
  {coachAction, uploadQueueAction, layoutAction},
)(BottomButton);