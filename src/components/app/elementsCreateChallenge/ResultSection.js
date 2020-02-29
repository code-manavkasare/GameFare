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
const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';
import firebase from 'react-native-firebase';
import NavigationService from '../../../../NavigationService';

import ButtonColor from '../../layout/Views/Button';
import Button from '../../layout/buttons/Button';
import AllIcons from '../../layout/icons/AllIcons';
import colors from '../../style/colors';
import FadeInView from 'react-native-fade-in-view';
import {indexDiscussions} from '../../database/algolia';

import LinearGradient from 'react-native-linear-gradient';
import AsyncImage from '../../layout/image/AsyncImage';
import sizes from '../../style/sizes';
import styleApp from '../../style/style';

export default class Results extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  componentDidMount() {}

  async load() {}
  rowTeam(team, results) {
    const {captain} = team;
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={20} style={styleApp.center2}>
                <AsyncImage
                  style={{height: 35, width: 35, borderRadius: 20}}
                  mainImage={captain.info.picture}
                  imgInitial={captain.info.picture}
                />
              </Col>
              <Col size={60} style={styleApp.center2}>
                <Text style={styleApp.text}>
                  {captain.info.firstname} {captain.info.lastname}
                </Text>
              </Col>
              <Col size={20} style={styleApp.center3}>
                <AllIcons
                  name={
                    results.status === 'pending'
                      ? 'redo-alt'
                      : results.status === 'disputed'
                      ? 'redo-alt'
                      : 'checked'
                  }
                  color={colors.secondary}
                  size={20}
                  type="font"
                />
              </Col>
            </Row>
          );
        }}
        click={() => true}
        color="white"
        style={{
          flex: 1,
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 20,
          paddingRight: 20,
        }}
        onPressColor={colors.off}
      />
    );
  }
  async confirmResult(status, challenge) {
    const {userID, infoUser} = this.props;
    await firebase
      .database()
      .ref('challenges/' + challenge.objectID + '/results')
      .update({
        status: status,
        confirmedBy: {
          id: userID,
          info: infoUser,
          date: new Date().toString(),
        },
      });
    return NavigationService.goBack();
  }
  rowConfirmResult(challenge) {
    return (
      <Row style={{marginTop: 20}}>
        <Col size={42.5} style={styleApp.center2}>
          <Button
            backgroundColor={'red'}
            onPressColor={colors.red}
            styleButton={{height: 45}}
            disabled={false}
            text={'Dispute'}
            loader={false}
            click={() =>
              NavigationService.navigate('Alert', {
                title: 'Do you want to dispute the result?',
                textButton: 'Dispute',
                colorButton: 'red',
                onPressColor: colors.red,
                onGoBack: () => this.confirmResult('disputed', challenge),
              })
            }
          />
        </Col>
        <Col size={5} />
        <Col size={42.5} style={styleApp.center2}>
          <Button
            backgroundColor={'green'}
            onPressColor={colors.greenClick}
            styleButton={{height: 45}}
            disabled={false}
            text={'Confirm'}
            loader={false}
            click={() =>
              NavigationService.navigate('Alert', {
                title: 'Do you want to confirm the result?',
                textButton: 'Confirm',
                colorButton: 'green',
                onPressColor: colors.green,
                onGoBack: () => this.confirmResult('confirmed', challenge),
              })
            }
          />
        </Col>
      </Row>
    );
  }
  resultSection() {
    const {challenge} = this.props;
    const {results} = challenge;
    const {postedBy} = results;
    const {userID} = this.props;
    const teamWinner = Object.values(challenge.teams).filter(
      (team) => team.id === results.winner,
    )[0];
    console.log('resultd', results);
    const checkIfUserCaptain =
      Object.values(challenge.teams).filter(
        (team) => team.captain.id === userID,
      ).length !== 0;
    return (
      <View style={styleApp.viewHome}>
        <View style={styleApp.marginView}>
          <Row>
            <Col style={styleApp.center2} size={80}>
              <Text style={styleApp.text}>Challenge winner</Text>
            </Col>
          </Row>

          <View style={[styleApp.divider2, {marginBottom: 10}]} />
        </View>

        {this.rowTeam(teamWinner, results)}

        <View style={styleApp.marginView}>
          {checkIfUserCaptain &&
          postedBy.id !== userID &&
          results.status === 'pending' ? (
            this.rowConfirmResult(challenge)
          ) : results.status === 'pending' ? (
            <Text style={[styleApp.smallText, {marginTop: 10}]}>
              The captain of another team needs to confirm the result.
            </Text>
          ) : null}
        </View>
      </View>
    );
  }
  render() {
    return this.resultSection();
  }
}

const styles = StyleSheet.create({
  loader: {
    height: 20,
    borderRadius: 7,
    marginRight: 80,
    marginTop: 10,
    marginLeft: 20,
  },
});
