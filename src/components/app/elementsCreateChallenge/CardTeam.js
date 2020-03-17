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

const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';

import Switch from '../../layout/switch/Switch';
import Button from '../../layout/buttons/Button';
import ButtonColor from '../../layout/Views/Button';
import NavigationService from '../../../../NavigationService';
import CardUserSelect from '../../layout/cards/CardUserSelect';
import AllIcons from '../../layout/icons/AllIcons';

import sizes from '../../style/sizes';
import styleApp from '../../style/style';
import colors from '../../style/colors';

class PickInfos extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {}
  removeTeam(teamID) {
    let {teams} = this.props;
    delete teams[teamID];
    this.props.setState({teams: teams});
  }
  async setCaptain(user, team) {
    let {teams} = this.props;
    await this.props.setState({
      teams: {
        ...teams,
        [team.id]: {
          ...teams[team.id],
          captain: {...user, id: user.objectID, status: 'pending'},
        },
      },
    });
    return true;
  }
  addMembers(members, team) {
    const {navigate, goBack} = NavigationService;
    let {teams, allMembers, edit} = this.props;
    navigate('PickMembers', {
      usersSelected: members,
      selectMultiple: true,
      displayCurrentUser: true,
      titleHeader: 'Add players to ' + team.name,
      onGoBack: async (members) => {
        let totalObj = {};
        const otherTeams = Object.values(teams).filter(
          (obj) => obj.id !== team.id && obj.members,
        );
        for (var j in otherTeams) {
          totalObj = {
            ...totalObj,
            ...otherTeams[j].members,
          };
        }
        const membersAlreadyInTeams = Object.values(members).filter(
          (member) => totalObj[member.objectID],
        );
        if (membersAlreadyInTeams.length !== 0) {
          let subtitle = '';
          for (var i in membersAlreadyInTeams) {
            const memberAlreadyInTeams = membersAlreadyInTeams[i];
            if (Number(i) === 0)
              subtitle =
                memberAlreadyInTeams.info.firstname +
                ' ' +
                memberAlreadyInTeams.info.lastname;
            else
              subtitle =
                subtitle +
                ', ' +
                memberAlreadyInTeams.info.firstname +
                ' ' +
                memberAlreadyInTeams.info.lastname;
          }
          subtitle = subtitle + '.';
          return navigate('Alert', {
            title:
              'The players listed below are already in teams! A player can only belong to one team.',
            subtitle: subtitle,
            close: true,
            textButton: 'Got it!',
          });
        }
        let captain = Object.values(members)[0];
        captain.id = captain.objectID;
        allMembers = {...allMembers, ...members};
        await this.props.setState({
          teams: {
            ...teams,
            [team.id]: {
              ...teams[team.id],
              members: members,
              captain: captain,
            },
          },
          allMembers: allMembers,
        });
        return goBack();
      },
    });
  }
  team(team, i) {
    let {members, captain} = team;
    if (!members) members = {};
    let {teams, edit, editable, hideButtonRemoveTeam, individual} = this.props;
    return (
      <View
        key={i}
        style={{borderColor: colors.off, borderTopWidth: editable ? 1 : 0}}>
        {!individual && (
          <Row style={styles.paddingRow}>
            <Col style={styleApp.center2} size={80}>
              {editable ? (
                <TextInput
                  style={[styleApp.text, styles.textInputTeam]}
                  clearButtonMode={'always'}
                  placeholder={'Team name'}
                  returnKeyType={'done'}
                  underlineColorAndroid="rgba(0,0,0,0)"
                  autoCorrect={true}
                  onChangeText={(text) => {
                    this.props.setState({
                      teams: {
                        ...teams,
                        [team.id]: {
                          ...teams[team.id],
                          name: text,
                        },
                      },
                    });
                  }}
                  value={team.name}
                />
              ) : (
                <Text style={styleApp.text}>• {team.name}</Text>
              )}
            </Col>

            {!hideButtonRemoveTeam && (
              <Col style={styleApp.center3} size={20}>
                <ButtonColor
                  view={() => {
                    return (
                      <AllIcons
                        name="close"
                        type={'mat'}
                        size={14}
                        color={colors.title}
                      />
                    );
                  }}
                  click={() => this.removeTeam(team.id)}
                  color={colors.off}
                  style={styles.buttonDeleteTeam}
                  onPressColor={colors.off}
                />
              </Col>
            )}
          </Row>
        )}

        {Object.values(members).map((member, i) => (
          <CardUserSelect
            user={member}
            key={i}
            captain={captain && !individual ? captain : {}}
            marginOnScrollView={true}
            userSelected={true}
            hideIcon={true}
            usersSelected={members}
            selectUser={(user) =>
              editable ? this.setCaptain(user, team) : true
            }
          />
        ))}

        {editable && (
          <ButtonColor
            view={() => {
              return (
                <Row>
                  <Col style={styleApp.center2} size={15}>
                    <View style={styles.buttonAddPlayer}>
                      <AllIcons
                        name="add"
                        type={'mat'}
                        size={16}
                        color={colors.primary}
                      />
                    </View>
                  </Col>
                  <Col style={styleApp.center2} size={85}>
                    <Text
                      style={[
                        styleApp.text,
                        {fontSize: 13, color: colors.primary},
                      ]}>
                      {Object.values(members).length === 0
                        ? 'Add players'
                        : 'Edit players'}
                    </Text>
                  </Col>
                </Row>
              );
            }}
            click={() => this.addMembers(members, team)}
            color={colors.white}
            style={styles.buttonAdd}
            onPressColor={colors.off2}
          />
        )}

        <View style={{height: 10}} />
      </View>
    );
  }
  render() {
    const {team, index} = this.props;
    return this.team(team, index);
  }
}

const styles = StyleSheet.create({
  buttonAdd: {height: 55, width: '100%', borderRadius: 4},
  buttonAddPlayer: {
    ...styleApp.center,
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: colors.off,
  },
  textInputTeam: {
    paddingLeft: 20,
    backgroundColor: colors.off2,
    borderRadius: 4,
    height: 40,
  },
  buttonDeleteTeam: {height: 30, width: 30, borderRadius: 15},
  paddingRow: {paddingTop: 10, paddingBottom: 10},
});

const mapStateToProps = (state) => {
  return {
    sports: state.globaleVariables.sports.list,
    infoUser: state.user.infoUser.userInfo,
    info: state.createChallengeData.info,
    price: state.createChallengeData.price,
  };
};

export default connect(mapStateToProps, {createChallengeAction})(PickInfos);
