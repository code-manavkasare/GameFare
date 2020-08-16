import React, {Component} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import isEqual from 'lodash.isequal';
import Orientation from 'react-native-orientation-locker';

import VideoPlayer from '../coachFlow/VideoPlayer/index';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import Button from '../../layout/buttons/Button';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import {
  marginTopApp,
  heightHeaderHome,
  marginTopAppLandscape,
} from '../../style/sizes';
import {openVideoPlayer} from '../../functions/videoManagement';

class VideoPlayerPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditMode: false,
      isRecording: false,
      recordedActions: [],
      loader: false,
      isPreviewing: false,
      // archive: this.props.route.params.archive,
      archive: {},
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      Orientation.unlockAllOrientations();
    });
    // this.focusListener = navigation.addListener('blur', () => {
    //   Orientation.lockToPortrait();
    // });
  }
  static getDerivedStateFromProps(props, state) {
    if (
      props.route?.params?.archive &&
      !isEqual(props.route.params.archive, state.archive)
    )
      return {
        archive: props.route.params.archive,
      };
    return {};
  }
  startRecording = () => {
    this.resetPlayer();
    this.setState({isRecording: true, recordedActions: []});
  };
  stopRecording = () => {
    this.resetPlayer();
    this.setState({isRecording: false});
  };
  resetPlayer = () => {
    this.videoPlayerRef.setState({
      currentTime: 0,
      paused: true,
      playRate: 1,
    });
    this.videoPlayerRef?.controlButtonRef?.setCurrentTime(0, true);
    this.videoPlayerRef?.player?.seek(0);
  };
  isTimestampReached = async (timestampToWait) => {
    while (true) {
      const {isPreviewing} = this.state;
      const currentTime = this.videoPlayerRef.controlButtonRef.getCurrentTime();
      if (
        (timestampToWait < currentTime + 0.01 &&
          timestampToWait > currentTime - 0.01) ||
        !isPreviewing
      ) {
        return true;
      }
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });
    }
  };

  previewRecording = async () => {
    await this.setState({isPreviewing: true});
    await this.resetPlayer();
    const {recordedActions} = this.state;

    for (const action of recordedActions) {
      const {isPreviewing} = this.state;
      if (isPreviewing) {
        switch (action.type) {
          case 'play':
            await this.isTimestampReached(action.timestamp).then(() => {
              this.videoPlayerRef.setState({
                paused: false,
              });
            });
            break;
          case 'pause':
            await this.isTimestampReached(action.timestamp).then(() => {
              this.videoPlayerRef.setState({
                paused: true,
              });
            });
            break;
          case 'changePlayRate':
            await this.isTimestampReached(action.timestamp).then(() => {
              this.videoPlayerRef.setState({
                playRate: action.playRate,
              });
            });
            break;
          case 'willSeek':
            //Useful to wait for seek methods
            await this.isTimestampReached(action.timestamp).then(() => {});
            break;
          case 'seek':
            this.videoPlayerRef.setState({
              currentTime: action.timestamp,
            });
            break;
          default:
            console.log(`case ${action.type} not handled`);
        }
      }
    }

    await this.setState({isPreviewing: false});
  };
  onPlayPause = (paused, currentTime) => {
    const {recordedActions} = this.state;
    recordedActions.push({
      type: paused ? 'pause' : 'play',
      timestamp: currentTime,
    });
    this.setState({recordedActions});
  };
  onPlayRateChange = (playRate, timestamp) => {
    const {recordedActions} = this.state;
    recordedActions.push({
      type: 'changePlayRate',
      playRate,
      timestamp,
    });
    this.setState({recordedActions});
  };
  onSlidingStart = (timestamp) => {
    const {recordedActions} = this.state;
    recordedActions.push({
      type: 'willSeek',
      timestamp,
    });
    this.setState({recordedActions});
  };
  onSlidingEnd = (seekTime) => {
    const {recordedActions} = this.state;
    recordedActions.push({
      type: 'seek',
      timestamp: seekTime,
    });
    this.setState({recordedActions});
  };
  header = () => {
    const {isEditMode} = this.state;
    const {goBack} = this.props.navigation;
    const sharedProps = {
      inputRange: [5, 10],
      colorLoader: 'white',
      AnimatedHeaderValue: this.AnimatedHeaderValue,
      sizeLoader: 40,
      initialTitleOpacity: 1,
      onPressColorIcon1: colors.greyDark + '70',
      nobackgroundColorIcon1: false,
      backgroundColorIcon1: colors.title + '70',
      initialBorderColorIcon: 'transparent',
      sizeIcon1: 16,
      colorIcon1: colors.white,
      typeIcon1: 'font',
    };
    return isEditMode ? (
      <HeaderBackButton
        textHeader={'Edit Mode'}
        icon1="times"
        clickButton1={() => {
          this.setState({isEditMode: false, isRecording: false});
        }}
        {...sharedProps}
      />
    ) : (
      <HeaderBackButton
        icon1="arrow-left"
        typeIcon1="font"
        icon2={'text'}
        text2={'Edit'}
        backgroundColorIcon2={colors.green}
        backgroundColorIconOffset={colors.title + '70'}
        clickButton2={() => this.setState({isEditMode: true})}
        sizeIcon2={24}
        typeIcon2="mat"
        colorIcon2={colors.white}
        initialTitleOpacity={1}
        clickButton1={() => {
          this.videoPlayerRef?.togglePlayPause(true);
          this.videoPlayerRef?.PinchableBoxRef?.resetPosition();
          this.resetPlayer();
          this.setState({recordedActions: []});
          openVideoPlayer({}, false, () => goBack());
        }}
        {...sharedProps}
      />
    );
  };
  getMarginTop = () => {
    const {portrait} = this.props;
    return heightHeaderHome + (portrait ? marginTopApp : marginTopAppLandscape);
  };
  buttonPreview = () => {
    const {isEditMode, isPreviewing, isRecording, recordedActions} = this.state;
    const style = {
      ...styles.buttonRecording,
      top: this.getMarginTop(),
      left: '5%',
    };
    if (isEditMode && !isRecording && recordedActions.length > 0) {
      return isPreviewing ? (
        <Button
          backgroundColor="red"
          onPressColor={colors.green}
          styleButton={style}
          text="Cancel Preview"
          textButton={{fontSize: 13}}
          click={async () => {
            await this.setState({isPreviewing: false});
            await this.resetPlayer();
          }}
        />
      ) : (
        <Button
          backgroundColor="green"
          onPressColor={colors.green}
          styleButton={style}
          text="Preview"
          textButton={{fontSize: 13}}
          click={() => this.previewRecording()}
        />
      );
    }
  };
  buttonRecording = () => {
    const {isEditMode, isRecording} = this.state;
    const style = {
      ...styles.buttonRecording,
      top: this.getMarginTop(),
    };
    return isEditMode ? (
      isRecording ? (
        <Button
          backgroundColor="red"
          onPressColor={colors.green}
          styleButton={style}
          text="stop recording"
          textButton={{fontSize: 13}}
          click={() => this.stopRecording()}
        />
      ) : (
        <Button
          backgroundColor="green"
          onPressColor={colors.red}
          styleButton={style}
          text="start recording"
          textButton={{fontSize: 13}}
          click={() => this.startRecording()}
        />
      )
    ) : null;
  };
  watchVideoView() {
    const {userID, navigation} = this.props;
    const {archive, isRecording} = this.state;
    const {url, id, thumbnail} = archive;
    console.log(archive);
    const {onPlayPause, onPlayRateChange, onSlidingEnd, onSlidingStart} = this;
    const propsWhenRecording = isRecording
      ? {onPlayPause, onPlayRateChange, onSlidingEnd, onSlidingStart}
      : {};
    return (
      <View style={[styleApp.stylePage, {backgroundColor: colors.title}]}>
        {this.header()}
        {this.buttonRecording()}
        {this.buttonPreview()}

        <VideoPlayer
          source={url}
          index={id}
          resizeMode="contain"
          userID={userID}
          setSizeVideo={(sizeVideo) => {
            this.setState({sizeVideo: sizeVideo});
          }}
          noUpdateInCloud={true}
          hideFullScreenButton={true}
          placeHolderImg={thumbnail}
          styleContainerVideo={{...styleApp.center, ...styleApp.fullSize}}
          styleVideo={styleApp.fullSize}
          {...propsWhenRecording}
          onRef={(ref) => (this.videoPlayerRef = ref)}
        />
      </View>
    );
  }
  render() {
    return this.watchVideoView();
  }
}

const styles = StyleSheet.create({
  buttonRecording: {
    position: 'absolute',
    zIndex: 600,
    height: 30,
    width: 110,
    right: '5%',
    borderRadius: 15,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    currentSessionID: state.coach.currentSessionID,
    portrait: state.layout.currentScreenSize.portrait,
  };
};

export default connect(
  mapStateToProps,
  {},
)(VideoPlayerPage);
