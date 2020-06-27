import React, {Component} from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import {connect} from 'react-redux';
import ScreenBrightness from 'react-native-screen-brightness';

class BatterySaveDimmer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeout: null,
      userBrightness: null,
      dimmed: false,
    };
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (!this.props.batterySaver && nextProps.batterySaver) {
      // battery saver mode was turned on
      this.enable();
      return true;
    } else if (this.props.batterySaver && !nextProps.batterySaver) {
      // battery saver mode was turned off
      this.disable();
      return true;
    } else if (this.state.dimmed !== nextState.dimmed) {
      // need to re-render to detect touches and brighten the screen
      return true;
    } else {
      return false;
    }
  }
  componentDidMount() {
    if (this.props.batterySaver) {
      this.enable();
    }
  }
  componentWillUnmount() {
    const { timeout, userBrightness } = this.state;
    if (timeout) {
      clearTimeout(timeout);
    }
    ScreenBrightness.setBrightness(userBrightness);
  }
  render() {
    const { batterySaver } = this.props;
    const { dimmed } = this.state;
    return batterySaver && dimmed ? (
      <TouchableOpacity activeOpacity={1.0} style={styles.fullscreen} onPress={() => this.enable()} />
    ) : null;
  }
  disable() {
    const { timeout, userBrightness } = this.state;
    if (timeout) {
      clearTimeout(timeout);
    }
    ScreenBrightness.setBrightness(userBrightness);
    this.setState(() => {return {dimmed: false, timeout: null, userBrightness: null}})
  }
  enable() {
    let { timeout, userBrightness } = this.state;
    if (timeout) {clearTimeout(timeout);}
    if (!userBrightness) {
      ScreenBrightness.getBrightness().then((brightness) => {
        this.setState(() => {return {userBrightness: brightness};});
      });
    } else {
      ScreenBrightness.setBrightness(userBrightness);
    }
    const newTimeout = setTimeout(() => {
      this.half();
    }, 60000);
    this.setState(() => {return {dimmed: false, timeout: newTimeout};});
  }
  half() {
    const { userBrightness } = this.state;
    ScreenBrightness.setBrightness(0.5 * userBrightness);
    const newTimeout = setTimeout(() => {
      this.dark();
    }, 60000);
    this.setState(() => {return {dimmed: true, timeout: newTimeout};});
  }
  dark() {
    ScreenBrightness.setBrightness(0.0);
    this.setState(() => {return {timeout: null};});
  }
};

const styles = StyleSheet.create({
  fullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

const mapStateToProps = (state) => {
  return {batterySaver: state.appSettings.batterySaver};
};

export default connect(mapStateToProps)(BatterySaveDimmer);