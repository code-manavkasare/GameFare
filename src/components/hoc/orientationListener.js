import React from 'react';
import {Dimensions} from 'react-native';

import {store} from '../../store/reduxStore';
import {layoutAction} from '../../store/actions/layoutActions';
const {height, width} = Dimensions.get('screen');

import Orientation from 'react-native-orientation-locker';

export default class OrientationListener extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialOrientationPortrait: true,
    };
  }
  async componentDidMount() {
    Orientation.lockToPortrait();
    const initialOrientation = 'PORTRAIT';
    await this.setInitialOrientation(initialOrientation);
    this.setScreenOrientation(initialOrientation);
    Orientation.addOrientationListener(this._onOrientationDidChange);
  }
  setInitialOrientation = async (initialOrientation) => {
    let portrait = true;
    if (
      initialOrientation === 'LANDSCAPE-LEFT' ||
      initialOrientation === 'LANDSCAPE-RIGHT'
    ) {
      portrait = false;
    }
    await this.setState({initialOrientationPortrait: portrait});
    return true;
  };
  componentWillUnmount = () => {
    Orientation.removeOrientationListener(this._onOrientationDidChange);
  };
  _onOrientationDidChange = (orientation) => {
    this.setScreenOrientation(orientation);
  };
  currentScreenSize = (portrait) => {
    const {initialOrientationPortrait} = this.state;
    if (initialOrientationPortrait) {
      if (portrait)
        return {
          currentWidth: width,
          currentHeight: height,
        };
      return {
        currentWidth: height,
        currentHeight: width,
      };
    }
    if (portrait)
      return {
        currentWidth: height,
        currentHeight: width,
      };
    return {
      currentWidth: width,
      currentHeight: height,
    };
  };
  setScreenOrientation = (orientationIn) => {
    var portrait = true;
    var orientation =
      orientationIn === 'LANDSCAPE-LEFT'
        ? 'landscapeLeft'
        : orientationIn === 'LANDSCAPE-RIGHT'
        ? 'landscapeRight'
        : orientationIn === 'PORTRAIT'
        ? 'portrait'
        : orientationIn === 'PORTRAIT-UPSIDE-DOWN'
        ? 'portraitUpsideDown'
        : undefined;
    if (
      orientationIn === 'LANDSCAPE-LEFT' ||
      orientationIn === 'LANDSCAPE-RIGHT'
    ) {
      portrait = false;
    }
    const {currentHeight, currentWidth} = this.currentScreenSize(portrait);
    store.dispatch(
      layoutAction('setLayout', {
        currentScreenSize: {currentHeight, currentWidth, portrait, orientation},
      }),
    );
  };
  render() {
    return null;
  }
}
