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

class StreamResults extends React.Component {
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
      await this.setState({matches: stream.liveballResults.matches});
    }
  }

  next() {
    const stream = this.props.navigation.getParam('stream');
    const event = this.props.navigation.getParam('event');

    let numPlayers = Object.values(stream.liveballResults).length;
    if (this.state.playerIndex === numPlayers - 1) {
      console.log('end');
      this.goToResults(stream, event);
    } else {
      this.setState({playerIndex: this.state.playerIndex + 1});
    }
  }

  matchCurrentImage(userID) {
    let matches = {};
    if (!this.state.matches) {
      matches[userID] = [this.state.playerIndex];
    } else {
      matches = Object.assign(this.state.matches);
      let current = matches[userID];
      if (!current) {
        matches[userID] = [this.state.playerIndex];
      } else {
        current.push(this.state.playerIndex);
        matches[userID] = current;
      }
    }

    this.setState({matches: matches});
    this.next();
  }

  totalTimePlayer(stream, matches, id) {
    const sections = matches[id];
    let winningTime = 0;
    for (const section of sections) {
      console.log(section);
      winningTime += parseFloat(stream.liveballResults[section].winningTime);
    }
    return winningTime;
  }

  resultsPlayer(event, stream, matches, id) {
    const player = event.attendees[id];
    return (
      <Row
        style={{
          paddingTop: 10,
          paddingBottom: 10,
          flex: 1,
          justifyContent: 'space-between',
          width: '100%',
          height: 50,
          borderRadius: 3,
          marginBottom: 5,
        }}>
        <Col style={[styleApp.center2, {paddingLeft: 10}]}>
          <Text style={styleApp.text}>
            {player.info.firstname + ' ' + player.info.lastname}
          </Text>
        </Col>
        <Col style={[styleApp.center2, {paddingLeft: 10}]}>
          <Text style={styleApp.text}>
            {this.totalTimePlayer(stream, matches, id)}
          </Text>
        </Col>
      </Row>
    );
  }

  content(event, stream, matches) {
    const players = Object.values(stream.liveballResults);
    return (
      <View style={{marginLeft: 0, width: width, marginTop: 0}}>
        <Row style={styleApp.center}>
          <Text style={styleApp.title}>Results</Text>
        </Row>
        <Row style={styleApp.center}>
          <View style={[styleApp.divider, {width: width - 20}]} />
        </Row>

        {event.allAttendees.map((id) => this.resultsPlayer(event, stream, matches, id))}
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
    const matches = this.props.navigation.getParam('matches');
    console.log('STREAM' + stream);
    console.log('EVENT' + event);
    console.log('MATCHES' + matches);
    return (
      <View style={{flex: 1}}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Stream Results'}
          inputRange={[50, 80]}
          initialBorderColorIcon={colors.grey}
          initialBackgroundColor={'transparent'}
          initialTitleOpacity={0}
          icon1="arrow-left"
          clickButton1={() => navigate('Event')}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.content(event, stream, matches)}
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

StreamResults.PropTypes = {};

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps)(StreamResults);
