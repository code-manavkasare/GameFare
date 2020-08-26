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
      route,
      isDrawingEnabled,
      setState,
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
      sizeIcon1: 16,
      colorIcon1: colors.white,
      typeIcon1: 'font',

      backgroundColorIconOffset: colors.title + '70',
      colorIcon2: colors.white,

      iconOffset: !isEditMode && !coachSessionID && 'text',
      textOffset: 'Edit',
      clickButtonOffset: () => editModeOn(),
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
        colorIconOffset={colors.white}
        backgroundColorIcon2={colors.title + '70'}
        icon2={isEditMode || isRecording || isPreviewing ? null : 'plus'}
        colorIcon2={colors.white}
        clickButton2={() => addVideo()}
        {...sharedProps}
        icon11={'open-with'}
        colorIcon11={colors.white}
        typeIcon11={'mat'}
        backgroundColorIcon11={
          !isDrawingEnabled ? colors.secondary : colors.title + '70'
        }
        sizeIcon11={19}
        clickButton11={() => setState({isDrawingEnabled: false})}
        icon12={'gesture'}
        colorIcon12={colors.white}
        typeIcon12={'mat'}
        sizeIcon12={19}
        backgroundColorIcon12={
          isDrawingEnabled ? colors.secondary : colors.title + '70'
        }
        clickButton12={() => setState({isDrawingEnabled: true})}
      />
    );
  }
}
