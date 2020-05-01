import React, {Component} from 'react';
import {Button, View, Text, StyleSheet, Animated, Image} from 'react-native';
import {connect} from 'react-redux';
import {Stopwatch} from 'react-native-stopwatch-timer';
import {Col, Row} from 'react-native-easy-grid';
import {propEq, filter} from 'ramda';

import ButtonColor from '../../../../../../../layout/Views/Button';
import AllIcons from '../../../../../../../layout/icons/AllIcons';
import Loader from '../../../../../../../layout/loaders/Loader';
import {
  startRecording,
  stopRecording,
} from '../../../../../../../functions/coach';
import VideoSourcePopup from './VideoSourcePopup';

import {offsetFooterStreaming} from '../../../../../../../style/sizes';
import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';

class BottomButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recording: false,
      showPastSessionsPicker: false,
      videoSourcePopupVisible: false,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.session.tokbox.archiving !== this.props.session.tokbox.archiving
    )
      return this.openRecording(nextProps.session.tokbox.archiving);
  }

  publishVideo() {
    const {setState, state} = this.props;
    const {publishVideo} = state;
    return (
      <ButtonColor
        view={() => {
          return (
            <Animated.View style={styleApp.center}>
              <AllIcons
                type={'font'}
                color={colors.white}
                size={21}
                name={publishVideo ? 'video' : 'video-slash'}
              />
            </Animated.View>
          );
        }}
        color={publishVideo ? colors.green : colors.redLight}
        click={async () => setState({publishVideo: !publishVideo})}
        style={styles.buttonRound}
        onPressColor={publishVideo ? colors.redLight : colors.greenLight}
      />
    );
  }
  publishAudio() {
    const {setState, state} = this.props;
    const {publishAudio} = state;
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
        click={async () => setState({publishAudio: !publishAudio})}
        style={styles.buttonRound}
        onPressColor={publishAudio ? colors.redLight : colors.greenLight}
      />
    );
  }

  buttonRecord() {
    const {archiving, recordingArchiveInfo} = this.props.session.tokbox;

    const loading = archiving && !recordingArchiveInfo;

    const insideViewButton = (loading) => {
      if (loading) return <Loader size={27} color="white" />;
      return (
        <Animated.View
          style={[
            !archiving
              ? styles.buttonStartStreaming
              : styles.buttonStopStreaming,
            {backgroundColor: colors.greyDark + '70'},
          ]}
        />
      );
    };
    const timer = (recordingArchiveInfo) => {
      const timerRecording =
        Number(new Date()) - recordingArchiveInfo.startTimestamp;
      return (
        <Stopwatch
          laps
          start={true}
          startTime={timerRecording < 0 ? 0 : timerRecording}
          options={optionsTimer}
          getTime={this.getFormattedTime}
        />
      );
    };

    const optionsTimer = {
      container: styles.viewRecordingTime,
      text: [styleApp.text, {color: colors.white, fontSize: 15}],
    };

    return (
      <View style={[styleApp.center, styleApp.fullSize]}>
        {archiving && !loading && timer(recordingArchiveInfo)}
        <ButtonColor
          view={() => insideViewButton(loading)}
          click={async () => this.openRecording(!archiving)}
          style={styles.whiteButtonRecording}
          onPressColor={colors.redLight}
        />
      </View>
    );
  }
  contentVideo() {
    const {showPastSessionsPicker} = this.state;
    const {clickReview, setState, state} = this.props;
    const {sharedVideos} = this.props.session;

    const viewVideoBeingShared = (sharedVideos) => {
      if (!sharedVideos) return null;
      return <View style={styles.viewVideoBeingShared} />;
    };
    const styleArrowDown = {
      position: 'absolute',
      height: 30,
      width: 30,
      ...styleApp.center,
      top: 23,
    };
    return (
      <ButtonColor
        view={() => {
          return (
            <Animated.View style={styleApp.center}>
              {false && viewVideoBeingShared(sharedVideos)}
              <AllIcons
                type={'font'}
                color={colors.white}
                size={showPastSessionsPicker ? 19 : 22}
                name={'film'}
              />
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
        color={colors.greyDark + '70'}
        click={async () => {
          this.setState({
            showPastSessionsPicker: !this.state.showPastSessionsPicker,
          });
          clickReview(!showPastSessionsPicker);
          // setState({publishVideo: !state.publishVideo});
        }}
        style={styles.buttonRound}
        onPressColor={colors.grey + '40'}
      />
    );
  }
  buttonEndCall() {
    const {session, endCoachSession} = this.props;
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
        color={colors.greyDark + '70'}
        click={async () => endCoachSession(true)}
        style={styles.buttonRound}
        onPressColor={colors.redLight}
      />
    );
  }

  async openRecording(nextRecordingVal) {
    const {objectID: sessionIDFirebase, members} = this.props.session;
    const membersArray = Object.values(members);
    const isConnected = propEq('isConnected', true);
    const membersConnectedArray = filter(isConnected, membersArray);

    if (nextRecordingVal && membersConnectedArray.length > 1) {
      this.toggleVideoSourcePopup();
      return;
    }
    if (nextRecordingVal) {
      startRecording(
        sessionIDFirebase,
        membersConnectedArray[0].streamIdTokBox,
      );
    } else stopRecording(sessionIDFirebase);
  }

  toggleVideoSourcePopup = () => {
    this.setState({
      videoSourcePopupVisible: !this.state.videoSourcePopupVisible,
    });
  };

  videoSourcePopup = () => {
    const {objectID: idFirebase, members} = this.props.session;

    //TODO: define global usage with team and export to styles.js
    const zoomIn = {
      0: {
        opacity: 0,
        scale: 0,
      },
      0.5: {
        opacity: 0.5,
        scale: 0.3,
      },
      1: {
        opacity: 1,
        scale: 1,
      },
    };

    const zoomOut = {
      0: {
        opacity: 1,
        scale: 1,
      },
      0.5: {
        opacity: 0.5,
        scale: 0.3,
      },
      1: {
        opacity: 0,
        scale: 0,
      },
    };

    const membersArray = Object.values(members);
    const {videoSourcePopupVisible} = this.state;

    if (!videoSourcePopupVisible) return false;

    return (
      <View
        animation={videoSourcePopupVisible ? zoomIn : zoomOut}
        duration={600}>
        <VideoSourcePopup
          members={membersArray}
          selectMember={(member) => {
            startRecording(idFirebase, member.streamIdTokBox);
          }}
          close={() => this.toggleVideoSourcePopup()}
        />
      </View>
    );
  };

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
  render() {
    return (
      <View>
        {this.rowButtons()}
        {this.videoSourcePopup()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  rowButtons: {
    height: 100 + offsetFooterStreaming,
    paddingTop: 10,
    width: '100%',
    // backgroundColor: colors.transparentGrey,
    paddingBottom: 20,
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
    height: 40,
    width: 40,
    borderRadius: 40,
  },
  buttonStopStreaming: {
    ...styleApp.center,
    height: 25,
    width: 25,
    borderRadius: 5,
  },
  viewVideoBeingShared: {
    ...styleApp.center,
    position: 'absolute',
    top: -6,
    zIndex: 20,
    right: -6,
    borderWidth: 1,
    borderColor: colors.white,
    backgroundColor: colors.red,
    height: 15,
    width: 15,
    borderRadius: 10,
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
  };
};

export default connect(
  mapStateToProps,
  {},
)(BottomButton);
