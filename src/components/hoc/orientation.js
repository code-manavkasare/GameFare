import React, {Component} from 'react';
import Orientation from 'react-native-orientation-locker';

function lockedPortrait(WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props);
      this._willFocusSubscription = this.props.navigation.addListener(
        'willFocus',
        () => Orientation.lockToPortrait(),
      );
    }
    componentWillUnmount() {
      this._willFocusSubscription.remove();
    }
    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

module.exports = {lockedPortrait};