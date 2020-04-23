import {Platform, Easing, Dimensions} from 'react-native';

function timing(toValue, duration, delay) {
  if (!duration) {
    duration = 250;
  }
  return {
    toValue: toValue,
    easing: Easing.ease,
    delay: delay ? delay : 0,
    duration: duration,
  };
}

function native(toValue) {
  return {
    toValue: toValue,
    duration: 220,
    friction: 90,
    tension: 80,
    easing: Easing.ease,
    useNativeDriver: true,
    restSpeedThreshold: 3,
    restDisplacementThreshold: 0.1,
  };
}

function openStream(toValue, duration) {
  return {
    toValue: toValue,
    duration: duration ? duration : 230,
    // friction: 20,
    // tension: 50,
    easing: Easing.ease,
    useNativeDriver: true,
    // restSpeedThreshold: 3, restDisplacementThreshold:0.1
  };
}

module.exports = {timing, native, openStream};
