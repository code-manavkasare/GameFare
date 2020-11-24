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
    };
    this.menuAnimation = new Animated.Value(0);
    this.peekUploadMenu = new Animated.Value(0);
    this.memberSourceRefs = [];
  }

  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {members, visible} = this.state;
    if (members === undefined) {
      this.close();
    }
    if (!this.exportQueueRef?.state.visible && !prevState.visible && visible) {
      this.open();
    }
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
    const {members} = this.state;
    this.setState({visible: true});
    if (members.length > 0) {
      return Animated.parallel([
        Animated.timing(this.peekUploadMenu, native(0, 300)),
        Animated.timing(this.menuAnimation, native(0.5, 300)),
      ]).start();
    }
  }

  close(hideUploadMenu) {
    const exportQueueState = this.exportQueueRef?.state;
    const uploadQueueState = this.uploadQueueRef?.state;

    const animateSelf = (action) => {
      return Animated.parallel([
        Animated.timing(
          action === 'close' ? this.menuAnimation : this.peekUploadMenu,
          native(0, 300),
        ),
      ]).start();
    };

    if (exportQueueState?.visible) {
      this.exportQueueRef?.close();
    } else if (!hideUploadMenu && uploadQueueState?.visible) {
      this.uploadQueueRef?.close();
      animateSelf('remain');
    } else if (hideUploadMenu && !uploadQueueState?.visible) {
      this.uploadQueueRef?.setState({visible: false});
      animateSelf('remain');
    } else {
      this.setState({visible: false});
      animateSelf('close');
    }
  }

  openExportQueue(member) {
    Animated.parallel([
      Animated.timing(this.menuAnimation, native(1, 300)),
    ]).start();
    this.exportQueueRef?.open(member);
  }

  openUploadQueue() {
    if (this.exportQueueRef?.state?.visible) {
      this.exportQueueRef?.close();
    }
    if (this.state.visible) {
      Animated.parallel([
        Animated.timing(this.peekUploadMenu, native(1, 300)),
      ]).start();
    }
    this.uploadQueueRef?.open(this.state.visible ? 1 : 0);
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
          opacity,
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
    );
  }

  backdrop() {
    const {visible} = this.state;

    return visible ? (
      <TouchableWithoutFeedback
        disabled={!visible}
        onPress={() => {
          this.close();
        }}>
        <View
          pointerEvents={visible ? 'auto' : 'none'}
          style={styles.fullPage}
        />
      </TouchableWithoutFeedback>
    ) : null;
  }

  render() {
    const {visible, members} = this.state;
    const {members: propsMembers, currentScreenSize, userID} = this.props;
    const {selectMember, coachSessionID} = this.props;
    const {currentWidth: width, currentHeight: height} = currentScreenSize;
    const {length} = members;

    const parentTranslateY = this.menuAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [
        1000 + sizes.offsetFooterStreaming,
        350,
        (length - 1) * 65 - 10,
      ],
      extrapolate: 'clamp',
    });

    const recordingTranslateY = this.peekUploadMenu.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 500],
    });
    return (
      <Animated.View
        style={{
          ...styleApp.center,
          zIndex: 2,
          width,
          transform: [{translateY: parentTranslateY}],
        }}>
        <Animated.View
          pointerEvents={visible ? 'auto' : 'none'}
          style={{
            ...styles.menuContainer,
            width: sizes.width * 0.9,
            transform: [{translateY: recordingTranslateY}],
          }}>
          <Text style={styles.text}>Record</Text>
          {this.closeButton()}
          <View
            style={[
              {
                width: '90%',
                marginHorizontal: '5%',
                marginTop: 5,
                marginBottom: -10,
              },
            ]}>
            {members?.map((member) => (
              <MemberSource
                member={member}
                key={member.id}
                coachSessionID={coachSessionID}
                onRef={(ref) => (this.memberSourceRefs[member.id] = ref)}
                getMembers={() => {
                  return propsMembers;
                }}
                selectMember={async (member) => {
                  var sourceRef = this.memberSourceRefs[member.id];
                  sourceRef.setState({loader: true});
                  await selectMember(member);
                  const stopping =
                    member.recording && member.recording.isRecording;
                  if (stopping) {
                    this.openExportQueue(member);
                  }
                  sourceRef.setState({loader: false});
                }}
              />
            ))}
          </View>

          <ExportQueue
            onRef={(ref) => {
              this.exportQueueRef = ref;
            }}
            onClose={() => this.open()}
            coachSessionID={coachSessionID}
            members={members}
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
    paddingBottom: 25,
    bottom: 450 + sizes.marginBottomApp,
    backgroundColor: colors.white,
    borderRadius: 25,
    zIndex: 1,
    ...styleApp.shadow,
  },
  buttonClose: {
    position: 'absolute',
    top: 15,
    right: '5%',
    height: 35,
    width: 35,
    zIndex: 2,
    borderRadius: 20,
    overflow: 'hidden',
  },
  fullPage: {
    position: 'absolute',
    ...styleApp.fullSize,
    width: sizes.width,
    height: 200000,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
  text: {
    ...styleApp.text,
    marginTop: 20,
    marginBottom: 5,
    fontSize: 21,
    marginHorizontal: 'auto',
    textAlign: 'left',
    marginLeft: '5%',
    fontWeight: 'bold',
    color: colors.black,
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
