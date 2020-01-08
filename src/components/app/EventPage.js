import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Button,
} from 'react-native';
import {connect} from 'react-redux';
import {eventsAction} from '../../actions/eventsActions';
import firebase from 'react-native-firebase';
import NavigationService from '../../../NavigationService';

import RNCalendarEvents from 'react-native-calendar-events';
import {getPermissionCalendar} from '../functions/date';
import moment from 'moment';

const {height, width} = Dimensions.get('screen');
import colors from '../style/colors';
import styleApp from '../style/style';
import sizes from '../style/sizes';
import {Grid, Row, Col} from 'react-native-easy-grid';
import FadeInView from 'react-native-fade-in-view';

import AsyncImage from '../layout/image/AsyncImage';

import AllIcons from '../layout/icons/AllIcons';
import DateEvent from './elementsEventCreate/DateEvent';
import Button2 from '../layout/buttons/Button';
import ButtonColor from '../layout/Views/Button';
import GroupsEvent from './elementsGroupPage/GroupsEvent';
import PostsView from './elementsGroupPage/PostsView';

import CardUser from './elementsEventPage/CardUser';

import {indexEvents} from '../database/algolia';
import PlaceHolder from '../placeHolders/EventPage';

import ParalaxScrollView from '../layout/scrollViews/ParalaxScrollView';
import HeaderBackButton from '../layout/headers/HeaderBackButton';

class EventPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      editMode: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    if (this.props.allEvents[this.props.navigation.getParam('objectID')] === undefined) {
      this.loadEvent(this.props.navigation.getParam('objectID'));
    }
  }
  async componentDidUpdate() {
    console.log('EventPage: componentDidUpdate');
    console.log(this.state);
  }
  async loadEvent(objectID) {
    indexEvents.clearCache();
    var event = await indexEvents.getObject(objectID);
    await this.props.eventsAction('setAllEvents', {[objectID]: event});
    return this.setState({loader: false});
  }
  rowIcon(component, icon, alert) {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={15} style={styleApp.center}>
                <AllIcons
                  name={icon}
                  color={colors.greyDark}
                  size={16}
                  type="font"
                />
              </Col>
              <Col size={85} style={[styleApp.center2, {paddingLeft: 10}]}>
                {component}
              </Col>
            </Row>
          );
        }}
        click={() => (alert != undefined ? alert() : null)}
        color="white"
        style={[
          {
            paddingTop: 10,
            paddingBottom: 10,
            flex: 1,
            borderRadius: 3,
            marginBottom: 5,
          },
        ]}
        onPressColor={colors.off}
      />
    );
  }
  rowImage(uri, text) {
    return (
      <Row style={{paddingTop: 5, paddingBottom: 5, marginBottom: 10}}>
        <Col size={15} style={styleApp.center}>
          <AsyncImage
            style={{height: 35, width: 35, borderRadius: 20}}
            mainImage={uri}
            imgInitial={uri}
          />
        </Col>
        <Col size={85} style={[styleApp.center2, {paddingLeft: 10}]}>
          <Text style={styleApp.input}>{text}</Text>
        </Col>
      </Row>
    );
  }
  colIcon(text, icon, click) {
    return (
      <ButtonColor
        view={() => {
          return (
            <View style={styleApp.center} size={50}>
              <AllIcons
                name={icon}
                size={17}
                color={colors.title}
                type="font"
              />
              <Text style={[styleApp.text, {marginTop: 10}]}>{text}</Text>
            </View>
          );
        }}
        click={() =>
          click
            ? this.props.navigation.navigate('Alert', {
                close: true,
                title: click.title,
                subtitle: click.subtitle,
                textButton: 'Close',
              })
            : null
        }
        color="white"
        style={[{height: 90, marginTop: 0, borderRadius: 3, width: '100%'}]}
        onPressColor={colors.off}
      />
    );
  }
  title(text) {
    return <Text style={styleApp.input}>{text}</Text>;
  }
  dateTime(start, end) {
    return <DateEvent start={start} end={end} />;
  }
  openView(data) {
    return (
      <AllIcons
        name={this.openCondition(data) ? 'lock-open' : 'lock'}
        type="font"
        color={this.openCondition(data) ? colors.green : colors.primary}
        size={18}
      />
    );
  }
  alertCoach(coach, name, icon) {
    var text = coach ? 'instructor.' : 'player.';
    var title = name + ' joined the event as a ' + text;
    this.props.navigation.navigate('Alert', {
      textButton: 'Close',
      icon: icon,
      title: title,
      close: true,
      onGoBack: () => this.props.navigation.navigate('Event'),
    });
  }
  openAlert(title, icon) {
    this.props.navigation.navigate('Alert', {
      textButton: 'Close',
      title: title,
      icon: icon,
      close: true,
      onGoBack: () => this.props.navigation.navigate('Event'),
    });
  }
  allowCall(user, data) {
    if (user.coach || user.userID === data.info.organizer) return true;
    return false;
  }
  rowUser(user, i, data) {
    return (
      <CardUser
        user={user}
        infoUser={this.props.infoUser}
        userConnected={this.props.userConnected}
        key={i}
        userID={this.props.userID}
      />
    );
  }
  openCondition(data) {
    if (!data) { return false; }
    if (!data.attendees) { return true; }
    if (Object.values(data.attendees).length < Number(data.info.maxAttendance)) {
      return true;
    }
    return false;
  }
  async addCalendar(data) {
    var permission = await getPermissionCalendar();
    await RNCalendarEvents.authorizeEventStore();
    if (!permission) { return true; }

    try {
      await RNCalendarEvents.saveEvent(data.info.name, {
        calendarId: data.objectID,
        startDate: moment(data.date.start).toISOString(),
        endDate: moment(data.date.end).toISOString(),
      });
    } catch (err) {
      return true;
    }
    return this.props.navigation.navigate('Alert', {
      close: true,
      textButton: 'Got it!',
      title: data.info.name + ' has been added to your personnal calendar.',
    });
  }
  eventInfo(data, sport, rule, league) {
    var level = Object.values(sport.level.list).filter(
      (level) => level.value === data.info.levelFilter,
    )[0];
    var levelOption =
      data.info.levelOption === 'equal'
        ? 'only'
        : data.info.levelOption === 'min'
        ? 'and above'
        : 'and below';
    return (
      <View style={styleApp.marginView}>
        <Row style={{marginTop: 20}}>
          <Col style={styleApp.center2}>
            <Text
              style={[
                styleApp.text,
                {
                  color: colors.primary,
                  marginTop: 0,
                  fontFamily: 'OpenSans-Bold',
                  fontSize: 18,
                },
              ]}>
              {Number(data.price.joiningFee) === 0
                ? 'Free entry'
                : '$' + data.price.joiningFee}
            </Text>
          </Col>
        </Row>

        <Text style={[styleApp.title, {marginTop: 15}]}>{data.info.name}</Text>

        <View style={[styleApp.divider2, {marginBottom: 20}]} />

        {this.rowImage(sport.icon, sport.text)}
        {this.rowImage(league.icon, league.text)}

        {this.rowIcon(
          this.dateTime(data.date.start, data.date.end),
          'calendar-alt',
          () => this.addCalendar(data),
        )}
        {data.date.recurrence !== '' && data.date.recurrence !== undefined
          ? this.rowIcon(
              this.title(
                data.date.recurrence.charAt(0).toUpperCase() +
                  data.date.recurrence.slice(1),
              ),
              'stopwatch',
            )
          : null}
        {this.rowIcon(this.title(data.location.address), 'map-marker-alt', () =>
          this.props.navigation.navigate('AlertAddress', {data: data.location}),
        )}
        {data.info.instructions !== ''
          ? this.rowIcon(this.title(data.info.instructions), 'parking')
          : null}

        <View style={[styleApp.divider2, {marginBottom: 25}]} />

        <Row style={{height: 90, marginTop: 0}}>
          <Col>
            {this.colIcon(
              Number(data.info.maxAttendance) === 1
                ? data.info.maxAttendance + ' player'
                : data.info.maxAttendance + ' players',
              'user-plus',
              false,
            )}
          </Col>
          <Col>
            {this.colIcon(
              level.value === '0' ? level.text : level.text.split('/')[0],
              'balance-scale',
              {title: level.title, subtitle: level.subtitle},
            )}
          </Col>
        </Row>

        <Row style={{height: 90, marginTop: 10}}>
          <Col>
            {this.colIcon(
              data.info.gender.charAt(0).toUpperCase() +
                data.info.gender.slice(1),
              data.info.gender === 'mixed'
                ? 'venus-mars'
                : data.info.gender === 'female'
                ? 'venus'
                : 'mars',
              false,
            )}
          </Col>
          <Col>
            {this.colIcon(rule.text, 'puzzle-piece', {
              title: rule.title,
              subtitle: rule.subtitle,
            })}
          </Col>
        </Row>
      </View>
    );
  }
  event(data) {
    // return <PlaceHolder />;
    if (data === undefined || this.state.loader) return <PlaceHolder />;
    var sport = this.props.sports.filter(
      (sport) => sport.value === data.info.sport,
    )[0];
    var league = Object.values(sport.typeEvent).filter(
      (item) => item.value === data.info.league,
    )[0];
    var rule = Object.values(league.rules).filter(
      (rule) => rule.value === data.info.rules,
    )[0];
    return (
      <View style={{marginLeft: 0, width: width, marginTop: 0}}>
        {this.eventInfo(data, sport, rule, league)}

        {/* {rule.coachNeeded ? (
          <View style={styleApp.viewHome}>
            <View style={styleApp.marginView}>
              <View style={[styleApp.divider2, {marginTop: 0}]} />
              <Text style={styleApp.text}>Instructor</Text>

              {this.state.loader ? (
                <FadeInView duration={300} style={{paddingTop: 10}}>
                  <PlaceHolder />
                </FadeInView>
              ) : data.coaches == undefined ? (
                <Text style={[styleApp.smallText, {marginTop: 5}]}>
                  No instructor has joined the event yet.
                </Text>
              ) : (
                <FadeInView duration={300} style={{marginTop: 10}}>
                  {Object.values(data.coaches).map((user, i) =>
                    this.rowUser(user, i, data),
                  )}
                </FadeInView>
              )}
            </View>
          </View>
        ) : null} */}

        <View style={[styleApp.marginView, {marginTop: 30}]}>
          <Text style={styleApp.text}>Players</Text>
          <View
            style={[styleApp.divider2, {marginTop: 20, marginBottom: 10}]}
          />
        </View>
        {this.state.loader ? (
          <FadeInView duration={300} style={{paddingTop: 10}}>
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
          </FadeInView>
        ) : !data.attendees ? (
          <Text style={[styleApp.smallText, {marginTop: 10}]}>
            No players has joined the event yet.
          </Text>
        ) : (
          <FadeInView duration={300} style={{marginTop: 0}}>
            {Object.values(data.attendees).map((user, i) =>
              this.rowUser(user, i, data),
            )}
          </FadeInView>
        )}

        {data.groups !== undefined ? (
          <View style={{marginTop: 35}}>
            <GroupsEvent groups={data.groups} />
          </View>
        ) : null}

        {data.discussions ? (
          <PostsView
            objectID={data.objectID}
            data={data}
            type="event"
            loader={this.state.loader}
            infoUser={this.props.infoUser}
          />
        ) : null}

        <View style={{height: sizes.heightFooterBooking + 50}} />
      </View>
    );
  }
  next(event) {
    if (!this.props.userConnected)
      return this.props.navigation.navigate('SignIn', {pageFrom: 'Event'});

    return this.props.navigation.navigate('Checkout', {
      data: {...event},
      coach: false,
      users: {
        [this.props.userID]: {
          id: this.props.userID,
          userID: this.props.userID,
          info: this.props.infoUser,
        },
      },
    });
  }
  async joinWaitlist(event) {
    if (!this.props.userConnected)
      return this.props.navigation.navigate('SignIn', {pageFrom: 'Event'});
    await firebase
      .database()
      .ref('events/' + event.objectID + '/waitlist')
      .push({
        userID: this.props.userID,
        date: new Date().toString(),
        nameUser:
          this.props.infoUser.firstname + ' ' + this.props.infoUser.lastname,
        nameEvent: event.info.name,
      });
    return this.props.navigation.navigate('Alert', {
      textButton: 'Got it!',
      title:
        'You are now waitlisted for the event. We will notify you if a spot becomes available.',
      close: true,
    });
  }
  waitlistCondition(event) {
    if (
      !this.openCondition(event) &&
      event.info.organizer !== this.props.userID
    ) {
      if (!event.attendees) return true;
      if (
        Object.values(event.attendees).filter(
          (user) => user.userID === this.props.userID,
        ).length === 0
      )
        return true;
    }
    return false;
  }
  userAlreadySubscribed(attendees) {
    if (!attendees) return true;
    if (
      Object.values(attendees).filter(
        (user) => user.userID === this.props.userID,
      ).length === 0
    )
      return true;
    return false;
  }
  coachAlreadySubscribed(coaches) {
    if (!coaches) return true;
    if (
      Object.values(coaches).filter((user) => user.userID === this.props.userID)
        .length === 0
    )
      return true;
    return false;
  }
  async refresh() {
    await this.setState({loader: true});
    return this.loadEvent(this.props.navigation.getParam('objectID'));
  }
  render() {
    var event = this.props.allEvents[
      this.props.navigation.getParam('objectID')
    ];
    const {goBack, dismiss} = this.props.navigation;
    return (
      <View style={{flex: 1}}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={!event ? '' : event.info.name}
          inputRange={[50, 80]}
          initialBorderColorIcon={colors.grey}
          initialBackgroundColor={'transparent'}
          typeIcon2={'moon'}
          sizeIcon2={17}
          initialTitleOpacity={0}
          icon1="arrow-left"
          icon2="share"
          iconOffset="share"
          clickButton2={() =>
            this.props.navigation.navigate('Contacts', {
              openPageLink: 'openEventPage',
              pageTo: 'Group',
              objectID: event.objectID,
              pageFrom: 'Event',
              data: {...event, eventID: event.objectID},
            })
          }
          // clickButton1={() => this.props.navigation.navigate(this.props.navigation.getParam('pageFrom'))}
          clickButton1={() => dismiss()}
          clickButtonOffset={() => this.setState({editMode: !this.state.editMode})}
        />

        <ParalaxScrollView
          setState={(val) => this.setState(val)}
          image={
            <TouchableOpacity
              activeOpacity={0.3}
              style={{height: 280, width: '100%'}}
              onPress={() => {
                this.props.navigation.navigate('AlertAddress', {
                  data: event.location,
                });
              }}>
              {event === undefined ? (
                <View
                  style={{
                    width: '100%',
                    height: 300,
                    borderRadius: 0,
                    backgroundColor: colors.off,
                  }}
                />
              ) : (
                <AsyncImage
                  style={{width: '100%', height: 320, borderRadius: 0}}
                  mainImage={event.images[0]}
                  imgInitial={event.images[0]}
                />
              )}
              <View
                style={{
                  position: 'absolute',
                  left: width / 2 - 15,
                  top: 280 / 2 - 5,
                }}>
                <AllIcons
                  name="map-marker-alt"
                  type="font"
                  size={28}
                  color={colors.blue}
                />
              </View>
            </TouchableOpacity>
          }
          content={() => this.event(event)}
          header={false}
          refresh={() => this.refresh()}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          initialColorIcon={colors.title}
          colorRefreshControl={colors.title}
        />

        {!event ? null : (
          <FadeInView duration={300} style={styleApp.footerBooking}>
            {this.waitlistCondition(event) ? (
              <Button2
                icon={'next'}
                backgroundColor="green"
                onPressColor={colors.greenClick}
                styleButton={{marginLeft: 20, width: width - 40}}
                disabled={false}
                text="Join the waitlist"
                loader={false}
                click={() => this.joinWaitlist(event)}
              />
            ) : this.openCondition(event) &&
              this.userAlreadySubscribed(event.attendees) &&
              this.coachAlreadySubscribed(event.coaches) ? (
              <Button2
                icon={'next'}
                backgroundColor="green"
                onPressColor={colors.greenClick}
                styleButton={{marginLeft: 20, width: width - 40}}
                disabled={false}
                text="Join the event"
                loader={false}
                click={() => this.next(event)}
              />
            ) : null}
          </FadeInView>
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    sports: state.globaleVariables.sports.list,
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    userConnected: state.user.userConnected,
    allEvents: state.events.allEvents,
  };
};

export default connect(mapStateToProps, {eventsAction})(EventPage);
