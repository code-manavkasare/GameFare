import React, {Component} from 'react';
import {Button, View, Text, StyleSheet, Animated, Image} from 'react-native';
import {connect} from 'react-redux';
import {Stopwatch} from 'react-native-stopwatch-timer';
import {Col, Row} from 'react-native-easy-grid';
import isEqual from 'lodash.isequal';

import VideoSourcePopup from './VideoSourcePopup'

import {navigate} from '../../../../../../../../../NavigationService';
import ButtonColor from '../../../../../../../layout/Views/Button';
import AllIcons from '../../../../../../../layout/icons/AllIcons';

import {startRemoteRecording, stopRemoteRecording, updateTimestamp} from '../../../../../../../functions/coach'

import {offsetFooterStreaming} from '../../../../../../../style/sizes';
import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';

import {timing, native} from '../../../../../../../animations/animations'

import {
  getVideoInfo,
  getLastVideo,
  permission,
  goToSettings,
} from '../../../../../../../functions/pictures';
import CardUploading from '../../../../../../videoLibraryPage/components/CardUploading';

class BottomButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPastSessionsPicker: false,
      recording: false,
      recordingSelf: false,
      recordingUser: undefined,
      startTimeRecording: 0,
      publishVideo: !__DEV__,
      publishAudio: !__DEV__,
      unreadVideos: 0,
      seenVideos: 0
    };
    this.recordingIndicator = {
      color: new Animated.Value(0)
    }
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  componentDidUpdate(prevProps, prevState) {
    const {members, userID} = this.props
    const {recordingSelf, startTimeRecording, recordingUser} = prevState
    const member = (members) ? members[userID] : undefined
    if (member && member.recording !== undefined && member.recording.isRecording !== recordingSelf) {
      if (!recordingSelf && member.recording.isRecording && member.recording.timestamp > startTimeRecording) {
        console.log('Start remote recording!')
        this.startRecording()
      } else if (recordingSelf && !member.recording.isRecording) {
        console.log('Stop remote recording!')
        this.stopRecording()
      }
    }
    if (recordingUser === undefined && !recordingSelf) {
      this.stopRecording()
    }
  }
  static getDerivedStateFromProps(props, state) {
    const {members, userID, archivedStreams} = props
    const {recordingSelf, startTimeRecording, seenVideos} = state
    const member = (members) ? members[userID] : undefined

    var newState = {}

    const archivedVideosLength = Object.values(archivedStreams).length
    if (archivedVideosLength > seenVideos && seenVideos > 0) {
      newState = {
        ...newState,
        unreadVideos: archivedVideosLength - seenVideos,
      }
    } else {
      newState = {
        ...newState,
        seenVideos: archivedVideosLength,
      }
    }

    if (member && member.recording !== undefined && member.recording.isRecording !== recordingSelf) {
      if (!recordingSelf && member.recording.isRecording && member.recording.timestamp > startTimeRecording) {
        newState = {
          ...newState,
          recording: true,
          recordingSelf: true
        }
      } else if (recordingSelf && !member.recording.isRecording) {
        newState = {
          ...newState,
          recording: false,
          recordingSelf: false
        }
      }
    }
    var recordingMember = undefined
    for (var m in members) {
      if (members[m].recording && members[m].recording.isRecording) recordingMember = members[m]
    }
    if (recordingMember === undefined && !newState.recordingSelf) {
      console.log('No one is recording')
      newState = {
        ...newState,
        recording: false
      }
    } else {
      console.log('Someone is recording')
      newState = {
        ...newState,
        recording: true
      }
    }
    return newState;
  }
  getVideoUploadStatus() {
    return this.cardUploadingRef.getVideoUploadStatus();
  }
  startRemoteRecording = async (member) => {
    const {coachSessionID, userID} = this.props
    const recordingUser = member.id
    console.log('start recording')
    await startRemoteRecording(recordingUser, coachSessionID, userID)
  }
  stopRemoteRecording = async (member) => {
    const {coachSessionID, userID} = this.props
    const recordingUser = member.id
    console.log('stop recording')
    stopRemoteRecording(recordingUser, coachSessionID, userID)
  }
  startRecording = async () => {
    const {coachSessionID, userID} = this.props
    const messageCallback = async (response) => {
      if (response.error) {
        console.log(`Error initializing recording: ${response.message}`);
      } else {
        console.log('Started recording...');
        updateTimestamp(coachSessionID, userID, this.state.startTimeRecording)
      }
    };
    const permissionLibrary = await permission('library');
    if (!permissionLibrary)
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

    const {otPublisherRef} = this.props;
    await otPublisherRef.current.startRecording(messageCallback);
  };
  stopRecording = async () => {
    const {otPublisherRef} = this.props;
    const messageCallback = async (response) => {
      if (response.error) {
        console.log(`Error storing recording: ${response.message}`);
      } else {
        let videoUrl = response.videoUrl;
        console.log(`Stopped recording. Video stored at: ${response}`);
        let videoUUID = (videoUrl ? videoUrl
          .split('/')
          [videoUrl.split('/').length - 1].split('.')[0] : undefined);
        console.log('videoUUID', videoUUID);
        if (videoUrl) {
          let videoInfo = await getVideoInfo(videoUrl);
          videoInfo.localIdentifier = videoUUID;
          await this.cardUploadingRef.open(true, videoInfo);
          // console.log(videoInfo)
          await this.cardUploadingRef.uploadFile()
        }
      }
    };

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
          this.indicatorAnimation()
        });
      });
    } else {
      //Stop animating
      this.recordingIndicator.color.setValue(0)
    }
  }

  buttonRecord() {
    const {recording, startTimeRecording} = this.state;
    const optionsTimer = {
      container: styles.viewRecordingTime,
      text: [styleApp.text, {color: colors.white, fontSize: 15}],
    };
    // const timer = (startTimeRecording) => {
    //   const timerRecording = Number(new Date()) - startTimeRecording;
    //   return (
    //     <Stopwatch
    //       laps
    //       start={true}
    //       startTime={timerRecording < 0 ? 0 : timerRecording}
    //       options={optionsTimer}
    //       getTime={this.getFormattedTime}
    //     />
    //   );
    // };

    this.indicatorAnimation()

    const insideViewButton = () => {
      return (
        <Animated.View
          style={[
            !recording
              ? styles.buttonStartStreaming
              : styles.buttonStopStreaming
          ]}
        >
        <Animated.View style={[styles.recordingOverlay, {opacity: this.recordingIndicator.color}]} />
        </Animated.View>
      );
    };
    return (
      <View style={[styleApp.center, styleApp.fullSize]}>
        <CardUploading
          onRef={(ref) => (this.cardUploadingRef = ref)}
          style={styles.CardUploading}
          size="sm"
          members={this.props.members}
        />
        {/* {recording && timer(startTimeRecording)} */}
        <ButtonColor
          view={() => insideViewButton()}
          click={async () => {return this.videoSourcePopupRef.open()}}
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
              {(this.state.unreadVideos === 0) ? null :
              <View style={styles.unreadIndicator}>
                {(this.state.unreadVideos > 10) ? null :
                <Text style={styles.unreadIndText}>
                  {this.state.unreadVideos}
                </Text>}
              </View>}
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
            seenVideos: Object.values(archivedStreams).length
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
    const {members} = this.props

    const selectMember = (member) => {
      if (member.recording && member.recording.isRecording) {
        this.stopRemoteRecording(member)
      } else {
        this.startRemoteRecording(member)
      }
    }
    return (
      <VideoSourcePopup 
        onRef={(ref) => (this.videoSourcePopupRef = ref)}
        members={members} 
        close={() => {}}
        selectMember={selectMember.bind(this)}
        />
    )
  }

  render() {
    return  <View>
              {this.rowButtons()}
              {this.recordingSelector()}
            </View>;
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
    overflow:'hidden',
    height: 40,
    width: 40,
    borderRadius: 40
  },
  buttonStopStreaming: {
    ...styleApp.center,
    backgroundColor: colors.greyDark, 
    opacity: 0.8, 
    overflow:'hidden',
    height: 25,
    width: 25,
    borderRadius: 5
  },
  recordingOverlay: {
    backgroundColor: colors.redLight, 
    height:'100%', 
    width: '100%'
  },
  unreadIndicator: {
    ...styleApp.textBold,
    height:13, 
    width:13, 
    position: 'absolute',
    backgroundColor: colors.white, 
    top: -4, 
    left:16, 
    borderRadius:10, 
  },
  unreadIndText: {
    ...styleApp.textBold,
    fontSize:10, 
    marginTop:0.5, 
    textAlign:'center'
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
  {},
)(BottomButton);
