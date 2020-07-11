import React, {Component} from 'react';
import Orientation from 'react-native-orientation-locker';

function lockedPortrait(WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props);
    }
    componentDidMount() {
      const {navigation} = this.props;
      this.focusListener = navigation.addListener('focus', () => {
        Orientation.lockToPortrait();
      });
    }
    // componentWillUnmount() {
    //   this.focusListener.remove();
    // }
    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

function unlocked(WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props);
    }
    componentDidMount() {
      const {navigation} = this.props;
      console.log('profile mounted', navigation);

      this.focusListener = navigation.addListener('focus', () => {
        console.log('bim focus profile');
        Orientation.unlockAllOrientations();
      });
    }
    // componentWillUnmount() {
    //   this.focusListener.remove();
    // }
    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

function lockedLandscape(WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props);
      this._willFocusSubscription = this.props.navigation.addListener(
        'willFocus',
        () => Orientation.lockToLandscape(),
      );
    }
    // componentDidMount() {
    //     Orientation.lockToPortrait();
    // }
    componentWillUnmount() {
      this._willFocusSubscription.remove();
    }
    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

module.exports = {lockedPortrait, lockedLandscape, unlocked};
