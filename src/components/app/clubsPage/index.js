import React, {Component} from 'react';
import {Animated, View} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import {stylePage} from '../../style/style';
import ClubsHeader from './components/ClubsHeader';

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
      <View style={stylePage}>
        <ClubsHeader
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          navigation={navigation}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps)(ClubsPage);
