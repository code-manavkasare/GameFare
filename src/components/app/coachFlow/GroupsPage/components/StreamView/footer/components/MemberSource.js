import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Easing} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';
import database from '@react-native-firebase/database';

import ImageUser from '../../../../../../../layout/image/ImageUser';
import AddFlagButton from './AddFlagButton';
import {uploadQueueAction} from '../../../../../../../../store/actions/uploadQueueActions';
import {arrayUploadFromSnippets} from '../../../../../../../functions/videoManagement';
import {navigate} from '../../../../../../../../../NavigationService';

import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';
import Loader from '../../../../../../../layout/loaders/Loader';
import Timer from './Timer';
import {request} from 'react-native-permissions';

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
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }
  async componentDidUpdate(prevProps, prevState) {
    const {member} = this.state;
    const {coachSessionID, getMembers, userID} = this.props;
    const {recording, id: memberID} = member;
    const {recording: prevRecording} = prevState.member;
    if (recording?.uploadRequest && prevRecording) {
      if (
        !isEqual(
          prevRecording.uploadRequest
            ? Object.keys(prevRecording.uploadRequest)
            : {},
          Object.keys(recording.uploadRequest),
        ) &&
        !recording.uploadRequest?.uploadLaunched &&
        memberID === userID
      ) {
        const {uploadRequest} = recording;
        let {flagsSelected} = uploadRequest;
        if (prevRecording?.uploadRequest?.flagsSelected) {
          const newClipKeys = Object.keys(flagsSelected).filter(
            (clip) => !prevRecording.uploadRequest.flagsSelected[clip],
          );
          let newFlags = {};
          for (let id in newClipKeys) {
            newFlags[id] = flagsSelected[id];
          }
          flagsSelected = newFlags;
        }
        const membersSession = getMembers();
        await arrayUploadFromSnippets({
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
            [`coachSessions/${coachSessionID}/members/${memberID}/recording/fullVideo`]: null,
            [`coachSessions/${coachSessionID}/members/${memberID}/recording/flagsSelected`]: null,
            [`coachSessions/${coachSessionID}/members/${memberID}/recording/flags`]: null,
          });
      }
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (!isEqual(props.member, state.member) && props.member) {
      return {member: props.member};
    }
    return {};
  }

  loading(val) {
    this.setState({loader: val});
  }

  timer() {
    const {member} = this.state;
    const {recording} = member;
    const dispatched = recording?.dispatched;
    const isRecording = recording && recording.isRecording;

    const timer = (startTimestamp) => {
      if (dispatched) {
        return null;
      }
      const optionsTimer = {
        container: styles.viewRecordingTime,
        text: [
          styleApp.textBold,
          {color: colors.black, fontSize: 12, marginTop: 1},
        ],
      };
      // Timer the source of a 'react state update after unmount' warning
      return (
        <Timer
          startTime={startTimestamp < 0 ? 0 : startTimestamp}
          options={optionsTimer}
        />
      );
    };
    if (isRecording) {
      return timer(recording.startTimestamp);
    }
  }
  buttonRecord() {
    let {member, loader} = this.state;
    const {recording} = member;
    const {selectMember, coachSessionID} = this.props;
    const isRecording = recording && recording.isRecording;
    const isDisabled =
      recording?.enabled === false || member?.publishVideo === false;
    if (loader || recording?.dispatched) {
      return (
        <Col size={10} style={styleApp.center3}>
          <View style={{...styles.containerRecording}}>
            <Loader size={35} color={colors.red} />
          </View>
        </Col>
      );
    }

    return !isDisabled || isRecording ? (
      <Col
        size={10}
        style={styleApp.center3}
        activeOpacity={0.7}
        onPress={async () => {
          await selectMember(member);
        }}>
        <View style={styles.containerRecording}>
          <View
            style={isRecording ? styles.recordButtonOn : styles.recordButtonOff}
          />
        </View>
      </Col>
    ) : (
      <Col size={10} style={styleApp.center3}>
        <View style={{...styles.containerRecording}}>
          <View style={styles.recordButtonDisabled} />
        </View>
      </Col>
    );
  }

  member() {
    const {member} = this.state;
    const {userID, coachSessionID, takeSnapShotCameraView} = this.props;
    const {firstname, lastname} = member.info;
    const {recording} = member;

    return (
      <View key={member.id} style={styles.cardUser}>
        <Row>
          <Col size={15} style={styleApp.center2}>
            <ImageUser user={member} />
          </Col>

          <Col size={2} />

          <Col size={35} style={styleApp.center2}>
            <Text style={[styleApp.text, {fontSize: 14}]}>
              {userID === member.id
                ? 'Your Camera'
                : firstname + ' ' + lastname}
            </Text>
            {this.timer()}
          </Col>

          <Col size={15} />
          <Col size={15}>
            {!recording?.dispatched ? (
              <AddFlagButton
                coachSessionID={coachSessionID}
                member={member}
                disableSnapShot={true}
                takeSnapShotCameraView={takeSnapShotCameraView}
              />
            ) : null}
          </Col>

          <Col size={8} />

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
    width: 28,
    height: 28,
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
  recordButtonDisabled: {
    width: 28,
    height: 28,
    ...styleApp.center,
    paddingLeft: 10,
    borderRadius: 20,
    paddingRight: 10,
    backgroundColor: colors.greyLight,
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
