import React, {Component} from 'react';
import {Animated, View, Text, TextInput, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import {
  heightFooterBooking,
  heightHeaderModal,
  marginBottomApp,
} from '../../style/sizes';
import ScrollView from '../../layout/scrollViews/ScrollView';
import Button from '../../layout/buttons/Button';
import {clubSelector, servicesSelector} from '../../../store/selectors/clubs';
import CardService from './components/CardService';
import HeaderClubSettings from './components/HeaderClubSettings';

class ClubSettings extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  clubSettings = () => {
    const {route, services} = this.props;
    const {id: clubID} = route.params;
    return (
      <View style={[styleApp.marginView]}>
        {services.map(({id}) => (
          <CardService key={id} id={id} clubID={clubID} />
        ))}
      </View>
    );
  };
  createService = () => {
    const {route, navigation} = this.props;
    const {id} = route.params;
    navigation.navigate('Club', {
      screen: 'CreateService',
      params: {id},
    });
  };
  confirmButton = () => {
    return (
      <View style={[styleApp.footerModal, styleApp.marginView]}>
        <Button
          backgroundColor="primary"
          onPressColor={colors.primaryLight}
          enabled={true}
          text={'Add a Service'}
          click={this.createService}
        />
      </View>
    );
  };
  render() {
    const {navigation, club} = this.props;
    const {title} = club.info;
    return (
      <View style={styleApp.stylePage}>
        <HeaderClubSettings
          title={title}
          navigation={navigation}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          clubID={club.id}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.clubSettings}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={heightHeaderModal}
          offsetBottom={heightFooterBooking + marginBottomApp + 50}
          showsVerticalScrollIndicator={true}
        />
        {this.confirmButton()}
      </View>
    );
  }
}

const mapStateToProps = (state, props) => {
  const {id} = props.route.params;
  return {
    club: clubSelector(state, {id}),
    services: servicesSelector(state, {id}),
  };
};

export default connect(mapStateToProps)(ClubSettings);