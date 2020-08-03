import React, {Component} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';

import ButtonColor from '../../../layout/Views/Button';
import AllIcons from '../../../layout/icons/AllIcons';
import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import {native} from '../../../animations/animations';

import RecordButton from './RecordButton';

export default class BottomButtons extends Component {
  static propTypes = {
    addFlag: PropTypes.func.isRequired,
    startRecording: PropTypes.func.isRequired,
    stopRecording: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
        isRecording: false,
        renderFlagButton: false,
    }
    this.animatedFlagButtonValue = new Animated.Value(0);
  }
  flagButtonAnimation() {
    const {isRecording, renderFlagButton} = this.state;
    if (isRecording) {
      Animated.timing(this.animatedFlagButtonValue, native(1, 300)).start();
    } else if (renderFlagButton) {
      Animated.timing(this.animatedFlagButtonValue, native(0, 300)).start(() => {
        this.setState({renderFlagButton: false});
      });
    }
  }
  flagButton() {
    const {renderFlagButton} = this.state;
    const {addFlag} = this.props;
    if (renderFlagButton) {
      const translateX = this.animatedFlagButtonValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -90],
      });
      return (
        <Animated.View height={55}style={[
          styles.flagButton,
          {
            transform: [{translateX: translateX}],
            opacity: this.animatedFlagButtonValue
          }
        ]}>
          <ButtonColor
              view={() => {
                return (
                  <AllIcons
                      type={'font'}
                      color={colors.white}
                      size={18}
                      name={'flag'}
                  />
                );
              }}
              style={{width: 55}}
              color={colors.title + '70'}
              click={() => addFlag()}
              onPressColor={colors.white + '70'}
          />
        </Animated.View>
      );
    } else {
      return null;
    }
  }
  startRecording() {
    const {startRecording} = this.props;
    startRecording();
    this.setState({renderFlagButton: true, isRecording: true});
  }
  stopRecording() {
    const {stopRecording} = this.props;
    stopRecording();
    this.setState({isRecording: false});
  }
  render() {
    this.flagButtonAnimation();
    return (
      <View style={[styleApp.center, styleApp.fullSize]}>
          {this.flagButton()}
          <RecordButton
            startRecording={() => this.startRecording()}
            stopRecording={() => this.stopRecording()}
          />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  flagButton: {
    ...styleApp.center,
    position: 'absolute',
    bottom: 8,
    height: 55,
    width: 55,
    zIndex:2,
    borderRadius: 27.5,
    overflow:'hidden'
  }
});
