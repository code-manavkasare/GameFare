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
import {messageAction} from '../../actions/messageActions';
import firebase from 'react-native-firebase';
import NavigationService from '../../../NavigationService';
import {
  editEvent,
  removePlayerFromEvent,
  nextGender,
  nextRule,
  nextLevelIndex,
} from '../functions/editEvent';
import {
  addMemberDiscussion,
  removeMemberDiscussion,
} from '../functions/createEvent';

import RNCalendarEvents from 'react-native-calendar-events';
import {getPermissionCalendar, isDatePast} from '../functions/date';
import moment from 'moment';
import ramda from 'ramda';

const {height, width} = Dimensions.get('screen');
import colors from '../style/colors';
import styleApp from '../style/style';
import sizes from '../style/sizes';
import {Grid, Row, Col} from 'react-native-easy-grid';
import FadeInView from 'react-native-fade-in-view';

import AsyncImage from '../layout/image/AsyncImage';

import AllIcons from '../layout/icons/AllIcons';
import DateEvent from './elementsEventCreate/DateEvent';
import {date} from '../layout/date/date';
import Button2 from '../layout/buttons/Button';
import ButtonColor from '../layout/Views/Button';
import GroupsEvent from './elementsGroupPage/GroupsEvent';

import PostsView from './elementsGroupPage/PostsView';
import ResultSection from './elementsCreateChallenge/ResultSection';

import CardUser from './elementsEventPage/CardUser';
import CardStream from './elementsEventPage/CardStream';
import {arrayTeams} from '../functions/createChallenge';
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
};

class EventPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      event: null,
      ...noEdit,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.event = this.event.bind(this);
    this.confirmLeaveEvent = this.confirmLeaveEvent.bind(this);
  }
  async componentDidMount() {
    this.loadEvent(this.props.navigation.getParam('objectID'));
  }
  componentWillUnmount() {
    if (this.state.event) {
      firebase
        .database()
        .ref('challenges/' + this.state.event.objectID)
        .off();
    }
  }
  async loadEvent(objectID) {
    const that = this;
    firebase
      .database()
      .ref('challenges/' + objectID)
      .on('value', async function(snap) {
        let event = snap.val();
        console.log('challenge get !!', event);
        if (!event) return null;
        event.objectID = objectID;
        if (that.props.userConnected) {
          if (event.allMembers.includes(that.props.userID)) {
            await that.props.eventsAction('setAllEvents', {[objectID]: event});
          }
        }
        that.setState({event: event, loader: false});
      });
  }
  getSportLeagueRule(challenge) {
    const sport = this.props.sports.filter(
      (s) => s.value === challenge.info.sport,
    )[0];
    const format = Object.values(sport.formats).filter(
      (l) => l.value === challenge.info.format,
    )[0];
    return {sport: sport, format: format};
  }
  nextGender(data, inc) {
    if (this.state.editGender === noEdit.editGender) {
      this.setState({editGender: nextGender(data.info.gender, inc)});
    } else {
      this.setState({editGender: nextGender(this.state.editGender, inc)});
    }
  }

  dismiss() {
    const {dismiss} = this.props.navigation;
    const altDismiss = this.props.navigation.getParam('altDismiss', false);
    if (altDismiss) {
      altDismiss();
    } else {
      dismiss();
    }
  }

  header(event) {
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
        iconOffset="cog"
        colorIconOffset={this.state.editMode ? colors.blue : 'white'}
        typeIconOffset="font"
        clickButton2={() => this.goToShareEvent(event)}
        clickButton1={() => this.dismiss()}
        clickButtonOffset={
          this.userIsOrganizer(event)
            ? () =>
                this.state.editMode
                  ? this.setState({...noEdit})
                  : this.setState({editMode: true})
            : null
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
  rowTeam(team, i, data) {
    return (
      <CardUser
        user={team.captain}
        status={team.status}
        infoUser={this.props.infoUser}
        userConnected={this.props.userConnected}
        objectID={data.objectID}
        key={i}
        userID={this.props.userID}
        removable={
          data.info.organizer !== team.captain.id && this.state.editMode
        }
        removeFunc={() => this.askRemovePlayer(team.captain, data, team)}
        type="event"
        admin={data.info.organizer === this.props.userID}
      />
    );
  }
  rowStream(event, stream, i) {
    return (
      <CardStream
        streamID={stream}
        event={event}
        key={i}
        name={i}
        userIsOrganizer={this.userIsOrganizer(event)}
      />
    );
  }
  openCondition(data) {
    // if (!data) {
    //   return false;
    // }
    // if (!data.attendees) {
    //   return true;
    // }
    // if (
    //   Object.values(data.attendees).filter(
    //     (user) => user.status === ('confirmed' || 'pending'),
    //   ).length < Number(data.info.maxAttendance)
    // ) {
    //   return true;
    // }
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
      console.log('edit price', data.price);
      return (
        <TextInput
          style={styles.eventTitle}
          placeholder={'Entry Fee: $' + data.price.amount}
          returnKeyType={'done'}
          keyboardType={'phone-pad'}
          underlineColorAndroid="rgba(0,0,0,0)"
          autoCorrect={true}
          onChangeText={(text) =>
            this.setState({editPrice: text.split('$')[1]})
          }
          onFocus={() => {
            this.setState({editPriceClicked: true});
          }}
          value={
            this.state.editPriceClicked
              ? 'Challenge: $' + this.state.editPrice
              : ''
          }
        />
      );
    } else {
      return (
        <Text style={styles.eventTitle}>
          {Number(data.price.amount) === 0
            ? 'Free entry'
            : '$' + data.price.amount}
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
      sendEditNotification:
        this.state.editStart !== noEdit.editStart ||
        this.state.editEnd !== noEdit.editEnd ||
        this.state.editLocation !== noEdit.editLocation,
      price: {
        ...data.price,
        joiningFee:
          this.state.editPrice === ''
            ? data.price.amount
            : Number(this.state.amount),
      },
      info: {
        ...data.info,
        name: this.state.editName === '' ? data.info.name : this.state.editName,
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
  async confirmDecline(data) {
    const {userID} = this.props;

    const teamUser = Object.values(data.teams).filter(
      (team) => team.captain.id === userID,
    )[0];
    console.log('teamUser', teamUser);
    // await firebase
    //   .database()
    //   .ref('challenges/' + data.objectID + '/teams/' + teamUser.id)
    //   .update({canceller: userID});
    await firebase
      .database()
      .ref('challenges/' + data.objectID + '/teams/' + teamUser.id)
      .remove();
    await NavigationService.goBack();
    return true;
  }
  rowDeclineAcceptButton(data) {
    const {userID} = this.props;
    const teamUser = Object.values(data.teams).filter(
      (team) => team.captain.id === userID,
    );
    console.log('dataUser', teamUser);
    console.log('data.teams', data.teams);
    if (teamUser.length === 0) return null;

    if (teamUser[0].status !== 'pending') return null;
    return (
      <Row style={{marginTop: 20}}>
        <Col size={42.5} style={styleApp.center2}>
          <Button2
            icon={'next'}
            backgroundColor={'red'}
            onPressColor={colors.red}
            styleButton={{height: 45}}
            disabled={false}
            text={'Decline'}
            loader={false}
            click={() =>
              NavigationService.navigate('Alert', {
                title: 'Do you want to decline the challenge?',
                textButton: 'Decline',
                colorButton: 'red',
                onPressColor: colors.red,
                onGoBack: () => this.confirmDecline(data),
              })
            }
          />
        </Col>
        <Col size={5} />
        <Col size={42.5} style={styleApp.center2}>
          <Button2
            icon={'next'}
            backgroundColor={'green'}
            onPressColor={colors.greenClick}
            styleButton={{height: 45}}
            disabled={false}
            text={'Accept'}
            loader={false}
            click={() =>
              NavigationService.navigate('SummaryChallenge', {
                challenge: data,
                subscribe: true,
              })
            }
          />
        </Col>
      </Row>
    );
  }
  eventInfo(data, sport, format) {
    return (
      <View style={styleApp.marginView}>
        {this.rowDeclineAcceptButton(data)}
        <Row style={{marginTop: 20}}>
          <Col style={styleApp.center2}>{this.editPrice(data)}</Col>
        </Row>

        <Row style={{marginTop: 15}}>
          <Col style={styleApp.center2}>{this.editName(data)}</Col>
        </Row>
        <View style={[styleApp.divider2, {marginBottom: 20}]} />

        {this.rowImage(sport.icon, sport.text)}
        {this.rowIcon(this.title(format.text), format.icon)}
        {this.rowIcon(
          this.title(
            'Challenge $' +
              data.price.amount +
              ', money multiple ' +
              data.price.odds,
          ),
          'cogs',
        )}

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
      </View>
    );
  }
  buttonLeave(data) {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={40} style={styleApp.center}>
                <AllIcons
                  name="sign-out-alt"
                  type="font"
                  color={colors.white}
                  size={15}
                />
              </Col>
              <Col size={60} style={styleApp.center2}>
                <Text style={[styleApp.text, {color: colors.white}]}>
                  Cancel
                </Text>
              </Col>
            </Row>
          );
        }}
        click={() =>
          NavigationService.navigate('Alert', {
            textButton: 'Cancel attendance',
            onGoBack: () => this.confirmLeaveEvent(data),
            icon: (
              <AllIcons
                name="sign-out-alt"
                color={colors.primary}
                type="font"
                size={22}
              />
            ),
            title: 'Are you sure you want to cancel your attendance?',
            subtitle:
              Number(data.price.joiningFee) !== 0 &&
              'Your registration fee will not be refunded unless specifically authorized by the event host.',
            colorButton: 'primary',
            onPressColor: colors.primaryLight,
          })
        }
        color={colors.primary}
        style={styles.buttonLeave}
        onPressColor={colors.primaryLight}
      />
    );
  }
  buttonCancelEvent(data) {
    if (
      data.info.organizer === this.props.userID &&
      !isDatePast(data.date.start)
    )
      return (
        <ButtonColor
          view={() => {
            return (
              <Row>
                <Col style={styleApp.center}>
                  <Text style={styleApp.text}>Cancel the challenge</Text>
                </Col>
              </Row>
            );
          }}
          click={() =>
            NavigationService.navigate('Alert', {
              textButton: 'Cancel the challenge',
              onGoBack: () => this.confirmCancelEvent(data),
              icon: (
                <AllIcons
                  name="ban"
                  color={colors.title}
                  type="font"
                  size={22}
                />
              ),
              title: 'Are you sure you want to cancel the challenge?',
              colorButton: 'red',
              onPressColor: colors.red,
            })
          }
          color={colors.white}
          style={styles.buttonCancel}
          onPressColor={colors.off}
        />
      );
    return null;
  }
  async confirmCancelEvent(data) {
    const {goBack, navigate} = this.props.navigation;

    if (isDatePast(data.date.start)) {
      await navigate('Challenge');
      return navigate('Alert', {
        close: true,
        title: 'You cannot cancel a past event.',
        textButton: 'Got it!',
      });
    }
    await this.props.messageAction('deleteMyConversation', data.discussions[0]);
    await this.props.eventsAction('deleteMyEvent', data.objectID);

    await firebase
      .database()
      .ref('cancelledChallenges/' + data.objectID)
      .update({...data, status: 'onDelete'});
    await firebase
      .database()
      .ref('challenges/' + data.objectID)
      .remove();
    await goBack();
    await this.dismiss();
    return true;
  }
  async confirmLeaveEvent(data) {
    const {userID} = this.props;
    if (data.discussions)
      await this.props.messageAction(
        'deleteMyConversation',
        data.discussions[0],
      );

    await this.props.eventsAction('deleteMyEvent', data.objectID);

    await firebase
      .database()
      .ref('events/' + data.objectID + '/teams/' + userID)
      .update({action: 'unsubscribed'});
    await firebase
      .database()
      .ref('events/' + data.objectID + '/attendees/' + userID)
      .remove();
    await removeMemberDiscussion(data.discussions[0], userID);
    await NavigationService.goBack();
    return true;
  }

  event(event, loader, userID) {
    if (!event || loader) return <PlaceHolder />;
    const teams = arrayTeams(event.teams, userID, event.info.organizer);
    const {sport, format} = this.getSportLeagueRule(event);
    return (
      <View style={{marginLeft: 0, width: width, marginTop: 0}}>
        {this.eventInfo(event, sport, format)}

        {event.results && <ResultSection challenge={event} userID={userID} />}

        <View style={[styleApp.marginView, {marginTop: 30}]}>
          <Row>
            <Col size={25} style={styleApp.center2}>
              <Text style={styleApp.text}>Players</Text>
            </Col>
            <Col size={25} style={styleApp.center2}>
              <ButtonColor
                view={() => {
                  return (
                    <Text style={[styleApp.text, {color: colors.white}]}>
                      Invite
                    </Text>
                  );
                }}
                style={{width: '100%', borderRadius: 15, height: 30}}
                click={() => this.goToShareEvent(event)}
                color={colors.primary}
                onPressColor={colors.primary2}
              />
            </Col>
            <Col size={60} style={styleApp.center3}>
              {/* {this.userAlreadySubscribed(event.attendees) &&
                this.props.userID !== event.info.organizer &&
                this.buttonLeave(event)} */}
            </Col>
          </Row>

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
        ) : teams.length === 0 ? (
          <Text
            style={[
              styleApp.smallText,
              {marginTop: 10, marginLeft: 20, width: width - 40},
            ]}>
            No teams has joined the challenge yet.
          </Text>
        ) : (
          teams.map((team, i) => this.rowTeam(team, i, event))
        )}

        {event.discussions && (
          <PostsView
            objectID={event.objectID}
            data={event}
            type="challenge"
            loader={loader}
            infoUser={this.props.infoUser}
          />
        )}

        {event.groups && (
          <View style={{marginTop: 35}}>
            <GroupsEvent groups={event.groups} />
          </View>
        )}

        {this.buttonCancelEvent(event)}

        <View style={{height: sizes.heightFooterBooking + 50}} />
      </View>
    );
  }
  next(event) {
    if (!this.props.userConnected)
      return this.props.navigation.navigate('SignIn');

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
        (user) =>
          user.userID === this.props.userID && user.status === 'confirmed',
      ).length === 0
    )
      return false;
    return true;
  }
  userIsOrganizer(event) {
    if (!event || !this.props.userConnected) {
      return false;
    }
    return event.info.organizer === this.props.userID;
  }
  askRemovePlayer(player, data, team) {
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
      yesClick: () => this.removePlayer(team, data),
      noClick: () => null,
      onGoBack: () => this.props.navigation.navigate('Event'),
    });
  }
  async removePlayer(team, data) {
    let newData = {...data};
    await removePlayerFromEvent(team, newData).catch((err) => {
      console.log(err.message);
    });
    for (var i in newData.allAttendees) {
      if (newData.allAttendees[i] === team.id) {
        delete newData.allAttendees[i];
        break;
      }
    }
    delete newData.attendees[team.id];
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
      objectID: event.objectID,
      description: '',
      url: {
        description:
          'Join my challenge ' +
          event.info.name +
          ' on ' +
          date(event.date.start, 'ddd, MMM D') +
          ' at ' +
          date(event.date.start, 'h:mm a') +
          ' by following the link!',
        image: event.images[0],
        title: event.info.name,
        action: 'Challenge',
        objectID: event.objectID,
      },
      action: 'Challenge',
      data: {...event, objectID: event.objectID},
    });
  };
  checkout(event) {
    if (!isDatePast(event.date.end))
      return this.props.navigation.navigate('Alert', {
        close: true,
        title: 'You cannot checkout before the event ends.',
        textButton: 'Got it!',
      });
    let members = event.attendees;
    if (!members) members = [];
    const amountPaidAllUsers = Object.values(members)
      .filter((member) => member.status === 'confirmed' && member.amountPaid)
      .map((member) => member.amountPaid);
    const payout = ramda.sum(amountPaidAllUsers);
    return this.props.navigation.navigate('Alert', {
      title: 'Are you ready to check out?',
      subtitle: '$' + payout + ' will be transferred to your wallet.',
      textButton: 'Checkout',
      onGoBack: () => this.confirmCheckout(event, payout),
    });
  }
  async confirmCheckout(event, payout) {
    const {wallet, userID} = this.props;
    await firebase
      .database()
      .ref('events/' + event.objectID)
      .update({checkoutDone: true});
    if (payout !== 0) {
      const newUserWallet = Number(wallet.totalWallet) + payout;
      const transferCharge = {
        invoice: {
          totalPrice: payout,
          credits: newUserWallet,
        },
        title: 'Event fees',
        type: 'plus',
        date: new Date().toString(),
      };
      await firebase
        .database()
        .ref('users/' + userID + '/wallet/')
        .update({totalWallet: newUserWallet});
      await firebase
        .database()
        .ref('usersTransfers/' + userID)
        .push(transferCharge);
    }

    // await this.props.navigation.goBack();
    await NavigationService.goBack();
    return this.props.navigation.navigate('Alert', {
      close: true,
      title: 'Congrats!',
      subtitle: '$' + payout + ' has been transferred to your wallet.',
      textButton: 'Ok',
    });
  }
  bottomActionButton(title, click, color) {
    return (
      <Button2
        icon={'next'}
        backgroundColor={color ? color : 'green'}
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
    const {navigate} = this.props.navigation;
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

        {event && (
          <FadeInView duration={300} style={styleApp.footerBooking}>
            {editMode ? (
              this.bottomActionButton('Save edits', () => this.saveEdits(event))
            ) : !event.results &&
              Object.values(event.teams).filter(
                (team) => team.status === 'pending',
              ).length === 0 ? (
              this.bottomActionButton('Publish results', () =>
                navigate('PublishResult', {challenge: event}),
              )
            ) : (
              <View />
            )}
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
  buttonLeave: {
    borderColor: colors.off,
    height: 40,
    width: 110,
    borderRadius: 20,
    borderWidth: 1,
  },
  buttonCancel: {
    height: 55,
    borderTopWidth: 0.4,
    borderBottomWidth: 0.4,
    marginTop: 40,
    borderColor: colors.grey,
  },
});

const mapStateToProps = (state) => {
  return {
    sports: state.globaleVariables.sports.list,
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    userConnected: state.user.userConnected,
    allEvents: state.events.allEvents,
    wallet: state.user.infoUser.wallet,
  };
};

export default connect(mapStateToProps, {eventsAction, messageAction})(
  EventPage,
);
