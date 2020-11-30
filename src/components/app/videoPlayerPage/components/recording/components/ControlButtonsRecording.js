import React from 'react';
import {Animated, StyleSheet, TouchableOpacity} from 'react-native';

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
    this.toggleOpacity();
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
      const {replay, setState} = this.props;
      await setState({isPlayingReview: true});
      replay();
    }
    this.toggleOpacity();
  };
  toggleOpacity = () => {
    const {clickVideo} = this.props;
    Animated.timing(
      this.opacityButton,
      timing(this.opacityButton._value === 0 ? 1 : 0, 100),
    ).start();
    if (clickVideo) clickVideo();
  };
  render() {
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
            onPress={this.onPress}>
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
