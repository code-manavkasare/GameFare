import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';

import MemberSource from './MemberSource';
import ExportQueue from './FinalizeRecording/components/ExportQueue';
import {native} from '../../../../../../../animations/animations';

import colors from '../../../../../../../style/colors';
import sizes from '../../../../../../../style/sizes';
import styleApp from '../../../../../../../style/style';
import ButtonColor from '../../../../../../../layout/Views/Button';
import AllIcons from '../../../../../../../layout/icons/AllIcons';

class RecordingMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      members: [],
      exportingMembers: {},
      memberUpdate: undefined
    };
    this.scaleCard = new Animated.Value(0);
    this.itemsRef = [];
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  componentDidUpdate(prevProps, prevState) {
    const {members, visible, memberUpdate} = this.state
    if (members === undefined) this.close()
    if (!this.exportQueueRef.state.visible && !prevState.visible && visible) this.open()
    if (memberUpdate !== undefined) this.updateMember(memberUpdate)
  }

  updateMember(member) {
    this.state.memberUpdate = undefined
    this.state.exportingMembers[member?.id] = member
    this.exportQueueRef.updateMember(member)
  }

  static getDerivedStateFromProps(props, state) {
    const {userID, finalizeRecordingMember} = props;
    const {exportingMembers} = state;

    let newState = {}

    if (!isEqual(exportingMembers[finalizeRecordingMember?.id], finalizeRecordingMember))
      newState = {memberUpdate: finalizeRecordingMember}

    return {
      ...newState, 
      members: props.members
        ? Object.values(props.members).filter((member) => {
            return (
              member.isConnected &&
              (member.permissionOtherUserToRecord || member.id === userID)
            );
          })
        : undefined,
    };
  }

  open() {
    const {members} = this.state
    this.setState({visible: true});
    if (members.length > 0)
      return Animated.parallel([
        Animated.timing(this.scaleCard, native(0.5, 300)),
      ]).start();
  }

  close() {
    if (this.exportQueueRef.state.visible) {
      this.exportQueueRef.close()
      this.setState({exportingMembers: {}});
    }
    else {
      this.setState({visible: false});
      return Animated.parallel([
        Animated.timing(this.scaleCard, native(0, 300)),
      ]).start();
    }
  }
  backdrop() {
    const {visible} = this.state;

    return (
      <TouchableWithoutFeedback onPress={() => {
        this.close()
      }}>
        <View
          pointerEvents={visible ? 'auto' : 'none'}
          style={styles.fullPage}
        />
      </TouchableWithoutFeedback>
    );
  }

  openExportQueue(member, thumbnails) {
    let {members, exportingMembers} = this.state
    const {length} = members
    const adjusted = ((170 - (length-1)*65) / (350 - (length-1)*65))/2 + 0.5
    Animated.parallel([
      Animated.timing(this.scaleCard, native(
        (member.recording?.flags || 
          (this.exportQueueRef.state.members && Object.values(this.exportQueueRef.state.members).filter(
            (m) => m?.recording?.flags ).length > 0)) ? 
        1 : adjusted, 300
      )),
    ]).start();
    exportingMembers[`${member.id}`] = member
    this.setState({exportingMembers})
    this.exportQueueRef.open(member, thumbnails)
  }

  newPositionByHeight() {
    const {members} = this.state
    const {length} = members
    return (length-1)*65
  }

  memberList() {
    const {visible, members} = this.state;
    const {members: propsMembers, currentScreenSize, userID, finalizeRecordingMember} = this.props;
    const {selectMember, coachSessionID} = this.props;
    const width = currentScreenSize.currentWidth;

    return (
      <View>
        <Text style={[styleApp.text, styles.text]}>Record</Text>
        <View style={[{width:'90%', marginHorizontal:'5%', marginTop: 5, marginBottom: -10}]}>
        {members?.map((member) => (
          <MemberSource
            member={member}
            key={member.id}
            coachSessionID={coachSessionID}
            onRef={(ref) => (this.itemsRef[member.id] = ref)}
            getMembers={() => {
              return propsMembers;
            }}
            selectMember={async (member) => {
              var sourceRef = this.itemsRef[member.id]
              const isStopingRecording =
                member.recording && member.recording.isRecording;
              if (isStopingRecording) await sourceRef.setState({loader: true});
              if (isStopingRecording && member.id !== userID) this.openExportQueue(member)
              await selectMember(member);
              sourceRef.setState({loader:false})
            }}
          />
        ))}
        </View>
      </View>
    )
  }

  render() {
    const {visible, members} = this.state;
    const {members: propsMembers, currentScreenSize, userID, finalizeRecordingMember} = this.props;
    const {selectMember, coachSessionID} = this.props;
    const width = currentScreenSize.currentWidth;

    const translateY = this.scaleCard.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1000 + sizes.offsetFooterStreaming, 350, this.newPositionByHeight()],
      extrapolate: 'clamp',
    });

    return (
      <View style={{zIndex: -1}}>
        <Animated.View
          pointerEvents={visible ? 'auto' : 'none'}
          style={[
            styles.square,
            { width, transform: [{translateY: translateY}] },
          ]}>
          <ButtonColor
            view={() => {
              return (
                <AllIcons
                  name="times"
                  size={13}
                  color={colors.title}
                  type="font"
                />
              );
            }}
            click={() => this.close()}
            color={colors.white}
            style={styles.buttonClose}
            onPressColor={colors.off}
          />
          {this.memberList()}
          <ExportQueue
            onRef={(ref) => {this.exportQueueRef = ref}}
            onClose={() => {
              this.open()
              this.setState({exportingMembers: {}})
            }}
            coachSessionID = {coachSessionID}
          />
          {this.backdrop()}
        </Animated.View>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  square: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingBottom:450 + sizes.offsetFooterStreaming,
    backgroundColor: colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    zIndex: -1,
  },
  buttonClose: {
    position: 'absolute',
    top: 15,
    right: '5%',
    height: 35,
    width: 35,
    zIndex:2,
    borderRadius: 20,
  },
  fullPage: {
    position: 'absolute',
    width: sizes.width,
    height: 200000,
    top:-sizes.height,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
  text: {
    marginTop: 20,
    marginBottom:5,
    fontSize: 21,
    marginHorizontal: 'auto',
    textAlign: 'left',
    marginLeft:'5%',
    fontWeight: 'bold',
    color:colors.black
  },
});

RecordingMenu.propTypes = {
  members: PropTypes.array.isRequired,
  selectMember: PropTypes.func,
  close: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    currentScreenSize: state.layout.currentScreenSize,
  };
};

export default connect(mapStateToProps)(RecordingMenu);
