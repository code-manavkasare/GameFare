import React from 'react';
import {Animated, Image, StatusBar} from 'react-native';
import PropTypes from 'prop-types';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import sizes from '../../../style/sizes';
import {native} from '../../../animations/animations';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import {createShareVideosBranchUrl} from '../../../database/branch';

import {BlurView} from '@react-native-community/blur';
export default class VideoPlayerHeader extends React.Component {
  static propTypes = {
    isEditMode: PropTypes.bool.isRequired,
    addVideo: PropTypes.func.isRequired,
    editModeOff: PropTypes.func.isRequired,
    editModeOn: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.translateY = new Animated.Value(-150);
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.videoClicks = [];
  }
  componentDidMount() {
    const {onRef} = this.props;
    if (onRef) onRef(this);
    StatusBar.setHidden(true, 'fade');
  }
  handleClick(index) {
    const videoIndex = this.videoClicks.indexOf(index);
    let toValue = 0;
    if (videoIndex === -1) {
      this.videoClicks.push(index);
    } else {
      this.videoClicks.splice(videoIndex, 1);
    }
    if (this.videoClicks.length === 0) {
      toValue = -150;
      StatusBar.setHidden(true, 'fade');
    } else {
      StatusBar.setHidden(false, 'fade');
    }
    Animated.timing(this.translateY, native(toValue)).start();
  }
  header() {
    const {
      isEditMode,
      isRecording,
      isPreviewing,
      addVideo,
      editModeOff,
      editModeOn,
      close,
      route,
      isDrawingEnabled,
      setState,
      recordedActions,
      navigation,
      archives,
      videoInfos,
      personSharingScreen,
    } = this.props;
    const {coachSessionID} = route.params;

    const sharedProps = {
      inputRange: [5, 10],
      colorLoader: 'white',
      AnimatedHeaderValue: this.AnimatedHeaderValue,
      sizeLoader: 40,
      initialTitleOpacity: 1,
      onPressColorIcon1: 'transparent',
      nobackgroundColorIcon1: false,
      backgroundColorIcon1: 'transparent',
      initialBorderColorIcon: 'transparent',
      sizeIcon1: 18,
      colorIcon1: isEditMode ? colors.greyDark : colors.white,
      typeIcon1: 'font',
      marginTop: -3,
      backgroundColorIcon2: 'transparent',
      typeIcon2: !isEditMode && !coachSessionID ? 'font' : 'font',
      sizeIcon2: !isEditMode && !coachSessionID ? 19 : 19,
      icon2: !videoInfos
        ? null
        : !Object.values(videoInfos)[0]
        ? null
        : archives.length !== 1 ||
          (archives.length === 1 &&
            Object.values(videoInfos)[0].recordedActions) ||
          personSharingScreen
        ? 'microphone-alt'
        : !isEditMode && !coachSessionID
        ? 'microphone-alt'
        : 'times',
      text2: 'Edit',
      colorIcon2: !videoInfos
        ? colors.greyDark
        : !Object.values(videoInfos)[0]
        ? colors.greyDark
        : archives.length !== 1 ||
          (archives.length === 1 &&
            Object.values(videoInfos)[0].recordedActions) ||
          personSharingScreen
        ? colors.greyDark
        : colors.white,
      clickButton2: () => {
        !videoInfos
          ? null
          : !Object.values(videoInfos)[0]
          ? null
          : archives.length !== 1 ||
            (archives.length === 1 &&
              Object.values(videoInfos)[0].recordedActions) ||
            personSharingScreen
          ? null
          : !isEditMode && !coachSessionID
          ? editModeOn()
          : editModeOff();
      },
      icon11: 'arrows-alt',
      colorIcon11: !isDrawingEnabled ? colors.greyDarker : colors.white,
      typeIcon11: 'font',
      backgroundColorIcon11: !isDrawingEnabled
        ? colors.secondary
        : 'transparent',
      sizeIcon11: 21,
      clickButton11: () => setState({isDrawingEnabled: false}),
      icon12: 'paint-brush',
      colorIcon12: isDrawingEnabled ? colors.greyDarker : colors.white,
      typeIcon12: 'font',
      sizeIcon12: 19,
      backgroundColorIcon12: isDrawingEnabled
        ? colors.secondary
        : 'transparent',
      clickButton12: () => setState({isDrawingEnabled: true}),
      iconOffset2: 'user-plus',
      typeIconOffset2: 'font',
      backgroundColorIconOffset: 'transparent',
      colorIconOffset2: !isEditMode ? colors.white : colors.greyDark,
      clickButtonOffset2: async () => {
        !isEditMode &&
          navigation.navigate('ModalCallTab', {
            action: 'shareArchives',
            archivesToShare: archives,
            modal: true,
            branchLink: await createShareVideosBranchUrl(archives),
            inlineSearch: true,
          });
      },
      sizeIconOffset2: 17,
      typeIconOffset: 'font',
      iconOffset: 'plus',
      colorIconOffset:
        isEditMode || isRecording || isPreviewing || recordedActions.length > 0
          ? colors.greyDark
          : colors.white,
      clickButtonOffset: () => {
        !(
          isEditMode ||
          isRecording ||
          isPreviewing ||
          recordedActions.length > 0
        ) && addVideo();
      },
      sizeIconOffset: 20,
      icon1: 'chevron-left',
      clickButton1: () => {
        !isEditMode && close();
        !isEditMode && StatusBar.setHidden(false, 'fade');
      },
    };
    return <HeaderBackButton {...sharedProps} />;
  }
  render() {
    const {portrait} = this.props;
    const {translateY} = this;
    const marginTop = portrait
      ? sizes.marginTopApp
      : sizes.marginTopAppLandscape;
    const blurViewStyle = {
      position: 'absolute',
      zIndex: -1,
      ...styleApp.fullSize,
      top: 0,
    };
    const containerStyle = {
      position: 'absolute',
      top: 10,
      marginTop,
      height: 65,
      borderRadius: 75,
      width: '95%',
      left: '2.5%',
      zIndex: 2,
      overflow: 'hidden',
      transform: [{translateY}],
    };
    return (
      <Animated.View style={containerStyle}>
        {this.header()}
        <BlurView style={blurViewStyle} blurType="dark" blurAmount={10} />
      </Animated.View>
    );
  }
}
