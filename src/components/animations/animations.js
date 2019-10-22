
import {
  Platform,
  Easing,
  Dimensions,
} from 'react-native';

function timing(toValue,duration) {
  if (duration == undefined) {
    duration = 250
  }
  return {
    toValue:toValue,
    easing: Easing.ease,
    duration:duration,
  }
}

function native(toValue) {
  return {
    toValue:toValue,
    duration:220,
    friction: 90,
    tension: 80,
    easing: Easing.ease,
    useNativeDriver: true,
    restSpeedThreshold: 3, restDisplacementThreshold:0.1
  }
}



module.exports = {timing,native};