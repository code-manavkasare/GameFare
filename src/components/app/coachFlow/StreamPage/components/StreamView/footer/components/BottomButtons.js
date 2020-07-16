import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image, Alert} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import queue, {Worker} from 'react-native-job-queue';
import RecordingMenu from './RecordingMenu';

import { navigate } from '../../../../../../../../../NavigationService';
import ButtonColor from '../../../../../../../layout/Views/Button';
import AllIcons from '../../../../../../../layout/icons/AllIcons';

import {uploadQueueAction} from '../../../../../../../../actions/uploadQueueActions';

import {
  startRemoteRecording,
  stopRemoteRecording,
  updateTimestamp,
  generateFlagsThumbnail,
  toggleVideoPublish
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
import { coachAction } from '../../../../../../../../actions/coachActions';

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
  componentDidMount() {
    this.props.onRef(this);
    this.configureQueue();
  }
  componentDidUpdate(prevProps, prevState) {
    const { endCurrentSession } = this.props.coach;
    if (!prevProps.coach.endCurrentSession && endCurrentSession) {
      this.onEndCurrentSession();
    }
    const {finalizeRecordingMember, shouldStartRecording, shouldStopRecording, discardFile} = this.state;
    const {members} = this.props;

    if (shouldStartRecording && !prevState.shouldStartRecording) {
      queue.addJob('startRecording');
    } else if (shouldStopRecording && !prevState.shouldStopRecording) {
      queue.addJob('stopRecording', {discardFile: discardFile});
    }
  }
  static getDerivedStateFromProps(props, state) {
    const {members, userID, archivedStreams} = props;
    const {recordingSelf, seenVideos, finalizeRecordingMember} = state;
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
    // receive firebase start recording/stop recording function
    const firebaseSelf = members ? members[userID] : undefined;
    if (firebaseSelf && firebaseSelf.recording) {
      if (firebaseSelf.recording.isRecording && !coach.recording) {
        newState = {...newState, shouldStartRecording: true};
      } else if (!firebaseSelf.recording.isRecording && coach.recording) {
        newState = {...newState, shouldStopRecording: true};
      } else {
        newState = {...newState, shouldStopRecording: false, shouldStartRecording: false}
      }
    }
    // are any members of session recording?
    newState = {...newState, anyMemberRecording: false};
    for (var m in members) {
      if (members[m].recording && members[m].recording.isRecording)
        newState = {...newState, anyMemberRecording: true};
    }

    if (finalizeRecordingMember && !isEqual(
          members[finalizeRecordingMember.id],
          finalizeRecordingMember))
        newState = {
          ...newState,
          finalizeRecordingMember: members[finalizeRecordingMember.id]
        }

    return newState;
  }
  configureQueue() {
    queue.removeWorker('startRecording');
    queue.removeWorker('stopRecording');
    queue.addWorker(new Worker('startRecording', this.startRecording.bind(this)));
    queue.addWorker(new Worker('stopRecording', this.stopRecording.bind(this)));
  }
  startRemoteRecording = async (member) => {
    const {coachSessionID, userID} = this.props;
    const recordingUser = member.id;
    await startRemoteRecording(recordingUser, coachSessionID, userID);
  };
  stopRemoteRecording = async (member) => {
    const {coachSessionID, userID} = this.props;
    const {portrait} = member
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
          return this.startRecording(true);
        } else {
          return console.log(`Error initializing recording: ${response.message}`);
        }
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
      await otPublisherRef.current.startRecording(messageCallback);
      coachAction('setRecording', true);
    }
  };
  stopRecording = async (payload) => {
    const {
      members,
      userID,
      coachSessionID,
      uploadQueueAction
    } = this.props;
    const {discardFile} = payload;
    const messageCallback = async (response) => {
      if (response.error)
        return Alert.alert(`Error storing recording: ${response.message}`);
      let {videoUrl} = response;
      if (videoUrl) {
        const member = Object.values(members).filter(
          (member) => member.id === userID,
        )[0];
        const {id: memberID, recording} = member;
        if (!discardFile) {
          const {userIDrequesting} = recording;
          const thumbnails = await generateFlagsThumbnail({
            flags: recording.flags,
            source: videoUrl,
            coachSessionID,
            memberID: memberID,
          });

          if (userIDrequesting === userID) this.videoSourcePopupRef.openExportQueue(member, thumbnails) 
          uploadQueueAction('enqueueFilesUpload', thumbnails);
        }
      } else {
        const member = members[userID]
        const {recording} = member;
        const {userIDrequesting} = recording;
        if (userIDrequesting === userID) this.videoSourcePopupRef.openExportQueue(member) 
      }
    };
    const {otPublisherRef, coachAction} = this.props;
    await otPublisherRef.current.stopRecording(messageCallback);
    coachAction('setRecording', false);
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
                color={colors.white}
                size={18}
                name={publishVideo ? 'video' : 'video-slash'}
              />
            </Animated.View>
          );
        }}
        color={publishVideo ? colors.title + '70' : colors.red + '70'}
        click={async () => {
          await this.setState({publishVideo: !publishVideo});
          setState({publishVideo: !publishVideo});
          toggleVideoPublish(coachSessionID, userID, !publishVideo)
        }}
        style={styles.buttonRound}
        onPressColor={publishVideo ? colors.red + '70' : colors.title + '70'}
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
        color={publishAudio ? colors.title + '70' : colors.red + '70'}
        click={async () => {
          await this.setState({publishAudio: !publishAudio});
          setState({publishAudio: !publishAudio});
        }}
        style={styles.buttonRound}
        onPressColor={publishAudio ? colors.red + '70' : colors.title + '70'}
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
    const {anyMemberRecording} = this.state;


    this.indicatorAnimation();

    const insideViewButton = () => {
      return (
        <Animated.View
          style={[
            !anyMemberRecording
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
            return (this.videoSourcePopupRef.state.visible) ? 
              this.videoSourcePopupRef.close() :
              this.videoSourcePopupRef.open();
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
  async onEndCurrentSession() {
    const {members, userID, coach} = this.props;
    const self = members[userID];
    if (coach.recording) {
      this.setState({shouldStopRecording: true, discardFile: true});
      this.stopRemoteRecording(self);
    }
  }
  buttonEndCall() {
    const {coachAction} = this.props;
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
        click={() => coachAction('endCurrentSession')}
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
    const {finalizeRecordingMember} = this.state;

    const selectMember = (member) => {
      if (member.recording && member.recording.isRecording)
        return this.stopRemoteRecording(member);
      return this.startRemoteRecording(member);
    };
    return (
      <RecordingMenu
        onRef={(ref) => (this.videoSourcePopupRef = ref)}
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
    borderColor: colors.off,
    width: 55,
    borderRadius: 42.5,
  },
  buttonStartStreaming: {
    ...styleApp.center,
    backgroundColor: colors.red,
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
  {coachAction, uploadQueueAction},
)(BottomButton);
