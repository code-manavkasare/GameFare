import {Platform, Easing, Dimensions} from 'react-native';

function timing(toValue, duration) {
  if (!duration) {
    duration = 250;
  }
  return {
    toValue: toValue,
    easing: Easing.ease,
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

function openStream(toValue) {
  return {
    toValue: toValue,
    duration: 170,
    friction: 160,
    tension: 190,
    easing: Easing.ease,
    useNativeDriver: true,
    // restSpeedThreshold: 3, restDisplacementThreshold:0.1
  };
}

module.exports = {timing, native, openStream};
