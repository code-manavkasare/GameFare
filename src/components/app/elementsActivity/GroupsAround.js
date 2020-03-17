import React from 'react';
import {View, Text, Dimensions, Animated, Image} from 'react-native';
import {connect} from 'react-redux';
import {groupsAction} from '../../../actions/groupsActions';

const {height, width} = Dimensions.get('screen');
import colors from '../../style/colors';
import sizes from '../../style/sizes';
import styleApp from '../../style/style';
import PlaceHolder from '../../placeHolders/CardGroupM';

import CardGroup from './CardGroup';
import {timing, native} from '../../animations/animations';
import {getPublicGroups} from '../../database/algolia';

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

  componentDidMount() {
    this.props.onRef(this);
    this.loadEvent(this.props.sportSelected, this.props.searchLocation);
  }
  async reload() {
    await this.props.setState({loaderGroups: true});
    return this.loadEvent(this.props.sportSelected, this.props.searchLocation);
  }
  async componentWillReceiveProps(nextProps) {
    if (
      (this.props.userConnected !== nextProps.userConnected &&
        nextProps.userConnected === true) ||
      this.props.sportSelected !== nextProps.sportSelected ||
      this.props.searchLocation !== nextProps.searchLocation
    ) {
      await this.props.setState({loaderGroups: true});
      this.loadEvent(nextProps.sportSelected, nextProps.searchLocation);
    }
  }
  async loadEvent(sport, location) {
    const {userID, userConnected, radiusSearch} = this.props;
    const groups = await getPublicGroups(
      userID,
      userConnected,
      sport,
      location,
      radiusSearch,
    );
    this.props.setState({loaderGroups: false, listGroups: groups});
  }
  openGroup(objectID) {
    return this.props.navigate('Group', {
      objectID: objectID,
      pageFrom: 'ListGroups',
    });
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
    return Object.values(groups).map((group, i) => (
      <CardGroup key={i} groupData={group} allAccess={false} fullWidth={true} />
    ));
  }
  viewNoGroup(sportSelected) {
    return (
      <View style={[styleApp.center, {paddingTop: 70}]}>
        <Image
          source={require('../../../img/images/location.png')}
          style={{width: 65, height: 65}}
        />
        <Text style={[styleApp.text, {marginTop: 10, marginBottom: 20}]}>
          No {sportSelected} groups found
        </Text>
      </View>
    );
  }
  ListEvent() {
    const {listGroups, loader, sportSelected} = this.props;
    return (
      <View style={[styleApp.marginView, {marginTop: 20}]}>
        {loader ? (
          <View style={{marginLeft: -20}}>
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
          </View>
        ) : listGroups.length === 0 ? (
          this.viewNoGroup(sportSelected)
        ) : (
          this.listGroups(listGroups)
        )}
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
    infoUser: state.user.infoUser.userInfo,
    userConnected: state.user.userConnected,
    sportSelected: state.historicSearch.sport,
    //leagueSelected:state.historicSearch.league,
    searchLocation: state.historicSearch.searchLocation,
    groupsAround: state.groups.groupsAround,
    allGroups: state.groups.allGroups,
    radiusSearch: state.globaleVariables.radiusSearch,
  };
};

export default connect(mapStateToProps, {groupsAction})(ListEvents);
