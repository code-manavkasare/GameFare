import React from 'react';
import {View, Text, Dimensions, Animated} from 'react-native';
import {connect} from 'react-redux';
import {keys} from 'ramda';

import colors from '../../style/colors';
import styleApp from '../../style/style';

import {groupsAction} from '../../../actions/groupsActions';
import CardGroup from '../elementsGroupTab/CardGroup';
import {native} from '../../animations/animations';
import {indexGroups} from '../../database/algolia';
import ScrollViewX from '../../layout/scrollViews/ScrollViewX';

const {height, width} = Dimensions.get('screen');
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
    const {results} = await indexGroups.getObjects(groups);

    return results;
  }
  async loadGroups(groups) {
    await this.setState({loader: true});
    indexGroups.clearCache();
    const groupsEvents = await this.getGroups(keys(groups));
    this.setState({loader: false, groups: groupsEvents});
  }
  openGroup(objectID) {
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
    console.log("GroupsEvents");
    console.log(events);
    return Object.values(events).map((event, i) => (
      <CardGroup key={i} data={event} />
    ));
  }
  ListEvent() {
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
            placeHolder={[
              styleApp.cardGroup,
              styleApp.shade,
              {paddingLeft: 10, paddingRight: 10, paddingTop: 10},
            ]}
            imageNoEvent="group"
            messageNoEvent={"You haven't joined any group yet."}
            content={() => this.listEvents(this.state.groups)}
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
    // allGroups: state.groups.allGroups,
  };
};

export default connect(mapStateToProps, {groupsAction})(ListEvents);
