import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image, Alert} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import queue, {Worker} from 'react-native-job-queue';
import VideoSourcePopup from './VideoSourcePopup';
import database from '@react-native-firebase/database';

import {
  navigate,
  setParams,
} from '../../../../../../../../../NavigationService';
import ButtonColor from '../../../../../../../layout/Views/Button';
import AllIcons from '../../../../../../../layout/icons/AllIcons';

import {uploadQueueAction} from '../../../../../../../../actions/uploadQueueActions';

import {
  startRemoteRecording,
  stopRemoteRecording,
  updateTimestamp,
  generateFlagsThumbnail,
} from '../../../../../../../functions/coach';

import {offsetFooterStreaming} from '../../../../../../../style/sizes';
import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';

import {native} from '../../../../../../../animations/animations';

import {
  permission,
  goToSettings,
} from '../../../../../../../functions/pictures';
import isEqual from 'lodash.isequal';

class BottomButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPastSessionsPicker: false,
      recording: false,
      recordingSelf: false,
      recordingUser: undefined,
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
    this.props.onRef(this);
    this.configureQueue();
  }
  componentDidUpdate(prevProps, prevState) {
    const {recordingSelf, finalizeRecordingMember} = this.state;
    const {members} = this.props;

    if (recordingSelf !== prevState.recordingSelf) {
      console.log('Recieved recording instruction!');
      if (recordingSelf) {
        console.log('Queueing start recording!');
        queue.addJob('startRecording');
      } else {
        console.log('Queueing stop recording!');
        queue.addJob('stopRecording');
      }
    }
    if (finalizeRecordingMember) {
      if (
        !isEqual(
          members[finalizeRecordingMember],
          prevProps.members[finalizeRecordingMember],
        )
      )
        return setParams({params: {member: members[finalizeRecordingMember]}});
    }
  }
  static getDerivedStateFromProps(props, state) {
    const {members, userID, archivedStreams} = props;
    const {recordingSelf, seenVideos} = state;
    const member = members ? members[userID] : undefined;

    var newState = {};

    const archivedVideosLength = archivedStreams
      ? Object.values(archivedStreams).length
      : 0;
    if (archivedVideosLength > seenVideos && seenVideos > 0) {
      newState = {...newState, unreadVideos: archivedVideosLength - seenVideos};
    } else {
      newState = {...newState, seenVideos: archivedVideosLength};
    }

    if (
      member &&
      member.recording !== undefined &&
      member.recording.isRecording !== recordingSelf
    ) {
      if (!recordingSelf && member.recording.isRecording) {
        newState = {...newState, recording: true, recordingSelf: true};
      } else if (recordingSelf && !member.recording.isRecording) {
        newState = {...newState, recordingSelf: false};
      }
    }
    var recordingMember = newState.recordingSelf ? member : undefined;
    for (var m in members) {
      if (members[m].recording && members[m].recording.isRecording)
        recordingMember = members[m];
    }
    if (recordingMember === undefined && !newState.recordingSelf) {
      console.log('No one is recording');
      newState = {
        ...newState,
        recording: false,
      };
    } else {
      console.log('Someone is recording');
      newState = {
        ...newState,
        recording: true,
      };
    }
    return newState;
  }
  configureQueue() {
    queue.removeWorker('startRecording');
    queue.removeWorker('stopRecording');
    queue.addWorker(
      new Worker('startRecording', this.startRecording.bind(this)),
    );
    queue.addWorker(new Worker('stopRecording', this.stopRecording.bind(this)));
  }
  startRemoteRecording = async (member) => {
    const {coachSessionID, userID} = this.props;
    const recordingUser = member.id;
    console.log(userID, 'start recording');
    await startRemoteRecording(recordingUser, coachSessionID, userID);
  };
  stopRemoteRecording = async (member) => {
    const {coachSessionID, userID} = this.props;
    const recordingUser = member.id;
    stopRemoteRecording(recordingUser, coachSessionID, userID);
    navigate('FinalizeRecording', {
      member: member,
      coachSessionID: coachSessionID,
      onGoBack: () => {
        return this.setState({finalizeRecordingMember: false});
      },
    });
    this.setState({finalizeRecordingMember: member.id});
  };
  startRecording = async () => {
    const {coachSessionID, userID} = this.props;
    const messageCallback = async (response) => {
      if (response.error)
        return console.log(`Error initializing recording: ${response.message}`);
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
      const {otPublisherRef} = this.props;
      await otPublisherRef.current.startRecording(messageCallback);
    }
  };
  stopRecording = async () => {
    const {
      members,
      userID,
      coachSessionID,
      uploadQueueAction,
      recordPublisher,
    } = this.props;
    const messageCallback = async (response) => {
      await recordPublisher(false);
      if (response.error)
        return Alert.alert(`Error storing recording: ${response.message}`);
      let {videoUrl} = response;

      if (videoUrl) {
        const member = Object.values(members).filter(
          (member) => member.id === userID,
        )[0];
        const {id: memberID, recording} = member;
        console.log('recording', recording);
        const thumbnails = await generateFlagsThumbnail({
          flags: recording.flags,
          source: videoUrl,
          coachSessionID,
          memberID: memberID,
        });
        console.log('thumbnails', thumbnails);
        // TODO-UPLOAD push thumbnails to upload
        // call new uploadReducer add thumbnails array
        uploadQueueAction('enqueueFilesUpload', thumbnails);
      }
    };

    const {otPublisherRef} = this.props;
    await otPublisherRef.current.stopRecording(messageCallback);
  };
  publishVideo() {
    const {setState} = this.props;
    const {publishVideo} = this.state;
    return (
      <ButtonColor
        view={() => {
          return (
            <Animated.View style={styleApp.center}>
              <AllIcons
                type={'font'}
                color={colors.white}
                size={18}
                name={publishVideo ? 'video' : 'video-slash'}
              />
            </Animated.View>
          );
        }}
        color={publishVideo ? colors.green : colors.redLight}
        click={async () => {
          await this.setState({publishVideo: !publishVideo});
          setState({publishVideo: !publishVideo});
        }}
        style={styles.buttonRound}
        onPressColor={publishVideo ? colors.redLight : colors.greenLight}
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
                color={colors.white}
                size={18}
                name={publishAudio ? 'microphone' : 'microphone-slash'}
              />
            </Animated.View>
          );
        }}
        color={publishAudio ? colors.green : colors.redLight}
        click={async () => {
          await this.setState({publishAudio: !publishAudio});
          setState({publishAudio: !publishAudio});
        }}
        style={styles.buttonRound}
        onPressColor={publishAudio ? colors.redLight : colors.greenLight}
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

  buttonRecord() {
    const {recording} = this.state;

    this.indicatorAnimation();

    const insideViewButton = () => {
      return (
        <Animated.View
          style={[
            !recording
              ? styles.buttonStartStreaming
              : styles.buttonStopStreaming,
          ]}>
          <Animated.View
            style={[
              styles.recordingOverlay,
              {opacity: this.recordingIndicator.color},
            ]}
          />
        </Animated.View>
      );
    };
    return (
      <View style={[styleApp.center, styleApp.fullSize]}>
        <ButtonColor
          view={() => insideViewButton()}
          click={async () => {
            return this.videoSourcePopupRef.open();
          }}
          style={styles.whiteButtonRecording}
          onPressColor={colors.redLight}
        />
      </View>
    );
  }
  contentVideo() {
    const {showPastSessionsPicker} = this.state;
    const {clickReview, archivedStreams} = this.props;

    return (
      <ButtonColor
        view={() => {
          return (
            <Animated.View style={styleApp.center}>
              <AllIcons
                type={'font'}
                color={colors.white}
                size={showPastSessionsPicker ? 19 : 22}
                name={'film'}
              />
              {this.state.unreadVideos === 0 ? null : (
                <View style={styles.unreadIndicator}>
                  {this.state.unreadVideos > 10 ? null : (
                    <Text style={styles.unreadIndText}>
                      {this.state.unreadVideos}
                    </Text>
                  )}
                </View>
              )}
              {showPastSessionsPicker && (
                <AllIcons
                  type={'font'}
                  color={colors.white}
                  size={12}
                  name={'chevron-down'}
                />
              )}
            </Animated.View>
          );
        }}
        color={colors.title + '70'}
        click={async () => {
          this.setState({
            showPastSessionsPicker: !this.state.showPastSessionsPicker,
            unreadVideos: 0,
            seenVideos: archivedStreams
              ? Object.values(archivedStreams).length
              : 0,
          });
          clickReview(!showPastSessionsPicker);
        }}
        style={styles.buttonRound}
        onPressColor={colors.grey + '40'}
      />
    );
  }
  buttonEndCall() {
    const {endCoachSession} = this.props;
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
        color={colors.title + '70'}
        click={async () => endCoachSession(true)}
        style={styles.buttonRound}
        onPressColor={colors.redLight}
      />
    );
  }

  rowButtons() {
    return (
      <Row style={styles.rowButtons}>
        <Col style={styleApp.center}>{this.publishVideo()}</Col>
        <Col style={styleApp.center}>{this.publishAudio()}</Col>

        <Col style={styleApp.center}>{this.buttonRecord()}</Col>

        <Col style={styleApp.center}>{this.contentVideo()}</Col>
        <Col style={styleApp.center}>{this.buttonEndCall()}</Col>
      </Row>
    );
  }

  recordingSelector() {
    const {members, coachSessionID} = this.props;

    const selectMember = (member) => {
      if (member.recording && member.recording.isRecording) {
        this.stopRemoteRecording(member);
      } else {
        this.startRemoteRecording(member);
      }
    };
    return (
      <VideoSourcePopup
        onRef={(ref) => (this.videoSourcePopupRef = ref)}
        members={members ? Object.values(members) : []}
        coachSessionID={coachSessionID}
        close={() => {}}
        selectMember={selectMember.bind(this)}
      />
    );
  }

  render() {
    return (
      <View>
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
    width: '100%',
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
    borderWidth: 3,
    borderColor: colors.white,
    width: 55,
    borderRadius: 42.5,
  },
  buttonStartStreaming: {
    ...styleApp.center,
    backgroundColor: colors.greyDark,
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
  };
};

export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(BottomButton);
