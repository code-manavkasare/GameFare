import React from 'react';
import {AppState, View, Text, Dimensions, Animated, Image} from 'react-native';
import {connect} from 'react-redux';
import {groupsAction} from '../../../actions/groupsActions';

const {height, width} = Dimensions.get('screen');
import colors from '../../style/colors';
import styleApp from '../../style/style';

import CardGroup from './CardGroup';
import {indexGroups, getMyGroups} from '../../database/algolia';
import PlaceHolder from '../../placeHolders/CardGroupM';

import ScrollViewX from '../../layout/scrollViews/ScrollViewX';

class MyGroups extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      futureEvents: [],
      pastEvents: [],
      loader1: true,
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
    this.loadGroups(this.props.sportSelected);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.loadGroups(this.props.sportSelected);
    }
    this.setState({appState: nextAppState});
  };

  async reload() {
    this.loadGroups(this.props.sportSelected);
  }
  async componentWillReceiveProps(nextProps) {
    if (
      (this.props.userConnected !== nextProps.userConnected &&
        nextProps.userConnected === true) ||
      this.props.sportSelected !== nextProps.sportSelected
    ) {
      this.loadGroups(nextProps.sportSelected);
    }
  }
  async getGroups(filters) {
    var mygroups = await indexGroups.search({
      query: '',
      filters: filters,
    });
    return mygroups.hits;
  }
  async loadGroups(sport) {
    await this.setState({loader1: true});
    var filterSport = ' AND info.sport:' + sport;
    const {userID} = this.props;

    let myGroups = await getMyGroups(userID, filterSport);

    var infoGroups = myGroups.reduce(function(result, item) {
      result[item.objectID] = item;
      return result;
    }, {});
    const myGroupsIDs = myGroups.map((x) => x.objectID);

    await this.props.groupsAction('setAllGroups', infoGroups);
    await this.props.groupsAction('setMygroups', myGroupsIDs);
    this.setState({loader1: false});
  }
  listGroups(groups) {
    return Object.values(groups).map((groups, i) => (
      <CardGroup
        key={i}
        allAccess={true}
        fullWidth={true}
        groupData={this.props.allGroups[groups]}
      />
    ));
  }
  ListGroupComponent() {
    if (!this.props.userConnected) return null;
    const {loader1} = this.state;
    const {mygroups} = this.props;
    return (
      <View style={{marginTop: 10}}>
        {loader1 ? (
          <View>
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
          </View>
        ) : mygroups.length === 0 ? (
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
              {"You haven't joined any " +
                this.props.sportSelected +
                ' group yet.'}
            </Text>
          </View>
        ) : (
          <View style={[styleApp.marginView, {paddingTop: 10}]}>
            {this.listGroups(mygroups)}
          </View>
        )}
      </View>
    );
  }
  render() {
    return this.ListGroupComponent();
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

export default connect(mapStateToProps, {groupsAction})(MyGroups);
