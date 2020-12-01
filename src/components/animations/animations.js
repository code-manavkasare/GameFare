import {Easing} from 'react-native';
import Animated, {Easing as ReanimatedEasing} from 'react-native-reanimated';
const {
  set,
  cond,
  startClock,
  stopClock,
  clockRunning,
  block,
  timing,
  Value,
  Clock,
} = Animated;

function timingAnimation(toValue, duration, delay) {
  if (!duration) {
    duration = 250;
  }
  return {
    toValue: toValue,
    easing: Easing.ease,
    delay: delay ? delay : 0,
    duration: duration,
    useNativeDriver: false,
  };
}

function native(toValue, duration, delay, easing) {
  return {
    toValue: toValue,
    duration: duration ? duration : 220,
    delay: delay ? delay : 0,
    friction: 90,
    tension: 80,
    easing: easing ? easing : Easing.inOut(Easing.cubic),
    useNativeDriver: true,
    restSpeedThreshold: 3,
    restDisplacementThreshold: 0.1,
  };
}

function openStream(toValue, duration) {
  return {
    toValue: toValue,
    duration: duration ? duration : 230,
    easing: Easing.ease,
    useNativeDriver: true,
  };
}

function reanimatedTiming({from, to, duration}) {
  let clock = new Clock();
  const config = {
    toValue: new Value(to),
    easing: ReanimatedEasing.inOut(ReanimatedEasing.cubic),
    duration: duration ? duration : 220,
  };
  const state = {
    position: new Value(from),
    finished: new Value(0),
    frameTime: new Value(0),
    time: new Value(0),
  };
  return block([
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.time, 0),
      set(state.position, from),
      set(state.frameTime, 0),
      set(config.toValue, to),
      startClock(clock),
    ]),
    timing(clock, state, config),
    cond(state.finished, stopClock(clock)),
    state.position,
  ]);
}

module.exports = {
  timing: timingAnimation,
  native,
  openStream,
  reanimatedTiming,
};
