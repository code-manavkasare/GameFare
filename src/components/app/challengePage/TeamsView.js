import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {groupsAction} from '../../../actions/groupsActions';
import {messageAction} from '../../../actions/messageActions';
import {subscribeToTopics} from '../../functions/notifications';
const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';
import firebase from 'react-native-firebase';
import CardUser from '../elementsEventPage/CardUser';

import ButtonColor from '../../layout/Views/Button';
import CardTeam from '../elementsCreateChallenge/CardTeam';
import AllIcons from '../../layout/icons/AllIcons';
import FadeInView from 'react-native-fade-in-view';
import PlaceHolder from '../../placeHolders/ListAttendees';
import AsyncImage from '../../layout/image/AsyncImage';
import colors from '../../style/colors';
import NavigationService from '../../../../NavigationService';

import sizes from '../../style/sizes';
import styleApp from '../../style/style';

class MembersView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  componentDidMount() {}
  cardTeam(team, i, individual) {
    return (
      <CardTeam
        team={team}
        index={i}
        individual={individual}
        editable={false}
        hideButtonRemoveTeam={true}
      />
    );
  }
  teams(teams, individual) {
    return Object.values(teams)
      .reverse()
      .map((team, i) => this.cardTeam(team, i, individual));
  }
  teamAdmin(challenge) {
    const {teams} = challenge;

    const {userID} = this.props;
    if (challenge.info.organizer === userID) return 'all';
    const teamsCaptain = Object.values(teams).filter(
      (team) => team.captain.id === userID,
    );
    if (!challenge.info.individual && teamsCaptain.length !== 0)
      return teamsCaptain[0];
    return false;
  }
  nameTeamAdmin(team) {
    if (team.name.length > 8) return team.name.slice(0, 8) + '...';
    return team.name;
  }
  membersView(challenge) {
    const {individual} = challenge.info;
    const {userID} = this.props;
    const {teams} = challenge;
    const teamAdmin = this.teamAdmin(challenge);
    return (
      <View style={[styleApp.marginView, {marginTop: 30}]}>
        <Row style={{width: '100%'}}>
          <Col size={70} style={styleApp.center2}>
            <Text style={styleApp.text}>
              {individual ? 'Players' : 'Teams'}
            </Text>
          </Col>
          <Col size={30} style={[styleApp.center3]}>
            {teamAdmin && (
              <ButtonColor
                view={() => {
                  return (
                    <Text style={[styleApp.text, {color: colors.white}]}>
                      Edit
                      {teamAdmin !== 'all' && (
                        <Text style={{fontSize: 11}}>
                          {' '}
                          ({this.nameTeamAdmin(teamAdmin)})
                        </Text>
                      )}
                    </Text>
                  );
                }}
                style={styles.buttonEdit}
                click={() => {
                  let dataEditTeams = {
                    teams: teams,
                    typeChallengeTeam: !challenge.info.individual,
                  };
                  if (challenge.info.individual)
                    dataEditTeams = {
                      oponent: Object.values(teams).filter(
                        (team) => team.captain.id !== userID,
                      )[0],
                      teams: teams,
                      typeChallengeTeam: !challenge.info.individual,
                    };
                  NavigationService.navigate('PickTeams', {
                    title: 'Edit teams',
                    objectID: challenge.objectID,
                    teamAdmin: teamAdmin,
                    dataEditTeams: dataEditTeams,
                    edit: true,
                  });
                }}
                color={colors.primary}
                onPressColor={colors.primaryLight}
              />
            )}
          </Col>
        </Row>

        <View style={[styleApp.divider2, {marginTop: 20, marginBottom: 10}]} />

        {this.teams(challenge.teams, individual)}
      </View>
    );
  }
  render() {
    const {challenge} = this.props;
    return this.membersView(challenge);
  }
}

const styles = StyleSheet.create({
  buttonEdit: {width: '100%', borderRadius: 7, height: 30},
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps, {groupsAction, messageAction})(
  MembersView,
);
