import React, {Component} from 'react';
import {Button, View, Text, StyleSheet, Animated, Image} from 'react-native';
import {connect} from 'react-redux';
import {Stopwatch} from 'react-native-stopwatch-timer';
import {Col, Row} from 'react-native-easy-grid';

import ButtonColor from '../../../../../../../layout/Views/Button';
import AllIcons from '../../../../../../../layout/icons/AllIcons';

import {offsetFooterStreaming} from '../../../../../../../style/sizes';
import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';

class BottomButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPastSessionsPicker: false,
      recording: false,
      startTimeRecording: 0,
      publishVideo: false,
      publishAudio: false,
    };
  }
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

  buttonRecord() {
    const {recording, startTimeRecording} = this.state;

    const insideViewButton = () => {
      return (
        <Animated.View
          style={[
            !recording
              ? styles.buttonStartStreaming
              : styles.buttonStopStreaming,
            {backgroundColor: colors.greyDark + '70'},
          ]}
        />
      );
    };
    const timer = (startTimeRecording) => {
      const timerRecording = Number(new Date()) - startTimeRecording;
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
        {recording && timer(startTimeRecording)}
        <ButtonColor
          view={() => insideViewButton()}
          click={async () => this.openRecording()}
          style={styles.whiteButtonRecording}
          onPressColor={colors.redLight}
        />
      </View>
    );
  }
  contentVideo() {
    const {showPastSessionsPicker} = this.state;
    const {clickReview} = this.props;

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
        color={colors.greyDark + '70'}
        click={async () => endCoachSession(true)}
        style={styles.buttonRound}
        onPressColor={colors.redLight}
      />
    );
  }

  async openRecording() {
    const {recording} = this.state;
    if (!recording) await this.props.startRecording();
    else await this.props.stopRecording();
    return this.setState({
      recording: !recording,
      startTimeRecording: Date.now(),
    });
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
  render() {
    return <View>{this.rowButtons()}</View>;
  }
}

const styles = StyleSheet.create({
  rowButtons: {
    height: 100 + offsetFooterStreaming,
    paddingTop: 10,
    width: '100%',
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
