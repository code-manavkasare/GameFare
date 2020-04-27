import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  TextInput,
} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';
import ButtonColor from '../../layout/Views/Button';
import Button from '../../layout/buttons/Button';
import AsyncImage from '../../layout/image/AsyncImage';

import ScrollView from '../../layout/scrollViews/ScrollView';
import AllIcons from '../../layout/icons/AllIcons';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import CardUserSelect from '../../layout/cards/CardUserSelect';

import sizes from '../../style/sizes';
import colors from '../../style/colors';
import styleApp from '../../style/style';

class PublishResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      winnerID: false,
      scrore: '',
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  rowTeam(team, i, challenge) {
    const {winnerID} = this.state;
    let user = {
      id: team.id,
      objectID: team.id,
      info: {
        firstname: team.name,
        lastname: '',
      },
    };
    if (challenge.info.individual)
      user = {...team.captain, objectID: team.captain.id};
    return (
      <CardUserSelect
        marginOnScrollView={true}
        user={user}
        key={i}
        // captain={{}}
        hideIcon={false}
        selectUser={(val, user, selectedUsers) => {
          this.setState({winnerID: user.id});
        }}
        usersSelected={{
          [winnerID]: {
            id: winnerID,
          },
        }}
      />
    );
  }
  score() {
    const {score} = this.state;
    return (
      <TextInput
        style={styleApp.input}
        placeholder="Additional information, score... (optional)"
        returnKeyType={'done'}
        ref={(input) => {
          this.instructionInput = input;
        }}
        underlineColorAndroid="rgba(0,0,0,0)"
        autoCorrect={true}
        multiline={true}
        numberOfLines={6}
        blurOnSubmit={true}
        placeholderTextColor={colors.grey}
        onChangeText={(text) => this.setState({score: text})}
        value={score}
      />
    );
  }
  publishResultContent(challenge) {
    const {teams} = challenge;
    return (
      <View style={styleApp.marginView}>
        <Text style={[styleApp.title, {marginBottom: 15}]}>
          Who won the challenge?
        </Text>

        {Object.values(teams).map((team, i) =>
          this.rowTeam(team, i, challenge),
        )}

        <View style={styleApp.divider2} />
        {this.score()}
      </View>
    );
  }
  async submitResult(challenge) {
    const {goBack} = this.props.navigation;
    const {userID, infoUser} = this.props;
    const {objectID} = challenge;
    const {winnerID, score} = this.state;
    await this.setState({loader: true});
    await database()
      .ref('challenges/' + objectID + '/results')
      .update({
        winner: winnerID,
        score: score,
        date: new Date().toString(),
        status: 'pending',
        postedBy: {id: userID, info: infoUser},
      });
    await this.setState({loader: false});
    return goBack();
  }
  conditionOn() {
    if (this.state.winnerID) return false;
    return true;
  }
  render() {
    const {navigate, goBack} = this.props.navigation;
    const {route} = this.props;
    const {challenge} = route.params;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          icon1="arrow-left"
          initialTitleOpacity={1}
          icon2={null}
          clickButton1={() => goBack()}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.publishResultContent(challenge)}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={false}
        />

        <View style={[styleApp.footerBooking, styleApp.marginView]}>
          <Button
            text="Confirm result"
            backgroundColor={'green'}
            onPressColor={colors.greenLight}
            disabled={this.conditionOn()}
            loader={this.state.loader}
            click={() => this.submitResult(challenge)}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  placeHolderImage: {
    height: 120,
    backgroundColor: colors.off2,
    borderBottomWidth: 1,
    borderColor: colors.off,
  },
  viewImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 20,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
  };
};

export default connect(
  mapStateToProps,
  {},
)(PublishResult);
