import React from 'react';
import {AppState, View, Text, Dimensions, Animated} from 'react-native';
import {connect} from 'react-redux';
import {groupsAction} from '../../../actions/groupsActions';

const {height, width} = Dimensions.get('screen');
import colors from '../../style/colors';
import styleApp from '../../style/style';

import CardGroup from './CardGroup';
import {indexGroups, getMyGroups} from '../../database/algolia';

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
        groupData={this.props.allGroups[groups]}
      />
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
            content={() => this.listGroups(this.props.mygroups)}
            // openEvent={(group) => this.openGroup(group)}
            onRef={(ref) => (this.scrollViewRef1 = ref)}
          />
        </Animated.View>
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

export default connect(mapStateToProps, {groupsAction})(MyGroups);
