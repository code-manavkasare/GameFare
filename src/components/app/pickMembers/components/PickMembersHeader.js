import React from 'react';
import {Animated} from 'react-native';
import PropTypes from 'prop-types';
import colors from '../../../style/colors';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

export default class PickMembersHeader extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    icon1: PropTypes.string.isRequired,
    clickButton1: PropTypes.func.isRequired,
    icon2: PropTypes.string,
    text2: PropTypes.string,
    clickButton2: PropTypes.func,
    loader: PropTypes.bool,
  };
  constructor(props) {
    super(props);
    this.AnimatedHeaderValue = new Animated.Value(0);
  }   
  render() {
    const {
      title,
      icon1,
      clickButton1,
      icon2,
      text2,
      clickButton2,
      loader
    } = this.props;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        textHeader={title}
        inputRange={[0, 0]}
        initialBorderColorIcon={colors.white}
        initialBorderColorHeader={colors.borderColor}
        initialBorderWidth={0}
        initialBackgroundColor={'white'}
        initialTitleOpacity={1}
        icon1={icon1}
        clickButton1={() => clickButton1()}
        icon2={icon2}
        text2={text2}
        clickButton2={async () => clickButton2()}
        loader={loader}
      />
    );
  }
}
