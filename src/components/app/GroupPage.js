import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Button,
  RefreshControl,
  Animated,
  Image,
} from 'react-native';
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
import ParalaxScrollView from '../layout/scrollViews/ParalaxScrollView';

class GroupPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usersConfirmed: true,
      loader: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    if (!this.props.allGroups[this.props.navigation.getParam('objectID')]) {
      await this.setState({loader: true});
      this.loadGroup(this.props.navigation.getParam('objectID'));
    }
  }
  async loadGroup(objectID) {
    indexGroups.clearCache();
    var group = await indexGroups.getObject(objectID);
    await this.props.groupsAction('editGroup', group);
    return this.setState({loader: false});
  }
  rowIcon(component, icon, alert, dataAlert, image) {
    console.log('Alert');
    console.log(alert);
    console.log(dataAlert);
    return (
      <TouchableOpacity
        style={{marginTop: 20}}
        activeOpacity={alert !== undefined ? 0.7 : 1}
        onPress={() =>
          alert != undefined
            ? this.props.navigation.navigate('AlertAddress', {data: dataAlert})
            : null
        }>
        <Row>
          <Col size={15} style={styleApp.center2}>
            {image != undefined ? (
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

            {/* 
            {this.rowIcon(
              this.title(data.organizer.name),
              'user-alt',
              undefined,
              undefined,
              <View
                style={[
                  styleApp.viewNumber,
                  styleApp.center,
                  {backgroundColor: colors.grey},
                ]}>
                <Text
                  style={[
                    styleApp.text,
                    {fontSize: 10, color: 'white', fontFamily: 'OpenSans-Bold'},
                  ]}>
                  {data.organizer.name.split(' ')[0][0] +
                    data.organizer.name.split(' ')[1][0]}
                </Text>
              </View>,
            )} */}
          </View>
        </View>

        <CardUser
          user={data.organizer}
          infoUser={this.props.infoUser}
          userConnected={this.props.userConnected}
          userID={this.props.userID}
        />
      </View>
    );
  }
  group(data) {
    if (!data || this.state.loader) return <PlaceHolder />;
    var sport = this.props.sports.filter(
      (sport) => sport.value === data.info.sport,
    )[0];
    console.log('group page');
    console.log(sport);
    console.log(data);
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
  conditionAdmin() {
    if (
      this.props.navigation.getParam('pageFrom') !== 'Home' &&
      this.props.navigation.getParam('data').info.organizer ===
        this.props.userID &&
      this.props.navigation.getParam('data').info.public
    )
      return true;
    return false;
  }
  async refresh() {
    await this.setState({loader: true});
    return this.loadGroup(this.props.navigation.getParam('objectID'));
  }
  refreshControl() {
    return (
      <RefreshControl
        refreshing={this.state.loader}
        colors={['white']}
        progressBackgroundColor={'white'}
        tintColor="white"
        onRefresh={() => this.refresh()}
        size={'small'}
      />
    );
  }
  render() {
    const {goBack, dismiss} = this.props.navigation;
    var data = this.props.allGroups[this.props.navigation.getParam('objectID')];
    // if (data != undefined) {
    //   var dots =
    //     data.info.name.slice(0, 20).length < data.info.name.length ? '...' : '';
    // }

    return (
      <View>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={data != undefined ? data.info.name.slice(0, 20) : ''}
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
          clickButton2={() =>
            this.props.navigation.navigate('Contacts', {
              openPageLink: 'openGroupPage',
              pageTo: 'Group',
              objectID: data.objectID,
              pageFrom: 'Group',
              data: {...data, eventID: data.objectID},
            })
          }
        />

        <ParalaxScrollView
          setState={(val) => this.setState(val)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          image={
            data != undefined ? (
              <AsyncImage
                style={{width: '100%', height: 280, borderRadius: 0}}
                mainImage={data.pictures[0]}
                imgInitial={data.pictures[0]}
              />
            ) : (
              <View
                style={{
                  width: '100%',
                  height: 280,
                  borderRadius: 0,
                  backgroundColor: colors.off,
                }}
              />
            )
          }
          refresh={() => this.refresh()}
          content={() => this.group(data)}
          icon1="arrow-left"
          icon2="share"
          colorRefreshControl={colors.title}
          initialColorIcon={'white'}
        />
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
