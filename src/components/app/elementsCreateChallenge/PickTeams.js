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
import {createChallengeAction} from '../../../actions/createChallengeActions';
import firebase from 'react-native-firebase';
import Slider from '@react-native-community/slider';
import SwitchSelector from 'react-native-switch-selector';
import FadeInView from 'react-native-fade-in-view';

const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';

import Switch from '../../layout/switch/Switch';
import Button from '../../layout/buttons/Button';
import ButtonColor from '../../layout/Views/Button';
import CardTeam from './CardTeam';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';

import ScrollView from '../../layout/scrollViews/ScrollView';
import CardUserSelect from '../../layout/cards/CardUserSelect';
import {generateID} from '../../functions/createEvent';

import sizes from '../../style/sizes';
import styleApp from '../../style/style';
import colors from '../../style/colors';

class PickInfos extends Component {
  constructor(props) {
    super(props);
    this.state = {
      typeChallengeTeam: false,
      oponent: {},
      allMembers: {},
      teams: {},
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    const {route} = this.props;
    const {edit, dataEditTeams, teamAdmin} = route.params;

    if (edit) {
      let teams = dataEditTeams.teams;
      if (!teams) teams = {};
      teams = Object.values(teams)
        .reverse()
        // .slice(0, 1)
        .filter((team) => team.id === teamAdmin.id || teamAdmin === 'all')
        .reduce(function(result, item) {
          result[item.id] = item;
          return result;
        }, {});
      dataEditTeams.teams = teams;
      this.setState(dataEditTeams);
    }
  }
  switch(textOn, textOff, state, click) {
    return (
      <Switch
        textOn={textOn}
        textOff={textOff}
        finalColorOn={colors.primary}
        translateXTo={width / 2 - 20}
        height={50}
        state={state}
        setState={(val) => click(val)}
      />
    );
  }
  addTeam(currentTeams, edit) {
    const idNewTeam = generateID();
    const numberTeam = Object.values(currentTeams).length + 1;
    this.setData(
      {
        teams: {
          ...currentTeams,
          [idNewTeam]: {
            id: idNewTeam,
            name: 'Team ' + numberTeam,
            createdAt: Number(new Date()),
          },
        },
      },
      edit,
    );
  }
  addOponentAlert(oponent) {
    const {navigate} = this.props.navigation;
    const {route} = this.props;
    const {edit} = route.params;
    return navigate('PickMembers', {
      titleHeader: 'Pick your oponent',
      displayCurrentUser: false,
      usersSelected: oponent.captain
        ? {[oponent.captain.id]: oponent.captain}
        : {},
      onGoBack: async (user) => {
        await this.setData(
          {
            oponent: {
              captain: {...user, id: user.objectID},
              members: {
                [user.objectID]: {...user, id: user.objectID},
              },
            },
          },
          edit,
        );
        return this.props.navigation.navigate('PickTeams');
      },
    });
  }
  cardTeam(team, i, teams, allMembers, edit, hideButtonRemoveTeam) {
    return (
      <CardTeam
        team={team}
        index={i}
        hideButtonRemoveTeam={hideButtonRemoveTeam}
        teams={teams}
        edit={edit}
        editable={true}
        allMembers={allMembers}
        setState={(nextState) => this.setData(nextState, edit)}
      />
    );
  }
  teamsSections(data, edit, hideButtonRemoveTeam) {
    const {teams, allMembers} = data;
    return Object.values(teams)
      .sort(function(a, b) {
        return a.createdAt - b.createdAt;
      })
      .map((team, i) =>
        this.cardTeam(team, i, teams, allMembers, edit, hideButtonRemoveTeam),
      );
  }
  async setData(data, edit) {
    if (edit) await this.setState(data);
    else await this.props.createChallengeAction('setTeamsData', data);
    return true;
  }
  pickTeams(data, edit) {
    const {typeChallengeTeam, oponent, allMembers} = data;
    const {route} = this.props;
    const {teamAdmin} = route.params;
    return (
      <View style={styleApp.marginView}>
        {teamAdmin === 'all' &&
          this.switch(
            'Individual',
            'Teams',
            data['typeChallengeTeam'],
            async (val) => {
              await this.setData({typeChallengeTeam: val}, edit);
              return true;
            },
          )}

        {typeChallengeTeam ? (
          <FadeInView duration={300} style={{paddingTop: 20}}>
            {this.teamsSections(data, edit, !(teamAdmin === 'all'))}
            <View
              style={[styleApp.divider2, {marginBottom: 0, marginTop: 5}]}
            />
            <ButtonColor
              view={() => {
                return <Text style={styleApp.text}>Add team</Text>;
              }}
              click={() => this.addTeam(data.teams, edit)}
              color={'white'}
              style={[{height: 55}]}
              onPressColor={colors.off}
            />
          </FadeInView>
        ) : (
          <FadeInView duration={300} style={{paddingTop: 20}}>
            {oponent.captain && (
              <CardUserSelect
                marginOnScrollView={true}
                user={oponent.captain}
                hideIcon={true}
                selectUser={() => true}
                selectedUsers={{[oponent.captain.id]: oponent.captain}}
              />
            )}
            <View
              style={[styleApp.divider2, {marginBottom: 0, marginTop: 0}]}
            />
            <ButtonColor
              view={() => {
                return (
                  <Text style={styleApp.text}>
                    {oponent.captain ? 'Edit opponent' : 'Add opponent'}
                  </Text>
                );
              }}
              click={() => this.addOponentAlert(oponent)}
              color={'white'}
              style={[{height: 55}]}
              onPressColor={colors.off}
            />
          </FadeInView>
        )}
      </View>
    );
  }
  conditionOn(data) {
    if (!data.typeChallengeTeam) return true;
    if (data.typeChallengeTeam && Object.values(data.teams).length === 0)
      return false;
    return true;
  }
  textButton(data, edit) {
    if (edit) return 'Save';
    if (!data.typeChallengeTeam && !data.oponent.captain) return 'Skip';
    return 'Next';
  }
  async saveEdit() {
    await this.setState({loader: true});
    const {typeChallengeTeam, teams, oponent} = this.state;
    const {userID, infoUser, route} = this.props;
    const {teamAdmin, objectID} = route.params;

    let newTeams = {};
    if (typeChallengeTeam) newTeams = teams;
    else {
      const idTeamOponent = generateID();
      const idTeamUser = generateID();

      newTeams = {
        [idTeamOponent]: {
          ...oponent,
          id: idTeamOponent,
          objectID: idTeamOponent,
        },
        [idTeamUser]: {
          id: idTeamUser,
          captain: {
            id: userID,
            info: infoUser,
          },
          members: {
            [userID]: {
              id: userID,
              objectID: userID,
              info: infoUser,
            },
          },
        },
      };
    }

    if (teamAdmin === 'all') {
      let updates = {};
      updates[`challenges/${objectID}`] = {teams: newTeams};
      updates[`challenges/${objectID}/info`] = {individual: !typeChallengeTeam};
      await firebase
        .database()
        .ref()
        .update(updates);
    } else {
      await firebase
        .database()
        .ref('challenges/' + objectID + '/teams/' + teamAdmin.id)
        .update(Object.values(newTeams)[0]);
    }

    await this.setState({loader: false});
    return this.props.navigation.goBack();
  }
  render() {
    const {route} = this.props;
    const {edit, title} = route.params;
    if (edit) var teamsData = this.state;
    else var teamsData = this.props.teamsData;

    const {dismiss, goBack, navigate} = this.props.navigation;
    return (
      <View style={[styleApp.stylePage]}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={title}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1="arrow-left"
          icon2={null}
          clickButton1={() => (edit ? goBack() : dismiss())}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.pickTeams(teamsData, edit)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={180}
          showsVerticalScrollIndicator={true}
        />

        <View style={[styleApp.footerBooking, styleApp.marginView]}>
          <Button
            text={this.textButton(teamsData, edit)}
            backgroundColor={'green'}
            onPressColor={colors.greenLight}
            disabled={!this.conditionOn(teamsData)}
            loader={this.state.loader}
            click={() => (edit ? this.saveEdit() : navigate('PickInfos'))}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonAdd: {height: 40, width: '100%', borderRadius: 4},
});

const mapStateToProps = (state) => {
  return {
    sports: state.globaleVariables.sports.list,
    infoUser: state.user.infoUser.userInfo,
    teamsData: state.createChallengeData.teamsData,
    userID: state.user.userID,
  };
};

export default connect(
  mapStateToProps,
  {createChallengeAction},
)(PickInfos);
