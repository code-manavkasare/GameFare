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

import MemberSource from './MemberSource';
import UploadMenu from './UploadMenu';
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
      members: []
    };
    this.menuAnimation = new Animated.Value(0);
    this.uploadReveal = new Animated.Value(0);
    this.itemsRef = [];
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  componentDidUpdate(prevProps, prevState) {
    const {members, visible} = this.state
    if (members === undefined) this.close()
    if (!this.exportQueueRef?.state.visible && !prevState.visible && visible) this.open()
  }

  static getDerivedStateFromProps(props, state) {
    const {userID} = props;
    return {
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
        Animated.timing(this.uploadReveal, native(0, 300)),
        Animated.timing(this.menuAnimation, native(0.5, 300)),
      ]).start();
  }

  close(hideUploadMenu) {
    const { state: exportQueueState } = this.exportQueueRef
    const { state: uploadQueueState } = this.uploadQueueRef

    const animateSelf = (action) => {
      return Animated.parallel([
        Animated.timing(
          action === 'close' ? 
          this.menuAnimation : this.uploadReveal, 
          native(0, 300)
        )]).start()
    }

    if (exportQueueState?.visible) {
      this.exportQueueRef?.close()
    } else if (!hideUploadMenu && uploadQueueState?.visible) {
      this.uploadQueueRef?.close()
      animateSelf('remain')
    } else if (hideUploadMenu && !uploadQueueState?.visible) {
      this.uploadQueueRef?.setState({visible: false})
      animateSelf('remain')
    } else {
      this.setState({visible: false});
      animateSelf('close')
    }
  }

  closeButton() {
    const opacity = this.menuAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View 
        style={{
          ...styles.buttonClose,
          opacity
        }}>
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
          onPressColor={colors.off}
        />
      </Animated.View>
    )
  }

  backdrop() {
    const {visible} = this.state;

    return (
      visible && <TouchableWithoutFeedback 
      disabled={!visible}
      onPress={() => {
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
    Animated.parallel([
      Animated.timing(this.menuAnimation, native(1, 300)),
    ]).start();
    this.exportQueueRef.open(member, thumbnails)
  }

  openUploadQueue() {
    if (this.exportQueueRef.state.visible) 
      return this.exportQueueRef.close()
    Animated.parallel([
      Animated.timing(this.uploadReveal, native(1, 300))
    ]).start();
    this.uploadQueueRef.open()
  }

  render() {
    const {visible, members} = this.state;
    const {members: propsMembers, currentScreenSize, userID} = this.props;
    const {selectMember, coachSessionID} = this.props;
    const {currentWidth: width, currentHeight: height} = currentScreenSize;
    const {length} = members

    const parentTranslateY = this.menuAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1000 + sizes.offsetFooterStreaming, 350, (length-1)*65-10],
      extrapolate: 'clamp',
    });

    const recordingTranslateY = this.uploadReveal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 400]
    })

    return (
      <Animated.View style={{zIndex:-1, width, transform: [{translateY: parentTranslateY}]}}>
        <UploadMenu
          onRef={(ref) => {this.uploadQueueRef = ref}}
          openUploadQueue={() => {this.openUploadQueue()}}
          members={members}
          coachSessionID={coachSessionID}
          close={(pass) => {this.close(pass)}}
        />
        <Animated.View
          pointerEvents={visible ? 'auto' : 'none'}
          style={{
            ...styles.menuContainer, 
            width,
            transform: [{translateY: recordingTranslateY}]
          }}>
          <Text style={styles.text}>Record</Text>
          {this.closeButton()}
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
          
          <ExportQueue
            onRef={(ref) => {this.exportQueueRef = ref}}
            onClose={() => {this.open()}}
            coachSessionID = {coachSessionID}
            members = {members}
          />
        </Animated.View>
        {this.backdrop()}
      </Animated.View>
    );
  }
}


const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingBottom:450 + sizes.offsetFooterStreaming,
    backgroundColor: colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    bottom: 0,
    zIndex: 1,
    ...styleApp.shadow
  },
  buttonClose: {
    position: 'absolute',
    top: 15,
    right: '5%',
    height: 35,
    width: 35,
    zIndex:2,
    borderRadius: 20,
    overflow:'hidden'
  },
  fullPage: {
    position: 'absolute',
    ...styleApp.fullSize,
    width: sizes.width,
    height: 200000,
    bottom:0,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
  text: {
    ...styleApp.text,
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
