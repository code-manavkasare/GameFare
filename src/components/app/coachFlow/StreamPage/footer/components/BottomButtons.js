import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image} from 'react-native';
import {connect} from 'react-redux';
import {Stopwatch, Timer} from 'react-native-stopwatch-timer';
import {Col, Row} from 'react-native-easy-grid';
import firebase from 'react-native-firebase';

import NavigationService from '../../../../../../../NavigationService';

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
              {viewVideoBeingShared(sharedVideos)}
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
  buttonAddMember() {
    const {userID, session} = this.props;
    const {organizer} = session.info;
    const {objectID} = session;

    const isAdmin = organizer === userID;
    if (!isAdmin) return null;
    const AddMembers = () => {
      NavigationService.navigate('PickMembers', {
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
          return NavigationService.navigate('StreamPageCoaching');
        },
      });
    };
    return (
      <ButtonColor
        view={() => {
          return (
            <Animated.View style={styles.buttonText}>
              <AllIcons
                type={'font'}
                color={colors.white}
                size={23}
                name={'user-plus'}
              />
            </Animated.View>
          );
        }}
        click={async () => AddMembers()}
        style={styleApp.fullSize}
        onPressColor={colors.redLight}
      />
    );
  }
  async openRecording(nextRecordingVal) {
    const {objectID: sessionIDFirebase} = this.props.session;
    if (nextRecordingVal) startRecording(sessionIDFirebase);
    else stopRecording(sessionIDFirebase);
  }

  rowButtons() {
    return (
      <Row style={styles.rowButtons}>
        <Col style={styleApp.center}>{this.cameraSwitch()}</Col>
        <Col style={styleApp.center}>{this.publishAudio()}</Col>

        <Col style={styleApp.center}>{this.buttonRecord()}</Col>

        <Col style={styleApp.center}>{this.contentVideo()}</Col>
        <Col style={styleApp.center}>{this.buttonAddMember()}</Col>
      </Row>
    );
  }
  render() {
    return this.rowButtons();
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
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    coach: state.coach,
  };
};

export default connect(mapStateToProps, {})(StreamPage);
