import React from 'react';
import {Animated, StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import ButtonColor from '../../../../../layout/Views/Button';
import {Col, Row, Grid} from 'react-native-easy-grid';

import colors from '../../../../../style/colors';
import styleApp from '../../../../../style/style';
import AllIcons from '../../../../../layout/icons/AllIcons';
import {timeout} from '../../../../../functions/coach';
import {timing} from '../../../../../animations/animations';

export default class ControlButtonsRecording extends React.Component {
  static propTypes = {};
  constructor(props) {
    super(props);
    this.state = {};
    this.opacityButton = new Animated.Value(1);
  }
  componentDidMount = async () => {
    await timeout(1000);
    Animated.timing(this.opacityButton, timing(0, 300)).start();
  };
  componentDidUpdate = (prevProps, prevState) => {
    if (
      prevProps.displayButtonReplay !== this.props.displayButtonReplay &&
      this.props.displayButtonReplay
    )
      return Animated.timing(this.opacityButton, timing(1, 300)).start();
  };
  onPress = async () => {
    if (this.opacityButton._value === 1) {
      const {replay, displayButtonReplay, pressPause, setState} = this.props;

      // if (displayButtonReplay) {
      //   await setState({isPlayingReview: true});
      //   replay();
      //   return Animated.timing(this.opacityButton, timing(0, 300)).start();
      // }

      await setState({isPlayingReview: true});
      replay();
      return Animated.timing(this.opacityButton, timing(0, 300)).start();

      pressPause();
      await timeout(1000);
      Animated.timing(this.opacityButton, timing(0, 300)).start();
    } else {
      Animated.timing(this.opacityButton, timing(1, 300)).start();
    }
  };
  toggleOpacity = () => {
    Animated.timing(
      this.opacityButton,
      timing(this.opacityButton._value === 0 ? 1 : 0, 300),
    ).start();
  };
  render() {
    const {displayButtonReplay, isPlayingReview} = this.props;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => this.toggleOpacity()}
        style={[
          styleApp.fullSize,
          styleApp.center,
          {position: 'absolute', zIndex: 10},
        ]}>
        <Animated.View style={[styles.button, {opacity: this.opacityButton}]}>
          <TouchableOpacity
            style={[styleApp.fullSize, styleApp.center]}
            activeOpacity={0.8}
            onPress={() => this.onPress()}>
            {/* {displayButtonReplay ? (
              <AllIcons
                name="undo-alt"
                type="font"
                size={30}
                color={colors.white}
              />
            ) : isPlayingReview ? (
              <AllIcons
                name="pause"
                type="font"
                size={30}
                color={colors.white}
              />
            ) : (
              <AllIcons
                name="play"
                type="font"
                size={30}
                color={colors.white}
              />
            )} */}
            <AllIcons
              name="undo-alt"
              type="font"
              size={30}
              color={colors.white}
            />
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    height: 90,
    width: 90,
    borderRadius: 45,
    backgroundColor: colors.title + '60',
  },
});
