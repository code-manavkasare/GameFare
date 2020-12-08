import React, {Component} from 'react';
import {StatusBar} from 'react-native';

import {lockOrientation} from '../functions/orientation';
import {getCurrentRoute} from '../../../NavigationService';

export default class FocusListeners extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount = () => {
    const {navigation, statusBarOnFocus} = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      lockOrientation(false);
      if (statusBarOnFocus) StatusBar.setBarStyle('light-content', true);
    });

    this.blurListener = navigation.addListener('blur', () => {
      if (statusBarOnFocus) StatusBar.setBarStyle('dark-content', true);
      const currentRoute = getCurrentRoute();
      if (currentRoute !== 'VideoPlayerPage' && currentRoute !== 'Session')
        return lockOrientation(true);

      lockOrientation(false);
    });
  };
  componentWillUnmount() {
    this.blurListener();
    this.focusListener();
  }

  render() {
    return null;
  }
}
