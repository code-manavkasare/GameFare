import React, {Component} from 'react';
import {InteractionManager} from 'react-native';
import {Dimensions} from 'react-native';
import Orientation from 'react-native-orientation-locker';

import {timeout} from './coach';

const msp = (dim, limit) => {
  return dim.scale * dim.width >= limit || dim.scale * dim.height >= limit;
};

/**
 * Returns true if the screen is in portrait mode
 */
const isPortrait = () => {
  const dim = Dimensions.get('screen');
  return dim.height >= dim.width;
};

/**
 * Returns true of the screen is in landscape mode
 */
const isLandscape = () => {
  const dim = Dimensions.get('screen');
  return dim.width >= dim.height;
};

/**
 * Returns true if the device is a tablet
 */
const isTablet = () => {
  const dim = Dimensions.get('screen');
  return (
    (dim.scale < 2 && msp(dim, 1000)) || (dim.scale >= 2 && msp(dim, 1900))
  );
};

/**
 * Returns true if the device is a phone
 */
const isPhone = () => {
  return !isTablet();
};

const lockOrientation = (lock) => {
  InteractionManager.runAfterInteractions(async () => {
    await timeout(600);
    if (lock) Orientation.lockToPortrait();
    else Orientation.unlockAllOrientations();
  });
};

export {isPortrait, isLandscape, isTablet, isPhone, lockOrientation};
