import React from 'react';
import {
  AppState,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {keys} from 'ramda';

import {eventsAction} from '../../../actions/eventsActions';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import Switch from '../../layout/switch/Switch';

import CardEvent from './CardEventSM';
import {indexEvents, getMyEvents} from '../../database/algolia';
import ScrollViewX from '../../layout/scrollViews/ScrollViewX';

const {height, width} = Dimensions.get('screen');

class MyEvents extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      futureEvents: [],
      pastEvents: [],
      loader: true,
      loader2: false,
      past: false,
      appState: AppState.currentState,
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.translateXView1 = new Animated.Value(0);
    this.translateXView2 = new Animated.Value(width);
  }

  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);

    this.props.onRef(this);
    return this.loadEvent(this.props.userID);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.loadEvent(this.props.userID);
    }
    this.setState({appState: nextAppState});
  };

  async reload() {
    return this.loadEvent(this.props.userID);
  }

  async componentWillReceiveProps(nextProps) {
    if (
      (this.props.userConnected !== nextProps.userConnected &&
        nextProps.userConnected) ||
      (nextProps.userConnected &&
        nextProps.leagueSelected !== this.props.leagueSelected)
    ) {
      this.loadEvent(nextProps.userID);
    }
  }
  async loadEvent(userID) {
    await this.setState({loader: true});

    const futureEvents = await getMyEvents(userID, 'future');
    const pastEvents = await getMyEvents(userID, 'past');

    await this.props.eventsAction('setAllEvents', {
      ...futureEvents,
      ...pastEvents,
    });
    await this.props.eventsAction('setFutureUserEvents', keys(futureEvents));
    await this.props.eventsAction('setPastUserEvents', keys(pastEvents));

    this.setState({loader: false});
  }
  openEvent(objectID) {
    return this.props.navigate('Event', {objectID: objectID});
  }
  async setSwitch(state, val) {
    await this.setState({[state]: val});
    return true;
  }
  switch(textOn, textOff, state, translateXComponent0, translateXComponent1) {
    return (
      <Switch
        textOn={textOn}
        textOff={textOff}
        translateXTo={width / 2 - 20}
        height={50}
        translateXComponent0={this.translateXView1}
        translateXComponent1={this.translateXView2}
        state={this.state[state]}
        setState={(val) => this.setSwitch(state, val)}
      />
    );
  }
  listEvents(events) {
    return events.map((event, i) => (
      <CardEvent
        size={'SM'}
        userCard={false}
        key={i}
        index={i}
        league={this.props.leagueSelected}
        loadData={false}
        homePage={true}
        openEvent={(objectID) => this.openEvent(objectID)}
        item={event}
        data={event}
      />
    ));
  }
  leagueFilter(league) {
    if (this.props.leagueSelected === 'all') return true;
    return league === this.props.leagueSelected;
  }
  ListEvent() {
    if (!this.props.userConnected) return null;

    const AllFutureEvents = this.props.futureEvents.map(
      (event) => this.props.allEvents[event],
    );
    const AllPastEvents = this.props.pastEvents.map(
      (event) => this.props.allEvents[event],
    );

    var futureEvents = AllFutureEvents.filter(
      (event) =>
        event.info.sport === this.props.sportSelected &&
        this.leagueFilter(event.info.league),
    );
    var pastEvents = AllPastEvents.filter(
      (event) =>
        event.info.sport === this.props.sportSelected &&
        this.leagueFilter(event.info.league),
    );

    var numberFuture = '';
    var numberPast = '';
    if (!this.state.loader) {
      numberFuture = ' (' + futureEvents.length + ')';
      numberPast = ' (' + pastEvents.length + ')';
    }
    console.log('render ListEvent', futureEvents);
    return (
      <View style={{marginTop: 20}}>
        <View style={[styleApp.marginView, {marginBottom: 20}]}>
          <Text style={[styleApp.input, {marginBottom: 15, fontSize: 22}]}>
            My events
          </Text>
          {this.switch('Upcoming' + numberFuture, 'Past' + numberPast)}
        </View>

        <View style={{flex: 1}}>
          <Animated.View
            style={[
              styles.viewFutureEvents,
              {
                transform: [{translateX: this.translateXView1}],
              },
            ]}>
            <ScrollViewX
              loader={this.state.loader}
              events={futureEvents}
              height={180}
              imageNoEvent="group"
              messageNoEvent={'You don’t have any upcoming events.'}
              content={(events) => this.listEvents(events)}
              openEvent={(objectID) => this.openEvent(objectID)}
              onRef={(ref) => (this.scrollViewRef1 = ref)}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.viewPastEvents,
              {
                transform: [{translateX: this.translateXView2}],
              },
            ]}>
            <ScrollViewX
              height={180}
              loader={this.state.loader}
              events={pastEvents}
              messageNoEvent={"You don't have any past events."}
              content={(events) => this.listEvents(events)}
              openEvent={(objectID) => this.openEvent(objectID)}
              onRef={(ref) => (this.scrollViewRef2 = ref)}
            />
          </Animated.View>
        </View>

        <View style={styleApp.marginView}>
          <View style={[styleApp.divider2, {marginTop: 30}]} />
        </View>
      </View>
    );
  }
  render() {
    return this.ListEvent();
  }
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'OpenSans-SemiBold',
    color: colors.title,
  },
  cardSport: {
    backgroundColor: 'red',
    shadowColor: '#46474B',
    shadowOffset: {width: 2, height: 0},
    shadowRadius: 20,
    shadowOpacity: 0.3,
    overflow: 'hidden',
    height: 170,
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 0.3,
    borderColor: colors.borderColor,
    width: 220,
  },
  viewFutureEvents: {
    height: 225,
    paddingTop: 15,
    borderRightWidth: 0,
    borderColor: colors.grey,
  },
  viewPastEvents: {
    height: 200,
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,

    sports: state.globaleVariables.sports.list,
    sportSelected: state.historicSearch.sport,
    leagueSelected: state.historicSearch.league,

    futureEvents: state.events.futureUserEvents,
    pastEvents: state.events.pastUserEvents,
    allEvents: state.events.allEvents,
  };
};

export default connect(mapStateToProps, {eventsAction})(MyEvents);