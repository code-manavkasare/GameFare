import React from 'react';
import {Animated} from 'react-native';
import PropTypes from 'prop-types';
import colors from '../../../style/colors';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

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
    } = this.props;
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
      iconOffset: isEditMode || isRecording || isPreviewing ? null : 'plus',
      colorIconOffset: colors.black,
      backgroundColorIconOffset: colors.green,
      clickButtonOffset: () => addVideo(),
    };
    return isEditMode ? (
      <HeaderBackButton
        textHeader={'Edit Mode'}
        icon1="times"
        clickButton1={() => editModeOff()}
        {...sharedProps}
      />
    ) : (
      <HeaderBackButton
        icon1={'arrow-left'}
        clickButton1={() => close()}
        icon2={'text'}
        text2={'Edit'}
        backgroundColorIcon2={colors.green}
        clickButton2={() => editModeOn()}
        {...sharedProps}
      />
    );
  }
}
