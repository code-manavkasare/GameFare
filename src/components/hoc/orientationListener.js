import React from 'react';
import {Dimensions} from 'react-native';
import {connect} from 'react-redux';
import {layoutAction} from '../../actions/layoutActions';
const {height, width} = Dimensions.get('screen');

import Orientation from 'react-native-orientation-locker';

class OrientationListener extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialOrientationPortrait: true,
    };
  }
  async componentDidMount() {
    const initialOrientation = Orientation.getInitialOrientation();

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
  setScreenOrientation = (orientation) => {
    var portrait = true;
    if (orientation === 'LANDSCAPE-LEFT' || orientation === 'LANDSCAPE-RIGHT') {
      portrait = false;
    }
    const {currentHeight, currentWidth} = this.currentScreenSize(portrait);
    const {layoutAction} = this.props;
    layoutAction('setLayout', {
      currentScreenSize: {currentHeight, currentWidth, portrait},
    });
  };
  render() {
    return null;
  }
}

const mapStateToProps = (state) => {
  return {};
};

export default connect(
  mapStateToProps,
  {layoutAction},
)(OrientationListener);
