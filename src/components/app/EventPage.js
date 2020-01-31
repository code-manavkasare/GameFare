import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Button,
  TextInput,
} from 'react-native';
import {connect} from 'react-redux';
import {eventsAction} from '../../actions/eventsActions';
import firebase from 'react-native-firebase';
import NavigationService from '../../../NavigationService';
import {
  editEvent,
  removePlayerFromEvent,
  nextGender,
  nextRule,
  nextLevelIndex,
} from '../functions/editEvent';

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
import {arrayAttendees} from '../functions/createEvent';
import PlaceHolder from '../placeHolders/EventPage';

import ParallaxScrollView from 'react-native-parallax-scroll-view';
import HeaderBackButton from '../layout/headers/HeaderBackButton';

const noEdit = {
  editMode: false,
  editPrice: '',
  editPriceClicked: false,
  editName: '',
  editStart: '',
  editEnd: '',
  editLocation: null,
  editGender: '',
  editMaxAttendance: -1,
  editLevelIndex: -1,
  editRule: '',
};

class EventPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      event: null,
      ...noEdit,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.event = this.event.bind(this);
  }
  async componentDidMount() {
    console.log('eventpageload', this.props.navigation.getParam('objectID'));
    this.loadEvent(this.props.navigation.getParam('objectID'));
  }
  async componentWillUnmount() {
    if (this.state.event) {
      firebase
        .database()
        .ref('events/' + this.state.data.objectID)
        .off();
    }
  }
  async loadEvent(objectID) {
    const that = this;
    firebase
      .database()
      .ref('events/' + objectID)
      .on('value', async function(snap) {
        let event = snap.val();
        event.objectID = objectID;
        if (event.allAttendees.includes(that.props.userID)) {
          await that.props.eventsAction('setAllEvents', {[objectID]: event});
        }
        that.setState({event: event, loader: false});
      });
  }
  getSportLeagueRule(event) {
    const sport = this.props.sports.filter(
      (s) => s.value === event.info.sport,
    )[0];
    const league = Object.values(sport.typeEvent).filter(
      (l) => l.value === event.info.league,
    )[0];
    const rule = Object.values(league.rules).filter(
      (r) =>
        r.value ===
        (this.state.editRule === noEdit.editRule
          ? event.info.rules
          : this.state.editRule),
    )[0];
    return {sport: sport, league: league, rule: rule};
  }
  nextGender(data, inc) {
    if (this.state.editGender === noEdit.editGender) {
      this.setState({editGender: nextGender(data.info.gender, inc)});
    } else {
      this.setState({editGender: nextGender(this.state.editGender, inc)});
    }
  }
  nextRule(data, inc) {
    const {league} = this.getSportLeagueRule(data);
    if (this.state.editRule === noEdit.editRule) {
      this.setState({editRule: nextRule(data.info.rules, league, inc)});
    } else {
      this.setState({editRule: nextRule(this.state.editRule, league, inc)});
    }
  }
  nextLevel(data, inc) {
    const {sport} = this.getSportLeagueRule(data);
    const levels = sport.level.list;
    if (this.state.editLevelIndex !== noEdit.editLevelIndex) {
      this.setState({
        editLevelIndex: nextLevelIndex(this.state.editLevelIndex, levels, inc),
      });
    } else {
      this.setState({
        editLevelIndex: nextLevelIndex(data.info.levelFilter, levels, inc),
      });
    }
  }

  header(event) {
    const {dismiss} = this.props.navigation;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        textHeader={''}
        inputRange={[50, 80]}
        initialBorderColorIcon={colors.grey}
        initialBackgroundColor={'transparent'}
        initialTitleOpacity={0}
        icon1="arrow-left"
        icon2="share"
        typeIcon2="moon"
        sizeIcon2={17}
        iconOffset="pen"
        colorIconOffset={this.state.editMode ? colors.blue : 'white'}
        typeIconOffset="font"
        clickButton2={() => this.goToShareEvent(event)}
        clickButton1={() => dismiss()}
        clickButtonOffset={
          this.userIsOrganizer(event)
            ? () =>
                this.state.editMode
                  ? this.setState({...noEdit})
                  : this.setState({editMode: true})
            : undefined
        }
      />
    );
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
        click={() => (alert ? alert() : null)}
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
  title(text) {
    return <Text style={styleApp.input}>{text}</Text>;
  }
  dateTime(start, end) {
    return <DateEvent start={start} end={end} />;
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
        objectID={data.objectID}
        key={i}
        userID={this.props.userID}
        removable={data.info.organizer !== user.id && this.state.editMode}
        removeFunc={() => this.askRemovePlayer(user, data)}
        type="event"
        admin={data.info.organizer === this.props.userID}
      />
    );
  }
  openCondition(data) {
    if (!data) {
      return false;
    }
    if (!data.attendees) {
      return true;
    }
    if (
      Object.values(data.attendees).length < Number(data.info.maxAttendance)
    ) {
      return true;
    }
    return false;
  }
  async addCalendar(data) {
    var permission = await getPermissionCalendar();
    await RNCalendarEvents.authorizeEventStore();
    if (!permission) {
      return true;
    }

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
      title: data.info.name + ' has been added to your calendar.',
    });
  }
  editPrice(data) {
    if (this.state.editMode) {
      return (
        <TextInput
          style={styles.eventTitle}
          placeholder={'Entry Fee: $' + data.price.joiningFee}
          returnKeyType={'done'}
          keyboardType={'phone-pad'}
          underlineColorAndroid="rgba(0,0,0,0)"
          autoCorrect={true}
          onChangeText={(text) => this.setState({editPrice: text.split('$')[1]})}
          onFocus={() => {
            this.setState({editPriceClicked: true});
          }}
          value={this.state.editPriceClicked
            ? 'Entry Fee: $' + this.state.editPrice
            : ''
          }
        />
      );
    } else {
      return (
        <Text style={styles.eventTitle}>
          {Number(data.price.joiningFee) === 0
            ? 'Free entry'
            : '$' + data.price.joiningFee}
        </Text>
      );
    }
  }
  editName(data) {
    if (this.state.editMode) {
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => this.nameInputRef.focus()}>
          <TextInput
            style={styleApp.title}
            placeholder={String(data.info.name)}
            returnKeyType={'done'}
            ref={(input) => {
              this.nameInputRef = input;
            }}
            underlineColorAndroid="rgba(0,0,0,0)"
            autoCorrect={true}
            onChangeText={(text) => this.setState({editName: text})}
            value={this.state.editName}
          />
        </TouchableOpacity>
      );
    } else {
      return <Text style={styleApp.title}>{data.info.name}</Text>;
    }
  }
  editRowIcon(component, icon, alert, edit) {
    return (
      <Row>
        <Col size={85}>
          <ButtonColor
            color="white"
            onPressColor={colors.off}
            click={() => (alert ? alert() : null)}
            style={{
              paddingTop: 10,
              paddingBottom: 10,
              flex: 1,
              width: '100%',
              borderRadius: 3,
              marginBottom: 5,
            }}
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
          />
        </Col>
        {this.state.editMode && edit && (
          <Col size={15} style={styleApp.center}>
            <ButtonColor
              view={() => {
                return <Text style={styleApp.text}>Edit</Text>;
              }}
              click={() => edit()}
            />
          </Col>
        )}
      </Row>
    );
  }
  editColIcon(text, icon, clickUp, clickDown, clickIcon) {
    return (
      <Row
        style={[
          styleApp.center,
          {height: 90, marginTop: 0, borderRadius: 3, width: '100%'},
        ]}
        size={50}>
        {this.state.editMode ? (
          <Col
            size={15}
            style={{justifyContent: 'space-around', alignItems: 'flex-end'}}>
            <Row size={20}>
              <ButtonColor
                view={() => {
                  return (
                    <AllIcons
                      name="keyboard-arrow-up"
                      color={colors.greyDark}
                      size={15}
                      type="mat"
                    />
                  );
                }}
                click={() => clickUp()}
                color="white"
                onPressColor={colors.off}
              />
            </Row>
            <Row size={20}>
              <ButtonColor
                view={() => {
                  return (
                    <AllIcons
                      name="keyboard-arrow-down"
                      color={colors.greyDark}
                      size={15}
                      type="mat"
                    />
                  );
                }}
                click={() => clickDown()}
                color="white"
                onPressColor={colors.off}
              />
            </Row>
          </Col>
        ) : (
          <Col size={15} />
        )}
        <Col size={100} style={[styleApp.center, {alignItems: 'flex-start'}]}>
          <ButtonColor
            color="white"
            style={[{height: 90, marginTop: 0, borderRadius: 3, width: '100%'}]}
            onPressColor={colors.off}
            view={() => {
              return (
                <View style={styleApp.center}>
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
              clickIcon
                ? this.props.navigation.navigate('Alert', {
                    close: true,
                    title: clickIcon.title,
                    subtitle: clickIcon.subtitle,
                    textButton: 'Close',
                  })
                : null
            }
          />
        </Col>
        <Col size={30} />
      </Row>
    );
  }
  async saveEdits(data) {
    // update event data
    const newData = {
      ...data,
      price: {
        ...data.price,
        joiningFee:
          this.state.editPrice === ''
            ? data.price.joiningFee
            : Number(this.state.editPrice),
      },
      info: {
        ...data.info,
        name: this.state.editName === '' ? data.info.name : this.state.editName,
        maxAttendance:
          this.state.editMaxAttendance === -1
            ? data.info.maxAttendance
            : this.state.editMaxAttendance,
        gender:
          this.state.editGender === ''
            ? data.info.gender
            : this.state.editGender,
        rules:
          this.state.editRule === '' ? data.info.rules : this.state.editRule,
        levelFilter:
          this.state.editLevelIndex === -1
            ? data.info.levelFilter
            : this.state.editLevelIndex,
      },
      date: {
        ...data.date,
        start:
          this.state.editStart === '' ? data.date.start : this.state.editStart,
        end: this.state.editEnd === '' ? data.date.end : this.state.editEnd,
      },
      location: this.state.editLocation
        ? this.state.editLocation
        : data.location,
    };
    // firebase update
    await editEvent(newData, () => console.log('edit event failed'));
    // local update
    await this.props.eventsAction('setAllEvents', {
      [newData.objectID]: newData,
    });
    this.setState({
      ...this.state,
      ...noEdit,
    });
  }
  eventInfo(data, sport, rule, league) {
    var level = Object.values(sport.level.list).filter(
      (level) =>
        level.value ===
        (this.state.editLevelIndex === -1
          ? data.info.levelFilter
          : this.state.editLevelIndex),
    )[0];
    return (
      <View style={styleApp.marginView}>
        <Row style={{marginTop: 20}}>
          <Col style={styleApp.center2}>{this.editPrice(data)}</Col>
        </Row>

        <Row style={{marginTop: 15}}>
          <Col style={styleApp.center2}>{this.editName(data)}</Col>
        </Row>
        <View style={[styleApp.divider2, {marginBottom: 20}]} />

        {this.rowImage(sport.icon, sport.text)}
        {this.rowImage(league.icon, league.text)}

        {this.editRowIcon(
          this.dateTime(data.date.start, data.date.end),
          'calendar-alt',
          () => this.addCalendar(data),
          () =>
            this.props.navigation.navigate('Date', {
              startDate: data.date.start,
              endDate: data.date.end,
              recurrence: data.date.recurrence,
              close: () =>
                this.props.navigation.navigate(
                  this.props.navigation.state.routeName,
                ),
              onGoBack: (datetime) => {
                this.props.navigation.navigate(
                  this.props.navigation.state.routeName,
                );
                this.setState({
                  editStart: datetime.startDate,
                  editEnd: datetime.endDate,
                });
              },
            }),
        )}
        {data.date.recurrence !== '' && data.date.recurrence
          ? this.rowIcon(
              this.title(
                data.date.recurrence.charAt(0).toUpperCase() +
                  data.date.recurrence.slice(1),
              ),
              'stopwatch',
            )
          : null}

        {this.editRowIcon(
          this.title(data.location.address),
          'map-marker-alt',
          () =>
            this.props.navigation.navigate('AlertAddress', {
              data: data.location,
            }),
          () =>
            this.props.navigation.navigate('Location', {
              location: data.location,
              pageFrom: this.props.navigation.state.routeName,
              onGoBack: (location) => {
                this.props.navigation.navigate(
                  this.props.navigation.state.routeName,
                );
                this.setState({editLocation: location});
              },
            }),
        )}
        {data.info.instructions !== ''
          ? this.rowIcon(this.title(data.info.instructions), 'parking')
          : null}

        <View style={[styleApp.divider2, {marginBottom: 25}]} />

        <Row style={{height: 90, marginTop: 0}}>
          <Col>
            {this.state.editMaxAttendance === -1
              ? this.editColIcon(
                  data.info.maxAttendance === 1
                    ? data.info.maxAttendance + ' player'
                    : data.info.maxAttendance + ' players',
                  'user-plus',
                  () =>
                    this.setState({
                      editMaxAttendance: data.info.maxAttendance + 1,
                    }),
                  () =>
                    data.info.maxAttendance === 1
                      ? null
                      : this.setState({
                          editMaxAttendance: data.info.maxAttendance - 1,
                        }),
                  false,
                )
              : this.editColIcon(
                  this.state.maxAttendance === 1
                    ? this.state.editMaxAttendance + ' player'
                    : this.state.editMaxAttendance + ' players',
                  'user-plus',
                  () =>
                    this.setState({
                      editMaxAttendance: this.state.editMaxAttendance + 1,
                    }),
                  () =>
                    this.state.editMaxAttendance === 1
                      ? null
                      : this.setState({
                          editMaxAttendance: this.state.editMaxAttendance - 1,
                        }),
                  false,
                )}
          </Col>
          <Col>
            {this.editColIcon(
              level.value === '0' ? level.text : level.text.split('/')[0],
              'balance-scale',
              () => this.nextLevel(data, 1),
              () => this.nextLevel(data, -1),
              {title: level.title, subtitle: level.subtitle},
            )}
          </Col>
        </Row>

        <Row style={{height: 90, marginTop: 10}}>
          <Col>
            {this.state.editGender === ''
              ? this.editColIcon(
                  data.info.gender.charAt(0).toUpperCase() +
                    data.info.gender.slice(1),
                  data.info.gender === 'mixed'
                    ? 'venus-mars'
                    : data.info.gender === 'female'
                    ? 'venus'
                    : 'mars',
                  () => this.nextGender(data, 1),
                  () => this.nextGender(data, -1),
                  false,
                )
              : this.editColIcon(
                  this.state.editGender.charAt(0).toUpperCase() +
                    this.state.editGender.slice(1),
                  this.state.editGender === 'mixed'
                    ? 'venus-mars'
                    : this.state.editGender === 'female'
                    ? 'venus'
                    : 'mars',
                  () => this.nextGender(data, 1),
                  () => this.nextGender(data, -1),
                  false,
                )}
          </Col>
          <Col>
            {this.editColIcon(
              rule.text,
              'puzzle-piece',
              () => this.nextRule(data, 1),
              () => this.nextRule(data, -1),
              {title: rule.title, subtitle: rule.subtitle},
            )}
          </Col>
        </Row>
      </View>
    );
  }
  event(event, loader, userID) {
    if (!event || loader) return <PlaceHolder />;
    const attendees = arrayAttendees(
      event.attendees,
      userID,
      event.info.organizer,
    );
    const {sport, league, rule} = this.getSportLeagueRule(event);
    return (
      <View style={{marginLeft: 0, width: width, marginTop: 0}}>
        {this.eventInfo(event, sport, rule, league)}

        <View style={[styleApp.marginView, {marginTop: 30}]}>
          <Text style={styleApp.text}>Players</Text>
          <View
            style={[styleApp.divider2, {marginTop: 20, marginBottom: 10}]}
          />
        </View>
        {loader ? (
          <FadeInView duration={300} style={{paddingTop: 10}}>
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
          </FadeInView>
        ) : attendees.length === 0 ? (
          <Text
            style={[
              styleApp.smallText,
              {marginTop: 10, marginLeft: 20, width: width - 40},
            ]}>
            No players has joined the event yet.
          </Text>
        ) : (
          attendees.map((user, i) => this.rowUser(user, i, event))
        )}

        {event.discussions && this.userAlreadySubscribed(event.attendees) && (
          <PostsView
            objectID={event.objectID}
            data={event}
            type="event"
            loader={loader}
            infoUser={this.props.infoUser}
          />
        )}

        {event.groups && (
          <View style={{marginTop: 35}}>
            <GroupsEvent groups={event.groups} />
          </View>
        )}

        

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
  async joinWaitlist(data) {
    if (!this.props.userConnected) return NavigationService.navigate('SignIn');
    return this.props.navigation.navigate('Checkout', {
      data: {...data},
      coach: false,
      waitlist: true,
      users: {
        [this.props.userID]: {
          id: this.props.userID,
          userID: this.props.userID,
          info: this.props.infoUser,
        },
      },
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
    if (!attendees) return false;
    if (
      Object.values(attendees).filter(
        (user) => user.userID === this.props.userID,
      ).length === 0
    )
      return false;
    return true;
  }
  userIsOrganizer(event) {
    if (!event) {
      return false;
    }
    return event.info.organizer === this.props.userID;
  }
  askRemovePlayer(player, data) {
    this.props.navigation.navigate('AlertYesNo', {
      textYesButton: 'Yes',
      textNoButton: 'No',
      title:
        'Are you sure you want to remove ' +
        player.info.firstname +
        ' ' +
        player.info.lastname +
        '?',
      icon: undefined,
      yesClick: () => this.removePlayer(player, data),
      noClick: () => null,
      onGoBack: () => this.props.navigation.navigate('Event'),
    });
  }
  async removePlayer(player, data) {
    let newData = {...data};
    await removePlayerFromEvent(player, newData).catch((err) => {
      console.log(err.message);
    });
    for (var i in newData.allAttendees) {
      if (newData.allAttendees[i] === player.id) {
        delete newData.allAttendees[i];
        break;
      }
    }
    delete newData.attendees[player.id];
    await this.props.eventsAction('setAllEvents', {
      [newData.objectID]: newData,
    });
  }
  async refresh() {
    await this.setState({loader: true});
    return this.loadEvent(this.props.navigation.getParam('objectID'));
  }

  goToShareEvent = (event) => {
    if (!event) {
      return;
    }
    if (!this.props.userConnected) {
      return this.props.navigation.navigate('SignIn');
    }
    return this.props.navigation.navigate('Contacts', {
      openPageLink: 'openEventPage',
      objectID: event.objectID,
      pageFrom: 'Event',
      data: {...event, eventID: event.objectID},
    });
  };

  bottomActionButton(title, click) {
    return (
      <Button2
        icon={'next'}
        backgroundColor="green"
        onPressColor={colors.greenClick}
        styleButton={styles.buttonBottom}
        disabled={false}
        text={title}
        loader={false}
        click={() => click()}
      />
    );
  }

  render() {
    const {event, editMode, loader} = this.state;
    const {userID} = this.props;
    return (
      <View style={{flex: 1}}>
        {this.header(event)}
        <ParallaxScrollView
          style={styles.paralaxView}
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
            return (
              <View style={styles.viewMainImg}>
                {!event ? (
                  <View style={styles.viewImage} />
                ) : (
                  <AsyncImage
                    style={styles.mainImg}
                    mainImage={event.images[0]}
                    imgInitial={event.images[0]}
                  />
                )}
                <View style={styles.iconMap}>
                  <AllIcons
                    name="map-marker-alt"
                    type="font"
                    size={28}
                    color={colors.blue}
                  />
                </View>
              </View>
            );
          }}
          parallaxHeaderHeight={280}>
          {this.event(event, loader, userID)}
        </ParallaxScrollView>

        {!event ? null : (
          <FadeInView duration={300} style={styleApp.footerBooking}>
            {editMode
              ? this.bottomActionButton('Save edits', () =>
                  this.saveEdits(event),
                )
              : this.waitlistCondition(event)
              ? this.bottomActionButton('Join the waitlist', () =>
                  this.joinWaitlist(event),
                )
              : this.openCondition(event) &&
                !this.userAlreadySubscribed(event.attendees)
              ? this.bottomActionButton('Join the event', () =>
                  this.next(event),
                )
              : null}
          </FadeInView>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  paralaxView: {
    height: height,
    backgroundColor: 'white',
    overflow: 'hidden',
    position: 'absolute',
  },
  eventTitle: {
    color: colors.primary,
    marginTop: 0,
    fontFamily: 'OpenSans-Bold',
    fontSize: 18,
  },
  iconMap: {
    position: 'absolute',
    left: width / 2 - 15,
    top: 280 / 2 - 5,
  },
  viewMainImg: {height: 280, width: '100%'},
  viewImage: {
    width: '100%',
    height: 300,
    borderRadius: 0,
    backgroundColor: colors.off,
  },
  mainImg: {width: '100%', height: 320},
  buttonBottom: {marginLeft: 20, width: width - 40},
});

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
