import React from 'react';
import {Animated, Image} from 'react-native';
import PropTypes from 'prop-types';
import colors from '../../../style/colors';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import {createShareVideosBranchUrl} from '../../../database/branch';

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
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  render() {
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
    } = this.props;
    const {coachSessionID} = route.params;
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
      sizeIcon1: 18,
      colorIcon1: colors.white,
      typeIcon1: 'font',

      backgroundColorIcon2: colors.title + '70',
      typeIcon2: !isEditMode && !coachSessionID ? 'font' : 'font',
      sizeIcon2: !isEditMode && !coachSessionID ? 19 : 19,
      icon2:
        archives.length !== 1 ||
        (archives.length === 1 && Object.values(videoInfos)[0].recordedActions)
          ? null
          : !isEditMode && !coachSessionID
          ? 'microphone-alt'
          : 'times',
      text2: 'Edit',
      colorIcon2: colors.white,
      clickButton2: () => {
        if (!isEditMode && !coachSessionID) {
          editModeOn();
        } else {
          editModeOff();
        }
      },
      icon11: 'arrows-alt',
      colorIcon11: colors.white,
      typeIcon11: 'font',
      backgroundColorIcon11: !isDrawingEnabled
        ? colors.secondary
        : colors.title + '70',
      sizeIcon11: 21,
      clickButton11: () => setState({isDrawingEnabled: false}),
      icon12: 'paint-brush',
      colorIcon12: colors.white,
      typeIcon12: 'font',
      sizeIcon12: 19,
      backgroundColorIcon12: isDrawingEnabled
        ? colors.secondary
        : colors.title + '70',
      clickButton12: () => setState({isDrawingEnabled: true}),
    };
    return isEditMode ? (
      <HeaderBackButton {...sharedProps} />
    ) : (
      <HeaderBackButton
        icon1={'chevron-left'}
        clickButton1={() => close()}
        colorIconOffset={colors.white}
        backgroundColorIconOffset={colors.title + '70'}
        iconOffset={
          isEditMode ||
          isRecording ||
          isPreviewing ||
          recordedActions.length > 0
            ? null
            : 'plus'
        }
        clickButtonOffset={() => addVideo()}
        typeIconOffset={'font'}
        iconOffset2={'user-plus'}
        typeIconOffset2={'font'}
        sizeIconOffset2={17}
        sizeIconOffset={20}
        backgroundColorIconOffset2={colors.title + '70'}
        colorIconOffset2={colors.white}
        clickButtonOffset2={async () =>
          navigation.navigate('ModalCallTab', {
            action: 'shareArchives',
            archivesToShare: archives,
            modal: true,
            branchLink: await createShareVideosBranchUrl(archives),
            inlineSearch: true,
          })
        }
        {...sharedProps}
      />
    );
  }
}
