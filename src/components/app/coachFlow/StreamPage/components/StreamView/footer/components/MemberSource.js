import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Easing} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';
import {Stopwatch} from 'react-native-stopwatch-timer';
import isEqual from 'lodash.isequal';

import ImageUser from '../../../../../../../layout/image/ImageUser';
import AddFlagButton from './AddFlagButton';
import AllIcons from '../../../../../../../layout/icons/AllIcons';

import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';

class VideoSourcePopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      member: {},
    };
    this.scaleCard = new Animated.Value(0);
  }

  componentDidMount() {
    this.props.onRef(this);
  }
  componentDidUpdate(prevProps, prevState) {
    const {recording} = this.state.member;
    const {recording: prevRecording} = prevState.member;
    if (recording && prevRecording) {
      console.log('il est la');
      if (
        !isEqual(prevRecording.uploadRequest, recording.uploadRequest) &&
        !recording.uploadRequest.uploadLaunched &&
        !recording.uploadRequest?.flagsSelected['fullVideo']
      ) {
        console.log('Start Uploading snipets');
        // const snipets = await  this.generateSnipet(recording.uploadRequest.flagsSelected,recording.localSource) TODO-SNIPET
      }
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (!isEqual(props.member, state.member) && props.member)
      return {member: props.member};
    return {};
  }
  timer = (startTimeRecording) => {
    const timerRecording = Number(new Date()) - startTimeRecording;

    const optionsTimer = {
      container: styles.viewRecordingTime,
      text: [styleApp.text, {color: colors.white, fontSize: 14}],
    };
    return (
      <Stopwatch
        laps
        start={true}
        startTime={timerRecording < 0 ? 0 : timerRecording}
        options={optionsTimer}
      />
    );
  };
  buttonRecord() {
    const {member} = this.state;
    const {recording} = member;
    const {selectMember} = this.props;
    return (
      <Col
        size={30}
        style={styleApp.center}
        activeOpacity={0.7}
        onPress={() => selectMember(member)}>
        {recording && recording.isRecording ? (
          this.timer(recording.startTimestamp)
        ) : (
          <View style={styles.recordButton}>
            <Text
              style={[styleApp.textBold, {color: colors.white, fontSize: 14}]}>
              Record
            </Text>
          </View>
        )}
      </Col>
    );
  }

  member() {
    const {member} = this.state;
    const {userID, coachSessionID, takeSnapShotCameraView} = this.props;
    const {firstname, lastname} = member.info;

    return (
      <View key={member.id} style={styles.cardUser}>
        <Row>
          <Col size={15} style={styleApp.center2}>
            <ImageUser user={member} />
          </Col>

          <Col size={40} style={[styleApp.center2]}>
            <Text style={styles.nameText} numberOfLines={1}>
              {userID === member.id
                ? 'Your Camera'
                : firstname + ' ' + lastname}
            </Text>
          </Col>

          <Col size={15}>
            <AddFlagButton
              coachSessionID={coachSessionID}
              member={member}
              disableSnapShot={true}
              takeSnapShotCameraView={takeSnapShotCameraView}
            />
          </Col>

          {this.buttonRecord()}
        </Row>
      </View>
    );
  }
  render() {
    return this.member();
  }
}

const styles = StyleSheet.create({
  cardUser: {
    height: 55,
    width: '100%',
    // paddingLeft: 20,
    // paddingRight: 20,
    marginBottom: 10,
  },
  imgUser: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.off,
  },
  text: {
    marginTop: 15,
    marginHorizontal: 'auto',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  viewRecordingTime: {
    width: 75,
    height: 35,
    borderRadius: 5,
    ...styleApp.center,
    backgroundColor: colors.red,
  },
  recordButton: {
    width: 75,
    height: 35,
    borderRadius: 5,
    ...styleApp.center,
    backgroundColor: colors.greyDark,
  },
  nameText: {
    ...styleApp.text,
    paddingRight: 15,
    marginLeft: -5,
  },
});

VideoSourcePopup.propTypes = {
  members: PropTypes.array.isRequired,
  selectMember: PropTypes.func,
  close: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps)(VideoSourcePopup);
