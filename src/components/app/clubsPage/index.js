import React, {Component} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import styleApp from '../../style/style';
import ClubsHeader from './components/ClubsHeader';
import {
  userConnectedSelector,
  userInfoSelector,
} from '../../../store/selectors/user';

class ClubsPage extends Component {
  static propTypes = {
    navigation: PropTypes.object,
    infoUser: PropTypes.object,
    userConnected: PropTypes.bool,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  render() {
    const {navigation} = this.props;
    return (
      <View style={styleApp.stylePage}>
        <ClubsHeader
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          navigation={navigation}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  return {
    infoUser: userInfoSelector(state),
    userConnected: userConnectedSelector(state),
  };
};

export default connect(mapStateToProps)(ClubsPage);
