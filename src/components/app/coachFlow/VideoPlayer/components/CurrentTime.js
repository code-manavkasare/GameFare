import React, {Component} from 'react';
import {Text} from 'react-native';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import {displayTime} from '../../../../functions/coach';

export default class LogoutView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTime: this.props.currentTime,
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
  currentTime() {
    const {currentTime} = this.state;
    return (
      <Text style={[styleApp.textBold, {color: colors.white}]}>
        {displayTime(currentTime, true)}
      </Text>
    );
  }
  render() {
    return this.currentTime();
  }
}
