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
  ScrollView,
} from 'react-native';
import firebase from 'react-native-firebase';
import {connect} from 'react-redux';
import {groupsAction} from '../../../actions/groupsActions';
import isEqual from 'lodash.isequal';

const {height, width} = Dimensions.get('screen');
import colors from '../../style/colors';
import sizes from '../../style/sizes';
import styleApp from '../../style/style';
import {Col, Row, Grid} from 'react-native-easy-grid';
import FadeInView from 'react-native-fade-in-view';
import Switch from '../../layout/switch/Switch';

import CardGroup from './CardGroup';
import {timing, native} from '../../animations/animations';
import {
  indexGroups,
  indexEvents,
  indexPastEvents,
} from '../../database/algolia';

import ScrollViewX from '../../layout/scrollViews/ScrollViewX';

class ListEvents extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      futureEvents: [],
      pastEvents: [],
      loader1: true,
      loader2: false,
      past: false,
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.translateXView1 = new Animated.Value(0);
    this.translateXView2 = new Animated.Value(width);
  }

  async componentDidMount() {
    this.props.onRef(this);
    return this.loadEvent(this.props.sportSelected, this.props.leagueSelected);
  }
  async reload() {
    return this.loadEvent(this.props.sportSelected, this.props.leagueSelected);
  }
  async componentWillReceiveProps(nextProps) {
    if (
      (this.props.userConnected !== nextProps.userConnected &&
        nextProps.userConnected === true) ||
      this.props.sportSelected !== nextProps.sportSelected ||
      this.props.leagueSelected !== nextProps.leagueSelected
    ) {
      this.loadEvent(nextProps.sportSelected, nextProps.leagueSelected);
    }
  }
  async getGroups(filters) {
    var mygroups = await indexGroups.search({
      query: '',
      filters: filters,
    });
    return mygroups.hits;
  }
  async loadEvent(sport, league) {
    await this.setState({loader1: true});

    indexGroups.clearCache();
    var filterSport = ' AND info.sport:' + sport;
    var filterOrganizer =
      'info.organizer:' +
      this.props.userID +
      ' OR allMembers:' +
      this.props.userID;
    var filters = filterOrganizer + filterSport;

    // var filterDate =' AND date_timestamp>' + Number(new Date())
    var mygroups = await this.getGroups(filters);
    // REMOVE THE LINE BELOW THIS REMOVE THE LINE BELOW THIS
    mygroups = mygroups.filter(group => group.objectID !== "-LzI3bAQjfCPKtb4tcuQ");
    console.log("MYGROUPS");
    console.log(mygroups);
    console.log("ENDMYGROUPS");
    var infoGroups = mygroups.reduce(function(result, item) {
      result[item.objectID] = item;
      return result;
    }, {});
    mygroups = mygroups.map((x) => x.objectID);

    await this.props.groupsAction('setAllGroups', infoGroups);
    await this.props.groupsAction('setMygroups', mygroups);
    this.setState({loader1: false});
  }
  listEvents(events) {
    console.log(this.props.allGroups);
    return Object.values(events).map((event, i) => (
      <CardGroup key={i} allAccess={true} data={this.props.allGroups[event]} />
    ));
  }
  ListEvent() {
    if (!this.props.userConnected) return null;
    var numberFuture = '';
    if (!this.state.loader1) {
      numberFuture = ' (' + this.props.mygroups.length + ')';
    }

    return (
      <View style={{marginTop: 10}}>
        <View style={[styleApp.marginView, {marginBottom: 10}]}>
          <Text
            style={[
              styleApp.input,
              {marginBottom: 10, marginLeft: 0, fontSize: 22},
            ]}>
            My groups {numberFuture}
          </Text>
          {/* {this.switch('All' + numberFuture,'Past' + numberPast)} */}
        </View>

        <Animated.View
          style={{
            height: 250,
            borderRightWidth: 0,
            backgroundColor: 'red',
            borderColor: colors.grey,
            transform: [{translateX: this.translateXView1}],
          }}>
          <ScrollViewX
            loader={this.state.loader1}
            events={this.props.mygroups}
            // height={260}
            placeHolder={[
              styleApp.cardGroup,
              styleApp.shade,
              {paddingLeft: 10, paddingRight: 10, paddingTop: 10},
            ]}
            imageNoEvent="group"
            messageNoEvent={
              "You haven't joined any " +
              this.props.sportSelected +
              ' group yet.'
            }
            content={() => this.listEvents(this.props.mygroups)}
            // openEvent={(group) => this.openGroup(group)}
            onRef={(ref) => (this.scrollViewRef1 = ref)}
          />
        </Animated.View>

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

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    sportSelected: state.historicSearch.sport,
    leagueSelected: state.historicSearch.league,
    mygroups: state.groups.mygroups,
    allGroups: state.groups.allGroups,
  };
};

export default connect(mapStateToProps, {groupsAction})(ListEvents);
