import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Easing} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';
import database from '@react-native-firebase/database';

import ImageUser from '../../../../../../../layout/image/ImageUser';
import AddFlagButton from './AddFlagButton';
import {uploadQueueAction} from '../../../../../../../../actions/uploadQueueActions';
import {arrayUploadFromSnipets} from '../../../../../../../functions/videoManagement';
import {navigate} from '../../../../../../../../../NavigationService';

import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';
import Loader from '../../../../../../../layout/loaders/Loader';
import Timer from './Timer';

class MemberSource extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      member: {},
      loader: false,
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

  timer() {
    const {member} = this.state;
    const {recording} = member;
    const isRecording = recording && recording.isRecording;

    const timer = (startTimestamp) => {
      const optionsTimer = {
        container: styles.viewRecordingTime,
        text: [styleApp.text, {color: colors.title, fontSize: 12}],
      };
      return (
        <Timer
          startTime={startTimestamp < 0 ? 0 : startTimestamp}
          options={optionsTimer}
        />
      );
    };
    if (isRecording) return timer(recording.startTimestamp);
  }
  buttonRecord() {
    let {member, loader} = this.state;
    const {recording} = member;
    const {selectMember, coachSessionID} = this.props;
    const isRecording = recording && recording.isRecording;
    if (loader)
      return (
        <Col style={styleApp.center} size={10}>
          <Loader size={25} color={colors.red} />
        </Col>
      );
    const isEnabled = recording && recording.enabled === false;

    return !isEnabled ? (
      <Col
        size={10}
        style={styleApp.center3}
        activeOpacity={0.7}
        onPress={async () => {
          const isStopingRecording =
            member.recording && member.recording.isRecording;
          if (isStopingRecording) await this.setState({loader: true});
          await selectMember(member);
          if (isStopingRecording) {
            let newRecording = member.recording;
            newRecording.stopTimestamp = Date.now();
            member.recording = newRecording;
            console.log('sjdhfdfhgdkfhgjdfg', member);
            await navigate('FinalizeRecording', {
              member: member,
              coachSessionID: coachSessionID,
              onGoBack: () => {
                return this.setState({finalizeRecordingMember: false});
              },
            });
            this.setState({loader: false});
          }
        }}>
        <View style={styles.containerRecording}>
          <View
            style={isRecording ? styles.recordButtonOn : styles.recordButtonOff}
          />
        </View>
      </Col>
    ) : (
      <Col size={10} />
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

          <Col size={35} style={styleApp.center2}>
            <Text style={[styleApp.text, {fontSize: 13}]}>
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

          <Col size={25} style={styleApp.center}>
            {this.timer()}
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
    width: '100%',
    height: 32,
    borderRadius: 5,
    paddingLeft: 5,
    paddingRight: 5,
    ...styleApp.center,
  },
  containerRecording: {
    width: 40,
    height: 40,
    ...styleApp.center,
    borderWidth: 3,
    borderRadius: 20,
    borderColor: colors.off,
  },
  recordButtonOff: {
    width: 30,
    height: 30,
    ...styleApp.center,
    paddingLeft: 10,
    borderRadius: 20,
    paddingRight: 10,
    backgroundColor: colors.red,
  },
  recordButtonOn: {
    width: 20,
    height: 20,
    borderRadius: 5,
    ...styleApp.center,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: colors.red,
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
