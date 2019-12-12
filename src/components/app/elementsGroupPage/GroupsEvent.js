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

import CardGroup from '../elementsGroupTab/CardGroup';
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
      loader: true,
      groups: [],
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.translateXView1 = new Animated.Value(0);
    this.translateXView2 = new Animated.Value(width);
  }

  async componentDidMount() {
    console.log('le time stamt !!!');
    console.log(this.props.groups);
    return this.loadGroups(this.props.groups);
  }
  async reload() {
    await this.setState({loader: true});
    return this.loadGroups(this.props.groups);
  }
  async componentWillReceiveProps(nextProps) {
    if (this.props.loader !== nextProps.loader) {
      await this.setState({loader: true});
      this.loadGroups(nextProps.groups);
    }
  }
  async getGroups(groups) {
    var {results} = await indexGroups.getObjects(groups);
    console.log('hits');
    console.log(results);
    return results;
  }
  async loadGroups(groups) {
    await this.setState({loader: true});

    indexGroups.clearCache();
    var groupsEvents = await this.getGroups(groups);
    // console.log('groupsEvents');
    // console.log(groups);

    // console.log(groupsEvents);
    // var infoGroups = groupsEvents.reduce(function(result, item) {
    //   result[item.objectID] = item;
    //   return result;
    // }, {});
    // console.log('myGroups hihaaaaa');
    // console.log(this.props.allGroups[Object.values(infoGroups)[0].objectID]);
    // console.log(infoGroups);
    // await this.props.groupsAction('setAllGroups', infoGroups);
    this.setState({loader: false, groups: groupsEvents});
  }
  openGroup(objectID) {
    console.log('click group');
    console.log(objectID);
    return this.props.navigate('Group', {
      objectID: objectID,
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
  listEvents(events) {
    return Object.values(events).map((event, i) => (
      <CardGroup key={i} data={event} />
    ));
  }
  ListEvent() {
    console.log('My groups');
    console.log(this.state.groups);
    var numberFuture = '';
    if (!this.state.loader) {
      numberFuture = ' (' + this.state.groups.length + ')';
    }

    return (
      <View style={{marginTop: 10}}>
        <View style={[styleApp.marginView, {marginBottom: 10}]}>
          <Text style={styleApp.input}>Groups related {numberFuture}</Text>
          <View style={[styleApp.divider2, {marginTop: 20}]} />
        </View>

        <Animated.View
          style={{
            height: 250,
            borderRightWidth: 0,
            borderColor: colors.grey,
            transform: [{translateX: this.translateXView1}],
          }}>
          <ScrollViewX
            loader={this.state.loader}
            events={this.state.groups}
            // height={260}
            placeHolder={[
              styleApp.cardGroup,
              styleApp.shade,
              {paddingLeft: 10, paddingRight: 10, paddingTop: 10},
            ]}
            imageNoEvent="group"
            messageNoEvent={"You haven't joined any group yet."}
            content={() => this.listEvents(this.state.groups)}
            // openEvent={(group) => this.openGroup(group)}
            onRef={ref => (this.scrollViewRef1 = ref)}
          />
        </Animated.View>
      </View>
    );
  }
  render() {
    return this.ListEvent();
  }
}

const mapStateToProps = state => {
  return {
    // allGroups: state.groups.allGroups,
  };
};

export default connect(mapStateToProps, {groupsAction})(ListEvents);
