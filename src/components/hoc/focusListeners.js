import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {connect} from 'react-redux';

import {lockOrientation} from '../functions/orientation';
import {store} from '../../store/reduxStore';
import {getCurrentRoute} from '../../../NavigationService';

class focusListeners extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount = () => {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      lockOrientation(false);
      StatusBar.setBarStyle('light-content', true);
    });

    this.blurListener = navigation.addListener('blur', () => {
      StatusBar.setBarStyle('dark-content', true);
      const currentRoute = getCurrentRoute();
      if (
        currentRoute !== 'videoLibraryPage' ||
        currentRoute !== 'videoLiSessionbraryPage'
      )
        lockOrientation(true);
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

const mapStateToProps = (state, props) => {
  return {
    portrait: state.layout.currentScreenSize.portrait,
  };
};

export default connect(
  mapStateToProps,

  {},
)(focusListeners);
