import React, {Component} from 'react';
import {Animated, View} from 'react-native';
import {connect} from 'react-redux';
import {object, bool} from 'prop-types';

import styleApp from '../../style/style';
import ClubsHeader from './components/ClubsHeader';

class ClubsPage extends Component {
  static propTypes = {
    navigation: object,
    infoUser: object,
    userConnected: bool,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      currentClub: undefined,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  changeFocusedClub = (clubID) => {
    console.log(clubID);
    this.setState({currentClub: clubID});
  };
  render() {
    const {navigation} = this.props;
    return (
      <View style={styleApp.stylePage}>
        <ClubsHeader
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          navigation={navigation}
          selectClub={this.changeFocusedClub}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps)(ClubsPage);
