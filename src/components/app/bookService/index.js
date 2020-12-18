import React, {Component} from 'react';
import {Animated, View} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import {heightFooterBooking, marginBottomApp} from '../../style/sizes';
import ScrollView from '../../layout/scrollViews/ScrollView';
import {clubSelector, servicesSelector} from '../../../store/selectors/clubs';
import CardService from '../clubSettings/components/CardService';
import HeaderBookService from './components/HeaderBookService';
import {rowTitle} from '../TeamPage/components/elements';

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
  clubTitle = () => {
    const {club} = this.props;
    const {title} = club.info;
    return rowTitle({
      hideDividerHeader: true,
      title,
      titleColor: colors.greyDarker,
      titleStyle: {
        fontWeight: '800',
        fontSize: 23,
      },
      containerStyle: {
        marginBottom: 0,
        marginTop: 0,
      },
    });
  };
  clubServices = () => {
    const {route, services} = this.props;
    const {id: clubID} = route.params;
    return (
      <View>
        {rowTitle({
          hideDividerHeader: true,
          title: 'Club Services',
          titleColor: colors.greyDarker,
          titleStyle: {
            fontWeight: '800',
            fontSize: 18,
          },
          containerStyle: {
            marginBottom: -25,
            marginTop: 0,
          },
        })}
        {services.map(({id}) => (
          <CardService key={id} id={id} clubID={clubID} disableEdit />
        ))}
      </View>
    );
  };
  clubSettings = () => {
    return (
      <View style={[styleApp.marginView]}>
        {this.clubTitle()}
        {this.clubServices()}
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
  render() {
    const {navigation, club} = this.props;
    const {title} = club.info;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBookService
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
          marginTop={-15}
          offsetBottom={heightFooterBooking + marginBottomApp + 50}
          showsVerticalScrollIndicator={true}
        />
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
