import React, {Component} from 'react';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import colors from '../../../style/colors';

export default class HeaderClubSettings extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      branchLink: null,
      loader: false,
    };
  }
  render() {
    const {loader} = this.state;
    const {navigation, title, AnimatedHeaderValue} = this.props;
    return (
      <HeaderBackButton
        marginTop={10}
        AnimatedHeaderValue={AnimatedHeaderValue}
        textHeader={title}
        inputRange={[10, 20]}
        initialBorderColorIcon={'transparent'}
        initialBackgroundColor={'transparent'}
        initialTitleOpacity={0}
        initialBorderWidth={1}
        initialBorderColorHeader={'transparent'}
        icon2={'times'}
        clickButton2={navigation.goBack}
        loader={loader}
        colorLoader={colors.title}
      />
    );
  }
}
