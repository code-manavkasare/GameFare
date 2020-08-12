import React from 'react';
import {Animated} from 'react-native';
import PropTypes from 'prop-types';
import colors from '../../../style/colors';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

export default class ShareVideoHeader extends React.Component {
  static propTypes = {
    confirmShare: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
    this.AnimatedHeaderValue = new Animated.Value(0);
  }   
  render() {
    const {
      close,
    } = this.props;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        textHeader={'Share'}
        inputRange={[0, 0]}
        initialBorderColorIcon={colors.white}
        initialBorderColorHeader={colors.borderColor}
        initialBorderWidth={0}
        initialBackgroundColor={'white'}
        initialTitleOpacity={1}
        icon1={'times'}
        clickButton1={() => close()}
      />
    );
  }
}
