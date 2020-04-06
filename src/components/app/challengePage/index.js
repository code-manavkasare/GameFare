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
import {eventsAction} from '../../../actions/eventsActions';
import {messageAction} from '../../../actions/messageActions';
import firebase from 'react-native-firebase';
import NavigationService from '../../../../NavigationService';
import {editChallenge} from '../../functions/editChallenge';
import {
  addMemberDiscussion,
  removeMemberDiscussion,
} from '../../functions/createEvent';
import TeamsView from './TeamsView';

import RNCalendarEvents from 'react-native-calendar-events';
import {getPermissionCalendar, isDatePast} from '../../functions/date';
import moment from 'moment';
import ramda from 'ramda';

const {height, width} = Dimensions.get('screen');
import colors from '../../style/colors';
import styleApp from '../../style/style';
import sizes from '../../style/sizes';
import {Grid, Row, Col} from 'react-native-easy-grid';
import FadeInView from 'react-native-fade-in-view';

import AsyncImage from '../../layout/image/AsyncImage';

import AllIcons from '../../layout/icons/AllIcons';
import DateEvent from '../elementsEventCreate/DateEvent';
import {date} from '../../layout/date/date';
import Button2 from '../../layout/buttons/Button';
import ButtonColor from '../../layout/Views/Button';
import RowPlusMinus from '../../layout/rows/RowPlusMinus';
import GroupsEvent from '../elementsGroupPage/GroupsEvent';

import PostsView from '../elementsGroupPage/PostsView';
import ResultSection from '../elementsCreateChallenge/ResultSection';

import JoinButtons from './JoinButtons';
import {
  isUserAlreadyMember,
  allTeamsConfirmed,
} from '../../functions/createChallenge';
import PlaceHolder from '../../placeHolders/EventPage';

import ParallaxScrollView from 'react-native-parallax-scroll-view';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';

const noEdit = {
  editMode: false,
  editAmount: '',
  editOdds: '',
  editPriceClicked: false,
  editName: '',
  editStart: '',
  editEnd: '',
  editLocation: null,
};

class ChallengePage extends React.Component {
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
    const {route} = this.props;
    const {objectID} = route.params;
    this.loadEvent(objectID);
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
      .on('value', async function (snap) {
        let event = snap.val();
        if (!event) return null;
        event.objectID = objectID;
        if (that.props.userConnected) {
          if (event.allMembers[that.props.userID]) {
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

  dismiss() {
    const {dismiss} = this.props.navigation;
    const {route} = this.props;
    const {altDismiss} = route.params;
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
  amountPicker(price, sport) {
    const {editAmount} = this.state;
    let amount = price.amount;
    if (editAmount !== '') amount = editAmount;
    return (
      <RowPlusMinus
        title="Amount"
        alert={sport.challenge.amount.alert}
        add={(value) => this.setState({editAmount: Number(value)})}
        value={amount}
        textValue={'$' + amount}
        increment={sport.challenge.amount.increment}
      />
    );
  }
  amountOdds(price, sport) {
    const {editOdds} = this.state;
    let odds = Number(price.odds);
    if (editOdds !== '') odds = Number(editOdds);
    return (
      <RowPlusMinus
        title="Money multiple"
        alert={sport.challenge.odds.alert}
        add={(value) => this.setState({editOdds: Number(value)})}
        value={odds}
        textValue={odds.toFixed(1)}
        increment={sport.challenge.odds.increment}
      />
    );
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
  editPrice(data, sport) {
    if (this.state.editMode) {
      return (
        <View style={{marginBottom: 5, marginTop: -5}}>
          {this.amountPicker(data.price, sport)}
          {this.amountOdds(data.price, sport)}
        </View>
      );
    } else {
      return (
        <Text style={[styleApp.title, {fontSize: 16, color: colors.primary}]}>
          Challenge{' '}
          <Text style={{color: colors.primary}}>${data.price.amount}</Text> •
          money multiple{' '}
          <Text style={{color: colors.primary}}>{data.price.odds}</Text>
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
  async saveEdits(data) {
    // update event data
    const newData = {
      ...data,
      sendEditNotification:
        this.state.editStart !== noEdit.editStart ||
        this.state.editEnd !== noEdit.editEnd ||
        this.state.editLocation !== noEdit.editLocation,
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
      price: {
        amount:
          this.state.editAmount === ''
            ? data.price.amount
            : this.state.editAmount,
        odds:
          this.state.editOdds === '' ? data.price.odds : this.state.editOdds,
      },
      location: this.state.editLocation
        ? this.state.editLocation
        : data.location,
    };
    // firebase update
    await editChallenge(newData, () => console.log('edit event failed'));
    // local update
    await this.props.eventsAction('setAllEvents', {
      [newData.objectID]: newData,
    });
    this.setState({
      ...this.state,
      ...noEdit,
    });
  }

  eventInfo(data, sport, format) {
    return (
      <View style={styleApp.marginView}>
        <JoinButtons challenge={data} />

        <Row style={{marginTop: 20}}>
          <Col style={styleApp.center2}>{this.editPrice(data, sport)}</Col>
        </Row>

        <Row style={{marginTop: 15}}>
          <Col style={styleApp.center2}>{this.editName(data)}</Col>
        </Row>
        <View style={[styleApp.divider2, {marginBottom: 20}]} />

        {this.rowImage(sport.icon, sport.text)}
        {this.rowIcon(this.title(format.text), format.icon)}

        {this.editRowIcon(
          this.dateTime(
            this.state.editStart !== ''
              ? this.state.editStart
              : data.date.start,
            this.state.editEnd !== '' ? this.state.editEnd : data.date.end,
          ),
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
          this.title(
            this.state.editLocation
              ? this.state.editLocation.address
              : data.location.address,
          ),
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

  event(event, loader, userID, infoUser) {
    if (!event || loader) return <PlaceHolder />;

    const {sport, format} = this.getSportLeagueRule(event);
    return (
      <View style={{marginLeft: 0, width: width, marginTop: 0}}>
        {this.eventInfo(event, sport, format)}

        {event.results && (
          <ResultSection
            challenge={event}
            userID={userID}
            infoUser={infoUser}
          />
        )}

        {<TeamsView challenge={event} />}

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
  userIsOrganizer(event) {
    if (!event || !this.props.userConnected) {
      return false;
    }
    return event.info.organizer === this.props.userID;
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
      image: event.images[0],
      action: 'Challenge',
      data: {...event, objectID: event.objectID},
    });
  };
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
    const {userID, infoUser, userConnected} = this.props;
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
          {this.event(event, loader, userID, infoUser)}
        </ParallaxScrollView>

        {event && (
          <FadeInView duration={300} style={styleApp.footerBooking}>
            {editMode ? (
              this.bottomActionButton('Save edits', () => this.saveEdits(event))
            ) : isUserAlreadyMember(event, userID, userConnected) &&
              allTeamsConfirmed(event) &&
              !event.results ? (
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
  ChallengePage,
);
