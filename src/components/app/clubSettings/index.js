import React, {Component} from 'react';
import {Animated, View} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import {heightFooterBooking, marginBottomApp} from '../../style/sizes';
import ScrollView from '../../layout/scrollViews/ScrollView';
import Button from '../../layout/buttons/Button';
import {
  clubSelector,
  isClubOwnerSelector,
  servicesSelector,
} from '../../../store/selectors/clubs';
import CardService from './components/CardService';
import HeaderClubSettings from './components/HeaderClubSettings';
import {rowTitle} from '../TeamPage/components/elements';
import CardMember from './components/CardMember';
import {inviteUsersToClub} from '../../functions/clubs';

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
  inviteUsersToClub = () => {
    const {route} = this.props;
    const {id: clubID} = route.params;
    inviteUsersToClub({clubID});
  };
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
    const {route, services, isClubOwner} = this.props;
    const {id: clubID} = route.params;
    if (!isClubOwner) return null;
    return (
      <View>
        {rowTitle({
          hideDividerHeader: true,
          title: isClubOwner ? 'Your Services' : 'Club Services',
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
          <CardService
            key={id}
            id={id}
            clubID={clubID}
            disableEdit={!isClubOwner}
          />
        ))}
        <View style={{marginTop: 25, marginBottom: 30}}>
          <Button
            backgroundColor="primary"
            onPressColor={colors.primaryLight}
            enabled={true}
            text={'Add a Service'}
            click={this.createService}
          />
        </View>
      </View>
    );
  };
  clubMembers = () => {
    const {club, route, isClubOwner} = this.props;
    const {id: clubID} = route.params;
    const {members: clubMembers} = club;
    if (!clubMembers) return null;
    const members = Object.keys(clubMembers).filter((m) => m !== club.owner);
    return (
      <View>
        {rowTitle({
          hideDividerHeader: true,
          title: 'Club Owner',
          titleColor: colors.greyDarker,
          titleStyle: {
            fontWeight: '800',
            fontSize: 18,
          },
          containerStyle: {
            marginBottom: -10,
            marginTop: 0,
          },
        })}
        <CardMember id={club.owner} clubID={clubID} clubOwner />
        {rowTitle({
          hideDividerHeader: true,
          title: `Members (${members.length})`,
          titleColor: colors.greyDarker,
          titleStyle: {
            fontWeight: '800',
            fontSize: 18,
          },
          containerStyle: {
            marginBottom: -10,
            marginTop: 0,
          },
        })}
        {members.map((id) => (
          <CardMember id={id} clubID={clubID} allowRemoval={isClubOwner} />
        ))}
        {isClubOwner ? (
          <View style={{marginTop: 15}}>
            <Button
              backgroundColor="greyDark"
              onPressColor={colors.greyMidDark}
              enabled={true}
              text={'Add Members'}
              click={this.inviteUsersToClub}
            />
          </View>
        ) : null}
      </View>
    );
  };
  clubSettings = () => {
    return (
      <View style={[styleApp.marginView]}>
        {this.clubTitle()}
        {this.clubServices()}
        {this.clubMembers()}
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
    const {navigation, club, isClubOwner} = this.props;
    const {title} = club.info;
    return (
      <View style={styleApp.stylePage}>
        <HeaderClubSettings
          title={title}
          navigation={navigation}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          clubID={club.id}
          isClubOwner={isClubOwner}
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
    isClubOwner: isClubOwnerSelector(state, {id}),
  };
};

export default connect(mapStateToProps)(ClubSettings);
