import React from 'react';
import {
  AppState,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import {connect} from 'react-redux';
import {keys} from 'ramda';

import {eventsAction} from '../../../actions/eventsActions';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import Switch from '../../layout/switch/Switch';
import PlaceHolder from '../../placeHolders/CardEvent';

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
        size={'M'}
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
    const {past, loader} = this.state;
    return (
      <View style={{marginTop: 20}}>
        <View style={[styleApp.marginView, {marginBottom: 20}]}>
          {this.switch('Upcoming' + numberFuture, 'Past' + numberPast, 'past')}
        </View>

        {loader ? (
          <View>
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
          </View>
        ) : (past && pastEvents.length === 0) ||
          (!past && futureEvents.length === 0) ? (
          <View
            style={[styleApp.center, styleApp.marginView, {paddingTop: 50}]}>
            <Image
              source={require('../../../img/images/shelve.png')}
              style={{width: 65, height: 65}}
            />
            <Text
              style={[
                styleApp.text,
                {marginTop: 10, marginBottom: 20, fontSize: 13},
              ]}>
              {past
                ? "You don't have any past events."
                : 'You don’t have any upcoming events.'}
            </Text>
          </View>
        ) : (
          this.listEvents(past ? pastEvents : futureEvents)
        )}
      </View>
    );
  }
  render() {
    return this.ListEvent();
  }
}

const styles = StyleSheet.create({});

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
