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

import {indexEvents} from '../database/algolia';
import PlaceHolder from '../placeHolders/EventPage';

import ParalaxScrollView from '../layout/scrollViews/ParalaxScrollView';
import HeaderBackButton from '../layout/headers/HeaderBackButton';

class EventPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    if (
      this.props.allEvents[this.props.navigation.getParam('objectID')] ==
      undefined
    )
      this.loadEvent(this.props.navigation.getParam('objectID'));
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
  openProfile(user) {
    // console.log('user!! ')
    // console.log(user)
    // var coach = 'Joined the event as a player'
    // if (user.coach) {
    //   coach = 'Joined the event as an instructor'
    // }
    // var level = ''
    // if (user.captainInfo.level == '' || user.captainInfo.level == undefined) {
    //   level = "Unclassified yet"
    // } else {
    //   level = Object.values(this.props.sports).filter(sport => sport.value == this.props.navigation.getParam('data').info.sport)[0].level.list[user.captainInfo.level].text
    // }
    // var subtitle = '- Level • '+ level +'\n- '+coach
    // if (user.coach) {
    //   subtitle = '- ' + coach
    // }
    // this.props.navigation.navigate('Alert',{textButton:'Close',title:user.info.firstname + ' ' + user.info.lastname,subtitle:subtitle,close:true,onGoBack:() => this.props.navigation.navigate('Event')})
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
    if (user.coach || user.userID == data.info.organizer) return true;
    return false;
  }
  rowUser(user, i, data) {
    return (
      <TouchableOpacity
        key={i}
        style={[
          {
            paddingTop: 10,
            paddingBottom: 10,
            flex: 1,
            marginTop: 10,
            minHeight: 50,
            borderBottomWidth: 0,
            backgroundColor: 'white',
            borderColor: colors.off,
          },
        ]}
        activeOpacity={1}
        onPress={() => this.openProfile(user)}>
        <Row>
          <Col size={15} style={styleApp.center}>
            {user.info.picture != undefined ? (
              <AsyncImage
                style={{width: 35, height: 35, borderRadius: 17.5}}
                mainImage={user.info.picture}
                imgInitial={user.info.picture}
              />
            ) : (
              <View
                style={[
                  styleApp.center,
                  {
                    height: 30,
                    width: 30,
                    borderRadius: 15,
                    backgroundColor: colors.off2,
                    borderWidth: 1,
                    borderColor: colors.off,
                  },
                ]}>
                <Text style={[styleApp.input, {fontSize: 11}]}>
                  {user.info.firstname[0] + user.info.lastname[0]}
                </Text>
              </View>
            )}
          </Col>
          <Col size={55} style={[styleApp.center2, {paddingLeft: 10}]}>
            <Text style={styleApp.text}>
              {user.info.firstname} {user.info.lastname}
            </Text>
          </Col>
          <Col
            size={10}
            style={styleApp.center3}
            activeOpacity={0.7}
            onPress={() =>
              !this.allowCall(user, data)
                ? null
                : this.props.navigation.navigate('AlertCall', {
                    textButton: 'Close',
                    title: user.info.firstname + ' ' + user.info.lastname,
                    subtitle: user.info.phoneNumber,
                    close: true,
                    icon: (
                      <AllIcons
                        name="envelope"
                        type="font"
                        color={colors.green}
                        size={17}
                      />
                    ),
                  })
            }>
            {this.allowCall(user, data) ? (
              <AllIcons
                name="envelope"
                type="font"
                color={colors.green}
                size={17}
              />
            ) : null}
          </Col>

          {user.userID == data.info.organizer ? (
            <Col
              size={20}
              style={styleApp.center}
              activeOpacity={0.7}
              onPress={() =>
                this.props.navigation.navigate('Alert', {
                  textButton: 'Close',
                  close: true,
                  onGoBack: () => this.props.navigation.navigate('Event'),
                  title:
                    user.info.firstname +
                    ' ' +
                    user.info.lastname +
                    ' is the organizer of the event.',
                  icon: (
                    <AllIcons
                      name="bullhorn"
                      color={colors.blue}
                      type="font"
                      size={16}
                    />
                  ),
                })
              }>
              <AllIcons
                name="bullhorn"
                color={colors.blue}
                type="font"
                size={16}
              />
            </Col>
          ) : user.status == 'confirmed' ? (
            <Col size={20} style={styleApp.center}></Col>
          ) : user.status == 'rejected' ? (
            <Col
              size={20}
              style={styleApp.center}
              activeOpacity={0.7}
              onPress={() =>
                this.props.navigation.navigate('Alert', {
                  textButton: 'Got it!',
                  title: 'This user has been rejected by the organizer.',
                  subtitle: user.info.firstname + ' ' + user.info.lastname,
                  close: true,
                  onGoBack: () => this.props.navigation.navigate('Event'),
                  icon: (
                    <AllIcons
                      name="close"
                      type="mat"
                      color={colors.primary}
                      size={20}
                    />
                  ),
                })
              }>
              <AllIcons
                name="close"
                type="mat"
                color={colors.primary}
                size={20}
              />
            </Col>
          ) : (
            <Col
              size={20}
              style={styleApp.center}
              activeOpacity={0.7}
              onPress={() =>
                this.props.navigation.navigate('Alert', {
                  textButton: 'Got it!',
                  title: "This user is waiting for the organizer's aproval.",
                  subtitle: user.info.firstname + ' ' + user.info.lastname,
                  close: true,
                  onGoBack: () => this.props.navigation.navigate('Event'),
                  icon: (
                    <AllIcons
                      name="clock"
                      type="font"
                      color={colors.secondary}
                      size={20}
                    />
                  ),
                })
              }>
              <AllIcons
                name="clock"
                type="font"
                color={colors.secondary}
                size={20}
              />
            </Col>
          )}
        </Row>
      </TouchableOpacity>
    );
  }
  openCondition(data) {
    if (data == undefined) return false;
    if (data.attendees == undefined) return true;
    if (Object.values(data.attendees).length < Number(data.info.maxAttendance))
      return true;
    return false;
  }
  async addCalendar(data) {
    console.log('add to calendar');
    console.log(data);
    console.log({
      id: data.objectID,
      title: data.info.name,
      calendarId: data.objectID,
      startDate: moment(data.date.start)
        .toISOString()
        .toString(),
      endDate: '2017-08-19T19:26:00.000Z',
    });
    var permission = await getPermissionCalendar();
    await RNCalendarEvents.authorizeEventStore();
    if (!permission) return true;

    try {
      await RNCalendarEvents.saveEvent(data.info.name, {
        calendarId: data.objectID,
        startDate: moment(data.date.start).toISOString(),
        endDate: moment(data.date.end).toISOString(),
      });
    } catch (err) {
      console.log('errorrrr');
      console.log(err);
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
      level => level.value == data.info.levelFilter,
    )[0];
    var levelOption =
      data.info.levelOption == 'equal'
        ? 'only'
        : data.info.levelOption == 'min'
        ? 'and above'
        : 'and below';
    console.log('level');
    console.log(data);
    console.log(rule);
    return (
      <View style={styleApp.marginView}>
        <Row style={{marginTop: 20}}>
          <Col size={75} style={styleApp.center2}>
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
              {Number(data.price.joiningFee) == 0
                ? 'Free entry'
                : '$' + data.price.joiningFee}
            </Text>
          </Col>
          <Col
            size={25}
            style={styleApp.center3}
            activeOpacity={0.7}
            onPress={() =>
              this.openAlert(
                this.openCondition(data)
                  ? 'The subscribtions for ' + data.info.name + ' are open.'
                  : 'The subscribtions for ' + data.info.name + ' are closed.',
                this.openView(data),
              )
            }>
            {this.openView(data)}
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
        {data.date.recurrence != '' && data.date.recurrence != undefined
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
        {data.info.instructions != ''
          ? this.rowIcon(this.title(data.info.instructions), 'parking')
          : null}

        <View style={[styleApp.divider2, {marginBottom: 25}]} />

        <Row style={{height: 90, marginTop: 0}}>
          <Col>
            {this.colIcon(
              Number(data.info.maxAttendance) == 1
                ? data.info.maxAttendance + ' player'
                : data.info.maxAttendance + ' players',
              'user-plus',
              false,
            )}
          </Col>
          <Col>
            {this.colIcon(
              level.value == '0' ? level.text : level.text.split('/')[0],
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
              data.info.gender == 'mixed'
                ? 'venus-mars'
                : data.info.gender == 'female'
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
    if (data == undefined || this.state.loader) return <PlaceHolder />;
    console.log('data event ');
    console.log(data);
    var sport = this.props.sports.filter(
      sport => sport.value == data.info.sport,
    )[0];
    console.log('sport');
    console.log(sport);
    var league = Object.values(sport.typeEvent).filter(
      item => item.value == data.info.league,
    )[0];
    console.log('league');
    console.log(league);
    var rule = Object.values(league.rules).filter(
      rule => rule.value == data.info.rules,
    )[0];
    console.log(data);
    console.log(rule);
    return (
      <View style={{marginLeft: 0, width: width, marginTop: 0}}>
        {/* {this.imageMap(data)} */}
        {this.eventInfo(data, sport, rule, league)}

        {rule.coachNeeded ? (
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
        ) : null}

        <View style={[styleApp.marginView, {marginTop: 30}]}>
          <Text style={styleApp.text}>Players</Text>
          <View
            style={[styleApp.divider2, {marginTop: 20, marginBottom: 10}]}
          />

          {this.state.loader ? (
            <FadeInView duration={300} style={{paddingTop: 10}}>
              <PlaceHolder />
              <PlaceHolder />
              <PlaceHolder />
            </FadeInView>
          ) : data.attendees == undefined ? (
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
        </View>

        {data.groups != undefined ? (
          <View style={{marginTop: 35}}>
            <GroupsEvent groups={data.groups} />
          </View>
        ) : null}

        <View style={{height: sizes.heightFooterBooking + 50}} />
      </View>
    );
  }
  next(event, sport, rule) {
    if (!this.props.userConnected)
      return this.props.navigation.navigate('SignIn', {pageFrom: 'Event'});
    if (
      this.props.infoUser.coach == true &&
      this.props.infoUser.coachVerified == true &&
      event.info.player == true &&
      rule.coachNeeded
    ) {
      return this.props.navigation.navigate('Coach', {
        pageFrom: 'event',
        data: event,
      });
    }
    // return this.props.navigation.navigate('AlertAddUsers',{
    //   data:event,
    //   coach:false
    // })
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
      if (event.attendees == undefined) return true;
      if (
        Object.values(event.attendees).filter(
          user => user.userID === this.props.userID,
        ).length == 0
      )
        return true;
    }
    return false;
  }
  userAlreadySubscribed(attendees) {
    if (attendees == undefined) return true;
    if (
      Object.values(attendees).filter(user => user.userID == this.props.userID)
        .length == 0
    )
      return true;
    return false;
  }
  coachAlreadySubscribed(coaches) {
    if (coaches == undefined) return true;
    if (
      Object.values(coaches).filter(user => user.userID == this.props.userID)
        .length == 0
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
    console.log('event est la ');
    console.log(event);
    const {goBack, dismiss} = this.props.navigation;
    return (
      <View style={{flex: 1}}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={event == undefined ? '' : event.info.name}
          inputRange={[50, 80]}
          initialBorderColorIcon={colors.grey}
          initialBackgroundColor={'transparent'}
          typeIcon2={'moon'}
          sizeIcon2={17}
          initialTitleOpacity={0}
          icon1="arrow-left"
          icon2="share"
          clickButton2={() =>
            this.props.navigation.navigate('Contacts', {
              openPageLink: 'openEventPage',
              pageTo: 'Group',
              objectID: event.objectID,
              pageFrom: 'Event',
              pageFrom: 'Event',
              data: {...event, eventID: event.objectID},
            })
          }
          // clickButton1={() => this.props.navigation.navigate(this.props.navigation.getParam('pageFrom'))}
          clickButton1={() => dismiss()}
        />

        <ParalaxScrollView
          setState={val => this.setState(val)}
          image={
            <TouchableOpacity
              activeOpacity={0.3}
              style={{height: 280, width: '100%'}}
              onPress={() => {
                this.props.navigation.navigate('AlertAddress', {
                  data: event.location,
                });
              }}>
              {event == undefined ? (
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

        {event == undefined ? null : (
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
                click={() => this.next(event, sport, rule)}
              />
            ) : null}
          </FadeInView>
        )}
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    sports: state.globaleVariables.sports.list,
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    userConnected: state.user.userConnected,
    allEvents: state.events.allEvents,
  };
};

export default connect(mapStateToProps, {eventsAction})(EventPage);
