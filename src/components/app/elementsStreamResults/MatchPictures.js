import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Row, Col} from 'react-native-easy-grid';

const {height, width} = Dimensions.get('screen');

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import ScrollView from '../../layout/scrollViews/ScrollView2';
import ButtonColor from '../../layout/Views/Button';
import AsyncImage from '../../layout/image/AsyncImage';
import AddPlayers from './AddPlayers';

import {saveStreamResultsMatches} from '../../functions/streaming';

class MatchPictures extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playerIndex: 0,
      matches: null, // matches is a dictionary of {userID: [playerInfo]}
      done: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  async componentDidMount() {
    const stream = this.props.navigation.getParam('stream');
    // there are partial matches completed for this stream
    if (stream.liveballResults && stream.liveballResults.matches) {
      const keys = Object.keys(stream.liveballResults.matches);
      let index = 0;
      for (const key of keys) {
        index = index + stream.liveballResults.matches[key].length;
      }
      await this.setState({matches: stream.liveballResults.matches, playerIndex: index});
    }
  }

  next() {
    const stream = this.props.navigation.getParam('stream');
    const event = this.props.navigation.getParam('event');
    let numPlayers = Object.values(stream.liveballResults.players).length;
    if (this.state.playerIndex === numPlayers - 1) {
      saveStreamResultsMatches(stream, this.state.matches, true);
      this.goToResults(event, stream);
    } else {
      saveStreamResultsMatches(stream, this.state.matches, false);
      this.setState({playerIndex: this.state.playerIndex + 1});
    }
  }

  matchCurrentImage(userID) {
    let matches = {};
    if (!this.state.matches) {
      matches[userID] = [this.state.playerIndex];
    } else {
      matches = Object.assign(this.state.matches);
      let selected = matches[userID];
      if (!selected) {
        matches[userID] = [this.state.playerIndex];
      } else {
        selected.push(this.state.playerIndex);
        matches[userID] = selected;
      }
    }

    this.setState({matches: matches});
    this.next();
  }

  rowPlayer(stream, event, id) {
    const player = event.attendees[id];
    return (
      <ButtonColor
        color="white"
        onPressColor={colors.off}
        click={() => this.matchCurrentImage(player.userID)}
        style={{
          paddingTop: 10,
          paddingBottom: 10,
          flex: 1,
          width: '100%',
          height: 50,
          borderRadius: 3,
          marginBottom: 5,
        }}
        view={() => {
          return (
            <Col style={[styleApp.center2, {paddingLeft: 10}]}>
              <Text style={styleApp.text}>
                {player.info.firstname + ' ' + player.info.lastname}
              </Text>
            </Col>
          );
        }}
      />
    );
  }

  content(stream, event) {
    const players = Object.values(stream.liveballResults.players);
    const numPlayers = players.length;
    return (
      <View style={{marginLeft: 0, width: width, marginTop: 0}}>
        <Row style={styleApp.center}>
          <Text style={styleApp.title}>
            {'Which player is this? (' +
              (this.state.playerIndex +
              1) +
              '/' +
              (numPlayers) +
              ')'}
          </Text>
        </Row>
        <Row style={[styleApp.center, {padding: 5}]}>
          <AsyncImage
            style={{width: width - 40, height: width + 40, borderRadius: 5}}
            mainImage={players[this.state.playerIndex].croppedFrame}
          />
        </Row>
        <Row style={styleApp.center}>
          <View style={[styleApp.divider, {width: width - 20}]} />
        </Row>

        {event.allAttendees.map((id) => this.rowPlayer(stream, event, id))}
      </View>
    );
  }

  goToResults(event, stream) {
    this.props.navigation.navigate('StreamResults', {
      event: event,
      stream: stream,
      matches: this.state.matches,
    });
  }

  render() {
    const {dismiss, goBack, navigate} = this.props.navigation;
    const stream = this.props.navigation.getParam('stream');
    const event = this.props.navigation.getParam('event');

    return (
      <View style={{flex: 1}}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Stream Results '}
          inputRange={[50, 80]}
          initialBorderColorIcon={colors.grey}
          initialBackgroundColor={'transparent'}
          initialTitleOpacity={0}
          icon1="arrow-left"
          // icon2="check"
          // typeIcon2="font"
          // sizeIcon2={17}
          // clickButton2={() => this.goToResults()}
          clickButton1={() => dismiss()}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.content(stream, event)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingLeft: 10,
    paddingTop: sizes.heightHeaderHome,
  },
});

MatchPictures.PropTypes = {};

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps)(MatchPictures);
