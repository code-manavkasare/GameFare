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

const {height, width} = Dimensions.get('screen');
import colors from '../../style/colors';
import sizes from '../../style/sizes';
import styleApp from '../../style/style';
import {Col, Row, Grid} from 'react-native-easy-grid';
import FadeInView from 'react-native-fade-in-view';
import Switch from '../../layout/switch/Switch';
import {getZone} from '../../functions/location';

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
      groups: [],
      loader: true,
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.translateXView1 = new Animated.Value(0);
    this.translateXView2 = new Animated.Value(width);
  }

  async componentDidMount() {
    this.props.onRef(this);
    console.log('le time stamt !!!');
    console.log(Number(new Date()));
    console.log(this.props.mygroups);
    console.log(this.props.searchLocation);
    return this.loadEvent(this.props.sportSelected, this.props.searchLocation);
  }
  async reload() {
    return this.loadEvent(this.props.sportSelected, this.props.searchLocation);
  }
  async componentWillReceiveProps(nextProps) {
    if (
      (this.props.userConnected != nextProps.userConnected &&
        nextProps.userConnected == true) ||
      this.props.sportSelected != nextProps.sportSelected ||
      this.props.searchLocation != nextProps.searchLocation
    ) {
      this.loadEvent(nextProps.sportSelected, nextProps.searchLocation);
    }
  }
  async getGroups(filters, location) {
    console.log('get groups');
    console.log(filters);
    console.log(location);
    var groups = await indexGroups.search({
      query: '',
      aroundLatLng: location.lat + ',' + location.lng,
      filters: filters,
      aroundRadius: 20 * 1000,
    });
    console.log(groups.hits);
    return groups.hits;
  }
  async loadEvent(sport, location) {
    console.log('on reload');
    await this.setState({loader: true});

    indexGroups.clearCache();

    console.log(this.props.userID);
    console.log(sport);
    var filterPublic = 'info.public=1';

    var groups = await this.getGroups('', location);
    console.log('laa');
    console.log(groups);

    // var infoGroups = mygroups.reduce(function(result, item) {
    //   result[item.objectID] = item;
    //   return result;
    // }, {});
    // mygroups = mygroups.map(x => x.objectID);
    // console.log('myGroups hihaaaaa');
    // console.log(infoGroups);
    // console.log(mygroups);

    // await this.props.groupsAction('setAllGroups', infoGroups);
    // await this.props.groupsAction('setGroupsAround', mygroups);

    this.setState({loader: false, groups: groups});
  }
  openGroup(objectID) {
    console.log('click group');
    console.log(objectID);
    return this.props.navigate('Group', {
      objectID: objectID,
      pageFrom: 'ListGroups',
    });
  }
  async setSwitch(state, val) {
    // await this.setState({[state]:val})
    // await this.translateViews(val)
    return false;
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
        setState={val => this.setSwitch(state, val)}
      />
    );
  }
  translateViews(val) {
    if (val) {
      return Animated.parallel([
        Animated.spring(this.translateXView1, native(-width)),
        Animated.spring(this.translateXView2, native(0)),
      ]).start();
    }
    return Animated.parallel([
      Animated.spring(this.translateXView1, native(0)),
      Animated.spring(this.translateXView2, native(width)),
    ]).start();
  }
  listGroups(groups) {
    console.log('display future events');
    console.log(groups);
    //return null
    return Object.values(groups).map((group, i) => (
      <CardGroup key={i} data={group} allAccess={false}/>
    ));
  }
  ListEvent() {
    console.log('My groups');
    console.log(this.state.groups);
    var numberGroups = '';
    if (!this.state.loader) {
      numberGroups = ' (' + this.state.groups.length + ')';
    }

    return (
      <View style={{marginTop: 0}}>
        <View style={[styleApp.marginView, {marginBottom: 10, paddingTop: 10}]}>
          <Text
            style={[
              styleApp.input,
              {marginBottom: 0, marginLeft: 0, fontSize: 22},
            ]}>
            Groups around {numberGroups}
          </Text>
          <Text
            style={[
              styleApp.subtitleXS,
              {marginBottom: 10, marginTop: 5, fontSize: 12},
            ]}>
            {getZone(this.props.searchLocation.address)}
          </Text>
          {/* {this.switch('All' + numberFuture,'Past' + numberPast)} */}
        </View>

        <View style={{flex: 1, marginTop: 0}}>
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: 'white',
              borderRightWidth: 0,
              borderColor: colors.grey,
              transform: [{translateX: this.translateXView1}],
            }}>
            <ScrollViewX
              loader={this.state.loader}
              events={this.state.groups}
              height={210}
              placeHolder={[
                styleApp.cardGroup,
                {paddingLeft: 10, paddingRight: 10, paddingTop: 10},
              ]}
              imageNoEvent="location"
              messageNoEvent={"We haven't find any group in this area."}
              content={() => this.listGroups(this.state.groups)}
              // openEvent={(group) => this.openGroup(group)}
              onRef={ref => (this.scrollViewRef1 = ref)}
            />
          </Animated.View>
        </View>
      </View>
    );
  }
  render() {
    return this.ListEvent();
  }
}

const mapStateToProps = state => {
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    sportSelected: state.historicSearch.sport,
    //leagueSelected:state.historicSearch.league,
    searchLocation: state.historicSearch.searchLocation,
    groupsAround: state.groups.groupsAround,
    allGroups: state.groups.allGroups,
  };
};

export default connect(mapStateToProps, {groupsAction})(ListEvents);
