import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {eventsAction} from '../../../actions/eventsActions';
import {groupsAction} from '../../../actions/groupsActions';
import {createEventAction} from '../../../actions/createEventActions';
import {historicSearchAction} from '../../../actions/historicSearchActions';
import union from 'lodash/union';

import {createEvent} from '../../functions/createEvent';
import {payEntryFee} from '../../functions/createEvent';
const {height, width} = Dimensions.get('screen');
import ScrollView from '../../layout/scrollViews/ScrollView';
import TextField from '../../layout/textField/TextField';

import Button from '../../layout/buttons/Button';
import DateEvent from '../elementsEventCreate/DateEvent';

import {Col, Row, Grid} from 'react-native-easy-grid';
import AsyncImage from '../../layout/image/AsyncImage';
import CardUser from '../elementsEventPage/CardUser';
import CardCreditCard from '../elementsUser/elementsPayment/CardCreditCard';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';

import AllIcons from '../../layout/icons/AllIcons';

import styleApp from '../../style/style';
import sizes from '../../style/sizes';
import colors from '../../style/colors';

class SummaryChallenge extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {}
  dateTime(date) {
    return <DateEvent start={date.start} end={date.end} />;
  }
  sport(sport) {
    return (
      <TextField
        state={sport.text}
        placeHolder={''}
        heightField={50}
        multiline={false}
        editable={false}
        keyboardType={'default'}
        icon={sport.icon}
        typeIcon={sport.typeIcon}
      />
    );
  }
  rowIcon(icon, component, typeIcon, img) {
    return (
      <Row style={{paddingTop: 6, paddingBottom: 6}}>
        <Col size={10} style={styleApp.center}>
          {img ? (
            <AsyncImage
              style={{width: 30, height: 30, borderRadius: 15}}
              mainImage={icon}
              imgInitial={icon}
            />
          ) : (
            <AllIcons
              name={icon}
              size={18}
              type={typeIcon}
              color={colors.grey}
            />
          )}
        </Col>

        <Col size={85} style={[styleApp.center2, {paddingLeft: 23}]}>
          {component}
        </Col>
      </Row>
    );
  }
  title(text) {
    return <Text style={[styleApp.input]}>{text}</Text>;
  }
  listMembers(members) {
    if (Object.values(members).length == 0) return null;
    return (
      <View style={{marginLeft: -20, width: width, marginBottom: 0}}>
        {Object.values(members).map((user, i) => this.rowUser(user, i))}
      </View>
    );
  }
  rowUser(user, i) {
    const {infoUser, userConnected, userID} = this.props;
    return (
      <CardUser
        user={user}
        infoUser={infoUser}
        userConnected={userConnected}
        // objectID={data.objectID}
        key={i}
        userID={userID}
        // removable={false}
        // removeFunc={() => this.askRemovePlayer(user, data)}
        type="event"
        admin={false}
      />
    );
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

  summary(challenge) {
    console.log('summary', challenge);
    const {info, date, location} = challenge;
    console.log('infooooo', info);
    const sport = this.props.sports.filter(
      (sport) => sport.value === info.sport,
    )[0];

    const format = Object.values(sport.formats).filter(
      (format) => format.value === info.format,
    )[0];
    const creditCardCharge = challenge.price.amount;
    console.log('format', format);

    return (
      <View style={[styleApp.marginView, {paddingTop: 15}]}>
        <Text style={[styleApp.title, {fontSize: 20}]}>{info.name}</Text>
        <View style={[styleApp.divider2, {marginBottom: 10}]} />

        {this.rowIcon(sport.icon, this.title(sport.text), 'font', true)}
        {this.rowIcon(info.image, this.title(location.address), 'font', true)}
        <View style={{height: 5}} />
        {this.rowIcon(format.icon, this.title(format.text), 'font')}
        <View style={{height: 5}} />
        {this.rowIcon('calendar-alt', this.dateTime(date), 'font')}
        {date.recurrence !== '' &&
          this.rowIcon(
            'stopwatch',
            this.title(
              date.recurrence.charAt(0).toUpperCase() +
                date.recurrence.slice(1) +
                ' recurrence',
            ),
            'font',
          )}

        <View style={{height: 5}} />
        {info.instructions !== '' &&
          this.rowIcon('parking', this.title(info.instructions), 'font')}

        <View style={[styleApp.divider2, {marginBottom: 0, marginTop: 10}]} />

        {this.listMembers(challenge.members)}
        <View style={[styleApp.divider2, {marginBottom: 10, marginTop: 5}]} />

        {this.rowText(
          'Challenge entry fee',
          colors.title,
          'OpenSans-SemiBold',
          Number(challenge.price.amount) === 0
            ? 'Free'
            : '$' + challenge.price.amount,
        )}

        {this.props.userConnected &&
          Number(challenge.price.amount) !== 0 &&
          this.rowText(
            'Credits',
            colors.green,
            'OpenSans-SemiBold',
            '$' + Number(Number(this.props.totalWallet).toFixed(2)),
          )}

        {creditCardCharge === 0 ? null : this.props.userConnected ? (
          <View>
            {this.rowText(
              'Pay now',
              colors.title,
              'OpenSans-SemiBold',
              '$' + Number(creditCardCharge.toFixed(2)),
            )}
          </View>
        ) : (
          <View>
            {this.rowText(
              'Pay now',
              colors.title,
              'OpenSans-SemiBold',
              '$' + Number(creditCardCharge.toFixed(2)),
            )}
          </View>
        )}

        <View style={{height: 10}} />

        {this.props.userConnected && creditCardCharge !== 0 && (
          <CardCreditCard
            navigate={(val, data) => this.props.navigation.navigate(val, data)}
          />
        )}

        <View style={{height: 15}} />

        <Text style={[styleApp.title, {fontSize: 13}]}>
          Reminder •{' '}
          <Text style={{fontFamily: 'OpenSans-Regular'}}>
            We will charge the challenge entry fee at the point of creating the
            challenge. You will be able to cancel and get refunded until your
            oponent confirms the challenge.{'\n'}
            {'\n'}
            You will receive{' '}
            <Text style={styleApp.textBold}>
              ${(challenge.price.amount * challenge.price.odds).toFixed(1)}
            </Text>{' '}
            if you win the challenge. Your oponent will pay{' '}
            <Text style={styleApp.textBold}>
              $
              {challenge.price.amount *
                Math.max(0, challenge.price.odds - 1).toFixed(1)}
            </Text>{' '}
            to accept the challenge.
          </Text>
        </Text>
      </View>
    );
  }
  async submit(challenge) {
    this.setState({loader: true});
    const {dismiss} = this.props.navigation;
    const {
      userID,
      infoUser,
      tokenCusStripe,
      defaultCard,
      totalWallet,
    } = this.props;

    const payEntryFee = await payEntryFee(challenge.price.amount, userID);
    await payEntryFee(
      new Date().toString(),
      challenge.price.amount,
      userID,
      {
        tokenCusStripe: tokenCusStripe,
        defaultCard: defaultCard,
        totalWallet: totalWallet,
      },
      infoUser,
    );
    return true;
    var event = await createEvent(
      data,
      this.props.userID,
      this.props.infoUser,
      this.props.level,
      this.props.navigation.getParam('groups'),
    );
    if (!event) {
      await this.setState({loader: false});
      return this.props.navigation.navigate('Alert', {
        close: true,
        title: 'An error has occured.',
        subtitle: 'Please try again.',
        textButton: 'Got it!',
      });
    }

    if (data.groups.length !== 0) {
      var groups = this.props.navigation.getParam('groups');
      for (var i in groups) {
        await this.props.groupsAction('editGroup', {
          objectID: groups[i].objectID,
          events: union([event.objectID], groups[i].events),
        });
      }
    }

    await this.props.eventsAction('setAllEvents', {[event.objectID]: event});
    await this.props.eventsAction('addFutureEvent', event.objectID);

    await this.props.historicSearchAction('setSport', {
      value: event.info.sport,
      league: event.info.league,
    });

    await this.props.createEventAction('reset');
    await this.setState({loader: false});

    await dismiss();

    return this.props.navigation.navigate('Contacts', {
      data: event,
      pageFrom: 'Event',
      openPageLink: 'openEventPage',
      objectID: event.objectID,
    });
  }
  render() {
    const {createChallengeData} = this.props;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1="arrow-left"
          icon2={null}
          clickButton1={() => this.props.navigation.goBack()}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.summary(createChallengeData)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={false}
        />

        <View style={styleApp.footerBooking}>
          {this.props.userConnected ? (
            <Button
              icon={'next'}
              backgroundColor="green"
              onPressColor={colors.greenLight}
              styleButton={{marginLeft: 20, width: width - 40}}
              enabled={true}
              disabled={false}
              text={'Create challenge'}
              loader={this.state.loader}
              click={() => this.submit(createChallengeData)}
            />
          ) : (
            <Button
              backgroundColor="green"
              onPressColor={colors.greenLight}
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

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  return {
    sports: state.globaleVariables.sports.list,
    userConnected: state.user.userConnected,
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    createChallengeData: state.createChallengeData,

    totalWallet: state.user.infoUser.wallet.totalWallet,
    defaultCard: state.user.infoUser.wallet.defaultCard,
    tokenCusStripe: state.user.infoUser.wallet.tokenCusStripe,
  };
};

export default connect(mapStateToProps, {
  eventsAction,
  createEventAction,
  historicSearchAction,
  groupsAction,
})(SummaryChallenge);
