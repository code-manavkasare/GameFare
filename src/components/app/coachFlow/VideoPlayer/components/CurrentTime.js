import React, {Component} from 'react';
import {Text} from 'react-native';
import {isEqual} from 'lodash';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import {displayTime} from '../../../../functions/coach';

export default class LogoutView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTime: this.props.currentTime,
      overrideStyle: {}
    };
  }
  async componentDidMount() {
    this.props.onRef(this);
  }
  setCurrentTime(currentTime) {
    this.setState({currentTime: currentTime});
  }
  getCurrentTime() {
    return this.state.currentTime;
  }
  overrideStyle(overrideStyle) {
    const {overrideStyle: prevStyle} = this.state;
    if (!isEqual(overrideStyle, prevStyle))
      this.setState({overrideStyle})
  }
  currentTime() {
    const {currentTime, overrideStyle} = this.state;
    const {style} = this.props;
    return (
      <Text style={[styleApp.textBold, {...style, ...overrideStyle, color: colors.white}]}>
        {currentTime > 0 ? displayTime(currentTime) : displayTime(0)}
      </Text>
    );
  }
  render() {
    return this.currentTime();
  }
}
