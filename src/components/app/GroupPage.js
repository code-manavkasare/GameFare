import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Button,
  Animated,
  Image,
} from 'react-native';
import firebase from 'react-native-firebase';
import {connect} from 'react-redux';
import {createEventAction} from '../../actions/createEventActions';
import {groupsAction} from '../../actions/groupsActions';

const {height, width} = Dimensions.get('screen');
import colors from '../style/colors';
import styleApp from '../style/style';
import CardUser from './elementsEventPage/CardUser';
import {Grid, Row, Col} from 'react-native-easy-grid';

import AsyncImage from '../layout/image/AsyncImage';
import AllIcons from '../layout/icons/AllIcons';
import HeaderBackButton from '../layout/headers/HeaderBackButton';

import {indexGroups} from '../database/algolia';
import PlaceHolder from '../placeHolders/EventPage';

import DescriptionView from './elementsGroupPage/DescriptionView';
import MembersView from './elementsGroupPage/MembersView';
import PostsView from './elementsGroupPage/PostsView';
import EventsView from './elementsGroupPage/EventsView';
import ParallaxScrollView from 'react-native-parallax-scroll-view';

class GroupPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usersConfirmed: true,
      loader: true,
      group: null,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    this.loadGroup(this.props.navigation.getParam('objectID'));
  }
  async loadGroup(objectID) {
    const that = this;
    firebase
      .database()
      .ref('groups/' + objectID)
      .on('value', async function(snap) {
        let group = snap.val();
        group.objectID = objectID;
        if (group.allMembers) {
          if (group.allMembers.includes(that.props.userID)) {
            await that.props.groupsAction('setAllGroups', {[objectID]: group});
          }
        }
        that.setState({group: group, loader: false});
      });
  }
  rowIcon(component, icon, alert, dataAlert, image) {
    return (
      <TouchableOpacity
        style={{marginTop: 20}}
        activeOpacity={alert? 0.7 : 1}
        onPress={() =>
          alert && this.props.navigation.navigate('AlertAddress', {data: dataAlert})
        }>
        <Row>
          <Col size={15} style={styleApp.center2}>
            {image ? (
              image
            ) : (
              <AllIcons name={icon} color={colors.grey} size={18} type="font" />
            )}
          </Col>
          <Col size={85} style={[styleApp.center2, {paddingLeft: 10}]}>
            {component}
          </Col>
        </Row>
      </TouchableOpacity>
    );
  }
  title(text) {
    return <Text style={styleApp.text}>{text}</Text>;
  }
  groupInfo(data, sport) {
    return (
      <View style={{marginTop: -10}}>
        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>
            <Text style={styleApp.title}>{data.info.name}</Text>

            <View style={[styleApp.divider2, {marginBottom: 25}]} />
            <Row>
              <Col size={15} style={styleApp.center2}>
                <AsyncImage
                  style={{width: 35, height: 35, borderRadius: 17.5}}
                  mainImage={sport.card.img.imgM}
                  imgInitial={sport.card.img.imgSM}
                />
              </Col>
              <Col size={85} style={[styleApp.center2, {paddingLeft: 10}]}>
                <Text style={styleApp.text}>{sport.text}</Text>
              </Col>
            </Row>
            {this.rowIcon(
              this.title(data.location.address),
              'map-marker-alt',
              'AlertAddress',
              data.location,
              <View
                style={[
                  styleApp.viewNumber,
                  styleApp.center,
                  {backgroundColor: 'white', borderWidth: 0},
                ]}>
                <AllIcons
                  name={'map-marker-alt'}
                  color={colors.grey}
                  size={18}
                  type="font"
                />
              </View>,
            )}
          </View>
        </View>

        <CardUser
          user={data.organizer}
          infoUser={this.props.infoUser}
          userConnected={this.props.userConnected}
          userID={this.props.userID}
          objectID={data.objectID}
        />
      </View>
    );
  }
  group(data) {
    if (!data || this.state.loader) return <PlaceHolder />;
    var sport = this.props.sports.filter(
      (sport) => sport.value === data.info.sport,
    )[0];
    return (
      <View style={{width: width, marginTop: 0}}>
        {this.groupInfo(data, sport)}

        <DescriptionView
          objectID={data.objectID}
          loader={this.state.loader}
          data={data}
        />

        <MembersView
          data={data}
          objectID={data.objectID}
          userID={this.props.userID}
          loader={this.state.loader}
          infoUser={this.props.infoUser}
        />

        <EventsView
          data={data}
          objectID={data.objectID}
          userID={this.props.userID}
          loader={this.state.loader}
          createEventAction={(val, data) =>
            this.props.createEventAction(val, data)
          }
          sport={sport}
          navigate={(val, data) => this.props.navigation.navigate(val, data)}
          push={(val, data) => this.props.navigation.push(val, data)}
        />

        <PostsView
          objectID={data.objectID}
          data={data}
          loader={this.state.loader}
          infoUser={this.props.infoUser}
        />

        <View style={{height: 100}} />
      </View>
    );
  }
  goToShareGroup = (data) => {
    if (!this.props.userConnected) {
      return this.props.navigation.navigate('SignIn', {pageFrom: 'Event'});
    }
    this.props.navigation.navigate('Contacts', {
      openPageLink: 'openGroupPage',
      pageTo: 'Group',
      objectID: data.objectID,
      pageFrom: 'Group',
      data: {...data, eventID: data.objectID},
    });
  };

  render() {
    const {goBack, dismiss} = this.props.navigation;
    var data = this.props.allGroups[this.props.navigation.getParam('objectID')];
    const {group} = this.state
    return (
      <View>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={
            !group ? '' : group.info.name.slice(0, 20)
          }
          inputRange={[20, 50]}
          initialTitleOpacity={0}
          initialBackgroundColor={'transparent'}
          initialBorderColorIcon={colors.grey}
          typeIcon2={'moon'}
          sizeIcon2={15}
          icon1="arrow-left"
          icon2="share"
          // clickButton1 = {() => this.props.navigation.navigate(this.props.navigation.getParam('pageFrom'))}
          clickButton1={() => dismiss()}
          clickButton2={() => this.goToShareGroup(group)}
        />

        <ParallaxScrollView
          style={{
            height: height,
            backgroundColor: 'white',
            overflow: 'hidden',
            position: 'absolute',
          }}
          showsVerticalScrollIndicator={false}
          stickyHeaderHeight={100}
          outputScaleValue={6}
          fadeOutForeground={true}
          backgroundScrollSpeed={2}
          backgroundColor={'white'}
          onScroll={Animated.event([
            {nativeEvent: {contentOffset: {y: this.AnimatedHeaderValue}}},
          ])}
          renderBackground={() => {
            if (group) {
              return (
                <AsyncImage
                  style={{width: '100%', height: 280, borderRadius: 0}}
                  mainImage={group.pictures[0]}
                  imgInitial={group.pictures[0]}
                />
              );
            }
          }}
          renderFixedHeader={null}
          parallaxHeaderHeight={280}>
          {this.group(group)}
        </ParallaxScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    sports: state.globaleVariables.sports.list,
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    allGroups: state.groups.allGroups,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps, {createEventAction, groupsAction})(
  GroupPage,
);
