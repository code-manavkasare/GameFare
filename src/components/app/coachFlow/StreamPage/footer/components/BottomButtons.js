import React, {Component} from 'react';
import {Button, View, Text, StyleSheet, Animated, Image} from 'react-native';
import {connect} from 'react-redux';
import {Stopwatch} from 'react-native-stopwatch-timer';
import {Col, Row} from 'react-native-easy-grid';
import Modal from 'react-native-modal';
import {propEq, filter} from 'ramda';

import ButtonColor from '../../../../../layout/Views/Button';
import AllIcons from '../../../../../layout/icons/AllIcons';
import Loader from '../../../../../layout/loaders/Loader';
import {startRecording, stopRecording} from '../../../../../functions/coach';

import {width, offsetFooterStreaming} from '../../../../../style/sizes';
import colors from '../../../../../style/colors';
import styleApp from '../../../../../style/style';

class StreamPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recording: false,
      showPastSessionsPicker: false,
      chooseRecordSourceMemberModalVisible: false,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.session.tokbox.archiving !== this.props.session.tokbox.archiving
    )
      return this.openRecording(nextProps.session.tokbox.archiving);
  }

  cameraSwitch() {
    const {setState, state} = this.props;
    return (
      <ButtonColor
        view={() => {
          return (
            <Animated.View style={styles.buttonText}>
              <AllIcons
                type={'moon'}
                color={colors.white}
                size={23}
                name={'switchCam'}
              />
            </Animated.View>
          );
        }}
        click={async () => setState({cameraFront: !state.cameraFront})}
        // color={colors.red}
        style={styleApp.fullSize}
        onPressColor={colors.redLight}
      />
    );
  }
  publishAudio() {
    const {setState, state} = this.props;
    return (
      <ButtonColor
        view={() => {
          return (
            <Animated.View style={styles.buttonText}>
              <AllIcons
                type={'font'}
                color={colors.white}
                size={23}
                name={state.publishAudio ? 'microphone' : 'microphone-slash'}
              />
            </Animated.View>
          );
        }}
        click={async () => setState({publishAudio: !state.publishAudio})}
        // color={colors.red}
        style={styleApp.fullSize}
        onPressColor={colors.redLight}
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
          style={
            !archiving
              ? styles.buttonStartStreaming
              : styles.buttonStopStreaming
          }
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
          // color={colors.red}
          style={styles.whiteButtonRecording}
          onPressColor={colors.redLight}
        />
      </View>
    );
  }
  contentVideo() {
    const {showPastSessionsPicker} = this.state;
    const {clickReview} = this.props;
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
            <Animated.View style={styles.buttonText}>
              {false && viewVideoBeingShared(sharedVideos)}
              <AllIcons
                type={'font'}
                color={colors.white}
                size={25}
                name={'film'}
              />
              {showPastSessionsPicker && (
                <View style={styleArrowDown}>
                  <AllIcons
                    type={'font'}
                    color={colors.white}
                    size={16}
                    name={'chevron-down'}
                  />
                </View>
              )}
            </Animated.View>
          );
        }}
        click={async () => {
          this.setState({
            showPastSessionsPicker: !this.state.showPastSessionsPicker,
          });
          clickReview(!showPastSessionsPicker);
        }}
        // color={colors.red}
        style={styleApp.fullSize}
        onPressColor={colors.redLight}
      />
    );
  }
  buttonEndCall() {
    const {userID, session, endCoachSession} = this.props;
    const {organizer} = session.info;

    return (
      <ButtonColor
        view={() => {
          return (
            <Image
              source={require('../../../../../../img/icons/endCall.png')}
              style={{width: 30, height: 30}}
            />
          );
        }}
        click={async () => endCoachSession()}
        style={styleApp.fullSize}
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
      this.toggleChooseRecordSourceMemberModal();
      return;
    }
    if (nextRecordingVal) {
      startRecording(
        sessionIDFirebase,
        membersConnectedArray[0].connectionIdTokbox,
      );
    } else stopRecording(sessionIDFirebase);
  }

  toggleChooseRecordSourceMemberModal = () => {
    this.setState({
      chooseRecordSourceMemberModalVisible: !this.state
        .chooseRecordSourceMemberModalVisible,
    });
  };

  chooseRecordSourceMemberModal() {
    const {members, objectID: idFirebase} = this.props.session;

    const membersArray = Object.values(members);
    const {chooseRecordSourceMemberModalVisible} = this.state;

    return (
      <View style={{flex: 1}}>
        <Modal
          isVisible={chooseRecordSourceMemberModalVisible}
          style={[styles.modal, styleApp.center]}>
          <View style={[styleApp.center]}>
            <Text style={styleApp.text}>Choose Source</Text>
            {membersArray.map((member) => {
              if (member.isConnected) {
                return (
                  <Button
                    color={colors.green}
                    title={`${member.info.firstname + member.info.lastname}`}
                    onPress={() =>
                      startRecording(idFirebase, member.connectionIdTokbox)
                    }
                  />
                );
              }
            })}
            <Button
              title="Hide modal"
              onPress={() => this.toggleChooseRecordSourceMemberModal()}
            />
          </View>
        </Modal>
      </View>
    );
  }

  rowButtons() {
    return (
      <Row style={styles.rowButtons}>
        <Col style={styleApp.center}>{this.cameraSwitch()}</Col>
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
        {this.chooseRecordSourceMemberModal()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  rowButtons: {
    height: 100 + offsetFooterStreaming,
    paddingTop: 10,
    width: width,
    backgroundColor: colors.transparentGrey,
    paddingBottom: 20,
  },
  buttonText: {...styleApp.center},
  whiteButtonRecording: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    borderWidth: 4,
    borderColor: colors.white,
    width: 70,
    borderRadius: 42.5,
  },
  buttonStartStreaming: {
    ...styleApp.center,
    height: 55,
    width: 55,
    borderRadius: 40,
    backgroundColor: colors.red,
  },
  buttonStopStreaming: {
    ...styleApp.center,
    height: 35,
    width: 35,
    borderRadius: 5,
    backgroundColor: colors.red,
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
  modal: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 20,
    bottom: '50%',
    width: '90%',
    height: 300,
  },
  modalPlayerButton: {
    width: '80%',
    height: 80,
    backgroundColor: colors.green,
    borderRadius: 20,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    coach: state.coach,
  };
};

export default connect(mapStateToProps, {})(StreamPage);
