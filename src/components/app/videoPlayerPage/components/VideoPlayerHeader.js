import React from 'react';
import {View, Animated, StatusBar} from 'react-native';
import PropTypes from 'prop-types';
import {BlurView} from '@react-native-community/blur';
import {connect} from 'react-redux';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {
  marginTopApp,
  marginTopAppLandscape,
  heightHeaderHome,
} from '../../../style/sizes';
import {native} from '../../../animations/animations';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import {createShareVideosBranchUrl} from '../../../database/branch';
import ButtonShareVideo from './ButtonShareVideo';
import ButtonLink from './ButtonLink';
import {archiveSelector} from '../../../../store/selectors/archives';

class VideoPlayerHeader extends React.Component {
  static propTypes = {
    disableRecord: PropTypes.bool,
    isEditMode: PropTypes.bool.isRequired,
    addVideo: PropTypes.func.isRequired,
    editModeOff: PropTypes.func.isRequired,
    editModeOn: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.translateY = new Animated.Value(1);
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.videoClicks = [];
  }
  componentDidMount = () => {
    const {onRef} = this.props;
    if (onRef) onRef(this);
  };
  handleClick = (index) => {
    const videoIndex = this.videoClicks.indexOf(index);
    let toValue = 1;
    if (videoIndex === -1) {
      StatusBar.setHidden(false, 'fade');
      this.videoClicks.push(index);
    } else {
      this.videoClicks.splice(videoIndex, 1);
    }
    if (this.videoClicks.length === 0) {
      StatusBar.setHidden(true, 'fade');
      toValue = 0;
    }

    Animated.timing(this.translateY, native(toValue)).start();
  };
  isButtonReviewVisible = () => {
    const {disableRecord, archives, firstArchive, route} = this.props;
    const {coachSessionID} = route.params;
    if (disableRecord || archives.length > 1) return false;
    if (firstArchive.recordedActions || coachSessionID) return false;
    return true;
  };
  iconReview = () => {
    const {isEditMode} = this.props;
    const isButtonReviewVisible = this.isButtonReviewVisible();
    if (!isButtonReviewVisible) return null;
    if (isEditMode) return 'times';
    return 'microphone-alt';
  };
  clickIconReview = () => {
    const {isEditMode, editModeOn, editModeOff} = this.props;
    const isButtonReviewVisible = this.isButtonReviewVisible();
    if (!isButtonReviewVisible) return null;
    if (isEditMode) return editModeOff();
    return editModeOn();
  };
  header() {
    const {
      isEditMode,
      isRecording,
      isPreviewing,
      addVideo,
      close,
      route,
      isDrawingEnabled,
      setState,
      recordedActions,
      navigation,
      archives,
      userConnected,
    } = this.props;
    const {coachSessionID} = route.params;
    const sharedProps = {
      inputRange: [100, 100],
      colorLoader: 'white',
      AnimatedHeaderValue: this.AnimatedHeaderValue,
      sizeLoader: 40,
      initialTitleOpacity: 1,
      onPressColorIcon1: 'transparent',
      nobackgroundColorIcon1: false,
      backgroundColorIcon1: 'transparent',
      initialBorderColorIcon: 'transparent',
      initialBackgroundColor: 'transparent',
      sizeIcon1: 15,
      colorIcon1: colors.white,
      typeIcon1: 'font',
      marginTop: -3,
      backgroundColorIcon2: 'transparent',
      typeIcon2: !isEditMode && !coachSessionID ? 'font' : 'font',
      sizeIcon2: !isEditMode && !coachSessionID ? 19 : 19,
      icon2: this.iconReview(),
      text2: 'Edit',
      colorIcon2: colors.white,
      clickButton2: this.clickIconReview,
      icon11: 'arrows-alt',
      colorIcon11: !isDrawingEnabled ? colors.greyDarker : colors.white,
      typeIcon11: 'font',
      backgroundColorIcon11: !isDrawingEnabled
        ? colors.secondary
        : 'transparent',
      sizeIcon11: 17,
      clickButton11: () => setState({isDrawingEnabled: false}),
      icon12: 'paint-brush',
      colorIcon12: isDrawingEnabled ? colors.greyDarker : colors.white,
      typeIcon12: 'font',
      sizeIcon12: 17,
      backgroundColorIcon12: isDrawingEnabled
        ? colors.secondary
        : 'transparent',
      clickButton12: () => setState({isDrawingEnabled: true}),
      iconOffset2: 'user-plus',
      typeIconOffset2: 'font',
      backgroundColorIconOffset: 'transparent',
      colorIconOffset2: !isEditMode ? colors.white : colors.greyDark,
      clickButtonOffset2: async () => {
        !isEditMode && !userConnected
          ? navigation.navigate('SignIn')
          : !isEditMode
          ? navigation.navigate('ModalCallTab', {
              action: 'shareArchives',
              archivesToShare: archives,
              modal: true,
              branchLink: await createShareVideosBranchUrl(archives),
              inlineSearch: true,
            })
          : null;
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
      sizeIconOffset: 17,
      icon1: 'times',
      clickButton1: () => close(),
    };
    return <HeaderBackButton {...sharedProps} />;
  }

  buttonSharing = () => {
    const {isEditMode, coachSessionID, getVideoState, archives} = this.props;
    if (!coachSessionID) {
      return null;
    }

    return (
      <ButtonShareVideo
        onRef={(ref) => (this.buttonShareRef = ref)}
        isEditMode={isEditMode}
        archives={archives}
        coachSessionID={coachSessionID}
        getVideoState={getVideoState}
      />
    );
  };

  buttonLink = () => {
    const {coachSessionID, toggleLinkAllVideos, allowLinking} = this.props;
    return allowLinking ? (
      <ButtonLink
        coachSessionID={coachSessionID}
        toggleLinkAllVideos={toggleLinkAllVideos}
        allowLinking={allowLinking}
      />
    ) : null;
  };

  render() {
    const {portrait} = this.props;
    const {translateY} = this;
    const marginTop = portrait ? marginTopApp : marginTopAppLandscape;
    let marginTopFloatingButtons = marginTopApp + heightHeaderHome;
    if (!portrait)
      marginTopFloatingButtons = marginTopAppLandscape + heightHeaderHome;
    const headerTranslateY = translateY.interpolate({
      inputRange: [0, 1],
      outputRange: [-250, 0],
    });
    const headerOpacity = translateY.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    const floatingButtonsTranslateY = translateY.interpolate({
      inputRange: [0, 1],
      outputRange: [-220, 0],
    });
    const blurViewStyle = {
      position: 'absolute',
      zIndex: -1,
      ...styleApp.fullSize,
      top: 0,
    };
    const containerStyle = {
      zIndex: 2,
      position: 'absolute',
      top: 10,
      width: '100%',
    };
    const headerContainerStyle = {
      position: 'absolute',
      top: 0,
      marginTop,
      height: 65,
      borderRadius: 75,
      width: '95%',
      left: '2.5%',
      overflow: 'hidden',
      opacity: headerOpacity,
      // transform: [{translateY: headerTranslateY}],
    };
    const floatingButtonsStyle = {
      width: '95%',
      left: '2.5%',
      alignItems: 'flex-end',
      marginTop: marginTopFloatingButtons,
      transform: [{translateY: floatingButtonsTranslateY}],
    };
    return (
      <View style={containerStyle}>
        <Animated.View style={headerContainerStyle}>
          {this.header()}
          <BlurView style={blurViewStyle} blurType="dark" blurAmount={10} />
        </Animated.View>
        <Animated.View style={floatingButtonsStyle}>
          {this.buttonSharing()}
          {this.buttonLink()}
        </Animated.View>
      </View>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    firstArchive: archiveSelector(state, {id: props.archives[0]}),
  };
};

export default connect(mapStateToProps)(VideoPlayerHeader);
