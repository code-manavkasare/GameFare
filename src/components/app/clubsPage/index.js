import React, {Component} from 'react';
import {Animated, View, Text} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import styleApp from '../../style/style';
import ClubsHeader from './components/ClubsHeader';
import {userClubsSelector} from '../../../store/selectors/clubs';
import CardClub from './components/CardClub';

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
    const {navigation, clubs} = this.props;
    return (
      <View style={styleApp.stylePage}>
        <ClubsHeader
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          navigation={navigation}
        />

        <Text
          style={{marginTop: 200}}
          onPress={() => navigation.navigate('CreateClub')}>
          Create a club
        </Text>

        {clubs.map(({id}) => (
          <CardClub key={id} id={id} />
        ))}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    clubs: userClubsSelector(state),
  };
};

export default connect(mapStateToProps)(ClubsPage);
