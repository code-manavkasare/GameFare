import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {eventsAction} from '../../../actions/eventsActions';
import {messageAction} from '../../../actions/messageActions';
import {joinEvent} from '../../functions/createEvent';
import {indexDiscussions} from '../../database/algolia';

const {height, width} = Dimensions.get('screen');

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import ScrollView from '../../layout/scrollViews/ScrollView';
import sizes from '../../style/sizes';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import {Col, Row, Grid} from 'react-native-easy-grid';
import AsyncImage from '../../layout/image/AsyncImage';
import {userAction} from '../../../actions/userActions';
import Button from '../../layout/buttons/Button';

import AllIcons from '../../layout/icons/AllIcons';
import DateEvent from '../elementsEventCreate/DateEvent';
import CardCreditCard from '../elementsUser/elementsPayment/CardCreditCard';

class ProfilePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.futureEvents !== nextProps.futureEvents) return false;
    return true;
  }
  componentDidMount() {}
  dateTime(start, end) {
    return <DateEvent start={start} end={end} />;
  }
  rowIcon(component, icon) {
    return (
      <Row style={{marginTop: 20}}>
        <Col size={15} style={styleApp.center}>
          <AllIcons name={icon} color={colors.greyDark} size={16} type="font" />
        </Col>
        <Col size={85} style={[styleApp.center2, {paddingLeft: 10}]}>
          {component}
        </Col>
      </Row>
    );
  }
  title(text) {
    return <Text style={styleApp.input}>{text}</Text>;
  }
  rowText(text, colorText, fontFamily, val) {
    return (
      <Row style={{height: 35}}>
        <Col style={styleApp.center2} size={80}>
          <Text
            style={[
              styleApp.text,
              {fontSize: 16, color: colorText, fontFamily: fontFamily},
            ]}>
            {text}
          </Text>
        </Col>
        <Col style={styleApp.center3} size={20}>
          <Text
            style={[
              styleApp.text,
              {fontSize: 16, color: colorText, fontFamily: fontFamily},
            ]}>
            {val}
          </Text>
        </Col>
      </Row>
    );
  }
  rowImage(uri, text) {
    return (
      <Row style={{paddingTop: 5, paddingBottom: 5}}>
        <Col size={15} style={styleApp.center}>
          <AsyncImage
            style={{height: 40, width: 40, borderRadius: 20}}
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
  sport(sport) {
    return (
      <Row>
        <Col size={75} style={styleApp.center2}>
          <Text style={styleApp.title}>
            {this.props.navigation.getParam('data').info.name}
          </Text>
        </Col>
        <Col size={25} style={styleApp.center3}>
          <View
            style={[
              styleApp.viewSport,
              {backgroundColor: sport.card.color.color, width: '100%'},
            ]}>
            <Text style={[styleApp.textSport, {color: 'white'}]}>
              {this.props.navigation
                .getParam('data')
                .info.sport.charAt(0)
                .toUpperCase() +
                this.props.navigation.getParam('data').info.sport.slice(1)}
            </Text>
          </View>
        </Col>
      </Row>
    );
  }
  creditCard() {
    return (
      <View style={{marginTop: 10}}>
        <CardCreditCard
          navigate={(val, data) => this.props.navigation.navigate(val, data)}
        />
      </View>
    );
  }
  checkout(data, waitlist, creditCardCharge) {
    var sport = this.props.sports.filter(
      (sport) => sport.value === data.info.sport,
    )[0];
    var league = Object.values(sport.typeEvent).filter(
      (item) => item.value === data.info.league,
    )[0];
    return (
      <View style={{marginLeft: 0, width: width, marginTop: 0}}>
        <View style={[{paddingTop: 5}]}>
          <View style={styleApp.marginView}>
            <Text style={[styleApp.title, {marginBottom: 15}]}>
              {data.info.name}
            </Text>

            {this.rowImage(sport.icon, sport.text)}
            {this.rowImage(league.icon, league.text)}

            {this.rowIcon(
              this.dateTime(data.date.start, data.date.end),
              'calendar-alt',
            )}
            {this.rowIcon(
              this.title(data.location.address),
              'map-marker-alt',
              'AlertAddress',
              data.location,
            )}
            {this.rowIcon(
              this.title(data.info.maxAttendance + ' people'),
              'user-check',
            )}
          </View>
        </View>

        <View style={[styleApp.viewHome, {paddingTop: 15}]}>
          <View style={styleApp.marginView}>
            {this.rowText(
              'Entry fee',
              colors.title,
              'OpenSans-SemiBold',
              Number(data.price.joiningFee) === 0
                ? 'Free'
                : '$' + data.price.joiningFee,
            )}

            {this.props.userConnected &&
              Number(data.price.joiningFee) !== 0 &&
              this.rowText(
                'Credits',
                colors.green,
                'OpenSans-SemiBold',
                '$' + Number(this.props.totalWallet).toFixed(2),
              )}

            {Number(data.price.joiningFee) === 0 ? null : this.props
                .userConnected ? (
              <View>
                {this.rowText(
                  'Charge amount',
                  colors.title,
                  'OpenSans-SemiBold',
                  '$' + creditCardCharge.toFixed(2),
                )}
                <View style={[styleApp.divider2, {marginBottom: 10}]} />
              </View>
            ) : (
              <View>
                {this.rowText(
                  'Charge amount',
                  colors.title,
                  'OpenSans-SemiBold',
                  '$' + Number(data.price.joiningFee),
                )}
                <View style={[styleApp.divider2, {marginBottom: 10}]} />
              </View>
            )}

            {this.props.userConnected &&
              creditCardCharge !== 0 &&
              this.creditCard()}
          </View>
        </View>

        <View style={styleApp.marginView}>
          {creditCardCharge !== 0 && waitlist ? (
            <Text style={styles.textReminder}>
              Reminder •{' '}
              <Text style={styles.smallText}>
                We will charge the entry fee at the point of joining the event.
                No refunds unless your spot can be filled with an alternate
                player. {'\n'}
                {'\n'}If the organizer declines your request, we will refund the
                charge on your wallet.
              </Text>
            </Text>
          ) : creditCardCharge !== 0 ? (
            <Text style={styles.textReminder}>
              Reminder •{' '}
              <Text style={styles.smallText}>
                We will charge the entry fee at the point of joining the event.
                No refunds unless your spot can be filled with an alternate
                player.
              </Text>
            </Text>
          ) : waitlist ? (
            <Text style={styles.textReminder}>
              Reminder •{' '}
              <Text style={styles.smallText}>
                We will notify you once the organizer accepts or declines your
                request.
              </Text>
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  async submit(data, waitlist) {
    await this.setState({loader: true});
    var {response, message} = await joinEvent(
      data,
      this.props.userID,
      this.props.infoUser,
      this.props.level,
      {
        tokenCusStripe: this.props.tokenCusStripe,
        defaultCard: this.props.defaultCard,
        totalWallet: this.props.totalWallet,
      },
      this.props.navigation.getParam('coach'),
      this.props.navigation.getParam('users'),
      waitlist,
    );
    if (!response) {
      await this.setState({loader: false});
      return this.props.navigation.navigate('Alert', {
        close: true,
        title: message.split('. ')[0],
        subtitle: message.split('. ')[1],
        textButton: 'Got it!',
        onGoBack: () => this.props.navigation.navigate('Checkout'),
      });
    } else if (response === 'cancel') return this.setState({loader: false});

    await this.props.eventsAction('setAllEvents', {
      [data.objectID]: {
        ...data,
        [message.pushSection]: {
          ...data[message.pushSection],
          ...message.usersToPush,
        },
      },
    });
    await this.props.eventsAction('addFutureEvent', data.objectID);
    const conversation = await indexDiscussions.getObject(data.discussions[0]);
    await this.setConversation(conversation);

    await this.setState({loader: false});
    return this.props.navigation.navigate('Event');
  }
  async setConversation(data) {
    await this.props.messageAction('setConversation', data);
    return true;
  }
  conditionOn(creditCardCharge, defaultCard) {
    if (creditCardCharge !== 0 && !defaultCard) return false;
    return true;
  }
  textButtonConfirm(creditCardCharge, waitlist) {
    if (waitlist && creditCardCharge === 0) return 'Join the waitlist';
    if (waitlist) return 'Pay & join the waitlist';
    if (creditCardCharge === 0) return 'Confirm attendance';
    return 'Pay & Confirm attendance';
  }
  render() {
    const waitlist = this.props.navigation.getParam('waitlist');
    const event = this.props.navigation.getParam('data');
    const creditCardCharge = Math.max(
      0,
      Number(event.price.joiningFee) - Number(this.props.totalWallet),
    );
    const {defaultCard} = this.props;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          icon1="arrow-left"
          initialTitleOpacity={1}
          icon2={null}
          clickButton1={() => this.props.navigation.goBack()}
        />

        <ScrollView
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() =>
            this.checkout(event, waitlist, creditCardCharge)
          }
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={sizes.heightFooterBooking + 90}
          showsVerticalScrollIndicator={false}
        />
        <View style={styleApp.footerBooking}>
          {this.props.userConnected ? (
            <Button
              icon={'next'}
              backgroundColor="green"
              onPressColor={colors.greenClick}
              styleButton={styleApp.marginView}
              enabled={true}
              disabled={!this.conditionOn(creditCardCharge, defaultCard)}
              text={this.textButtonConfirm(creditCardCharge, waitlist)}
              loader={this.state.loader}
              click={() => this.submit(event, waitlist)}
            />
          ) : (
            <Button
              icon={'next'}
              backgroundColor="green"
              onPressColor={colors.greenClick}
              styleButton={styleApp.marginView}
              enabled={true}
              text="Sign in to proceed"
              loader={false}
              click={() => this.props.navigation.navigate('SignIn')}
            />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textReminder: {...styleApp.title, fontSize: 13},
  smallText: {fontWeight: 'normal'},
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    infoUser: state.user.infoUser.userInfo,
    sports: state.globaleVariables.sports.list,
    level: state.user.infoUser.level,
    totalWallet: state.user.infoUser.wallet.totalWallet,
    defaultCard: state.user.infoUser.wallet.defaultCard,
    tokenCusStripe: state.user.infoUser.wallet.tokenCusStripe,
    futureEvents: state.events.futureUserEvents,
  };
};

export default connect(mapStateToProps, {
  userAction,
  eventsAction,
  messageAction,
})(ProfilePage);
