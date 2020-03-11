import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
  TextInput,
} from 'react-native';
import {keys} from 'ramda';
import {connect} from 'react-redux';

import {historicSearchAction} from '../../../actions/historicSearchActions';
import {eventsAction} from '../../../actions/eventsActions';

import {getZone} from '../../functions/location';

import Switch from '../../layout/switch/Switch';
const {height, width} = Dimensions.get('screen');
import colors from '../../style/colors';
import sizes from '../../style/sizes';
import styleApp from '../../style/style';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {indexEvents, getEventPublic} from '../../database/algolia';
import FadeInView from 'react-native-fade-in-view';
import PlaceHolder from '../../placeHolders/CardEvent';
import CardEvent from './CardEventSM';
import NavigationService from '../../../../NavigationService';

class ListEvents extends React.Component {
  state = {
    events: [],
    loader: false,
    pastEvents: false,
    public: false,
  };
  async componentDidMount() {
    this.props.onRef(this);
    // if (this.props.loader)
    this.loadEvent(
      this.props.searchLocation,
      this.props.sportSelected,
      this.props.leagueSelected,
    );
  }
  async componentWillReceiveProps(nextProps) {
    if (
      this.props.searchLocation.lat !== nextProps.searchLocation.lat ||
      this.props.sportSelected !== nextProps.sportSelected ||
      this.props.leagueSelected !== nextProps.leagueSelected ||
      (this.props.loader !== nextProps.loader && !this.props.loader)
    ) {
      this.loadEvent(
        nextProps.searchLocation,
        nextProps.sportSelected,
        nextProps.leagueSelected,
      );
    }
  }
  reload() {
    this.loadEvent(
      this.props.searchLocation,
      this.props.sportSelected,
      this.props.leagueSelected,
    );
  }
  async loadEvent(location, sport, league) {
    const {userID, radiusSearch} = this.props;
    await this.props.setState({loaderEvents: true});
    //indexEvents.clearCache();
    const allEventsPublic = await getEventPublic(
      location,
      sport,
      league,
      {},
      userID,
      radiusSearch,
    );

    await this.props.eventsAction('setAllEvents', allEventsPublic);
    await this.props.eventsAction('setPublicEvents', keys(allEventsPublic));
    return this.props.setState({loaderEvents: false});
  }
  openEvent(objectID) {
    return this.props.navigate('Event', {objectID: objectID, pageFrom: 'Home'});
  }
  async setLocation(location) {
    this.props.historicSearchAction('setLocationSearch', location);
    return NavigationService.navigate('Home');
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
        translateXComponent0={translateXComponent0}
        translateXComponent1={translateXComponent1}
        state={this.state[state]}
        setState={(val) => this.setSwitch(state, val)}
      />
    );
  }
  ListEvent() {
    const allPublicEvents = this.props.publicEvents.map(
      (event) => this.props.allEvents[event],
    );
    const {loader} = this.props;
    return (
      <View style={{marginTop: 20}}>
        {loader ? (
          <View>
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
          </View>
        ) : (
          <FadeInView duration={350}>
            {allPublicEvents.length === 0 ? (
              <View
                style={[
                  styleApp.center,
                  styleApp.marginView,
                  styles.viewNoGroups,
                ]}>
                <Image
                  source={require('../../../img/images/location.png')}
                  style={{width: 65, height: 65}}
                />
                <Text
                  style={[styleApp.text, {marginTop: 10, marginBottom: 20}]}>
                  No {this.props.sportSelected} events found
                </Text>
              </View>
            ) : (
              allPublicEvents.map((event, i) => (
                <CardEvent
                  size={'M'}
                  userCard={false}
                  key={i}
                  homePage={true}
                  marginTop={25}
                  openEvent={(objectID) => this.openEvent(objectID)}
                  item={event}
                  data={event}
                />
              ))
            )}
          </FadeInView>
        )}
      </View>
    );
  }
  render() {
    return this.ListEvent();
  }
}

const styles = StyleSheet.create({
  divider: {
    height: 6.5,
    borderTopWidth: 0.5,
    borderColor: colors.grey,
    marginTop: 0,
  },
  viewNoGroups: {
    marginTop: 70,
    marginBottom: 20,
    borderBottomWidth: 0,
    borderColor: colors.grey,
  },
});

const mapStateToProps = (state) => {
  return {
    globaleVariables: state.globaleVariables,
    searchLocation: state.historicSearch.searchLocation,
    sportSelected: state.historicSearch.sport,
    leagueSelected: state.historicSearch.league,
    radiusSearch: state.globaleVariables.radiusSearch,
    publicEvents: state.events.publicEvents,
    allEvents: state.events.allEvents,
    userID: state.user.userID,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps, {historicSearchAction, eventsAction})(
  ListEvents,
);
