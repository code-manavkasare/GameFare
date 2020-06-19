import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Easing} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';
import {Stopwatch} from 'react-native-stopwatch-timer';
import isEqual from 'lodash.isequal';
import database from '@react-native-firebase/database';

import ImageUser from '../../../../../../../layout/image/ImageUser';
import AddFlagButton from './AddFlagButton';
import {uploadQueueAction} from '../../../../../../../../actions/uploadQueueActions';
import {arrayUploadFromSnipets} from '../../../../../../../functions/videoManagement';

import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';

class MemberSource extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      member: {},
    };
  }

  componentDidMount() {
    this.props.onRef(this);
  }
  async componentDidUpdate(prevProps, prevState) {
    const {member} = this.state;
    const {coachSessionID, uploadQueueAction, getMembers, userID} = this.props;
    const {recording, id: memberID} = member;
    const {recording: prevRecording} = prevState.member;
    if (recording && prevRecording) {
      if (
        !isEqual(prevRecording.uploadRequest, recording.uploadRequest) &&
        recording.uploadRequest &&
        !recording.uploadRequest.uploadLaunched &&
        memberID === userID
      ) {
        const {uploadRequest} = recording;
        const {flagsSelected} = uploadRequest;

        const membersSession = getMembers();
        const videosToUpload = await arrayUploadFromSnipets({
          flagsSelected,
          recording,
          coachSessionID,
          memberID: member.id,
          members: membersSession,
          userID,
        });
        await database()
          .ref()
          .update({
            [`coachSessions/${coachSessionID}/members/${memberID}/recording/uploadRequest/uploadLaunched`]: true,
          });
        uploadQueueAction('enqueueFilesUpload', videosToUpload);
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

MemberSource.propTypes = {
  selectMember: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(MemberSource);
