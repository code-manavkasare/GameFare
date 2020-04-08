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
import {createChallengeAction} from '../../../actions/createChallengeActions';
import {historicSearchAction} from '../../../actions/historicSearchActions';
import union from 'lodash/union';

import {createChallenge} from '../../functions/createChallenge';
import {payEntryFee} from '../../functions/createEvent';
import {sendSMSFunction} from '../../functions/message';
const {height, width} = Dimensions.get('screen');
import ScrollView from '../../layout/scrollViews/ScrollView';
import TextField from '../../layout/textField/TextField';

import Button from '../../layout/buttons/Button';
import DateEvent from '../elementsEventCreate/DateEvent';
import {createBranchUrl} from '../../database/branch';

import {Col, Row, Grid} from 'react-native-easy-grid';
import AsyncImage from '../../layout/image/AsyncImage';
import firebase from 'react-native-firebase';
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
      totalWallet: this.props.totalWallet,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {}
  dateTime(date) {
    return <DateEvent start={date.start} end={date.end} />;
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.totalWallet !== this.props.totalWallet)
      return this.setState({totalWallet: nextProps.totalWallet});
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
  listMembers(teamsData) {
    if (!teamsData.typeChallengeTeam)
      return this.rowUser(teamsData.oponent.captain, 0);
    const numberMembers = Object.values(teamsData.teams)
      .filter((team) => team.members)
      .map((team) => Object.values(team.members).length)
      .reduce((a, b) => a + b, 0);

    return (
      <Row
        style={{
          paddingTop: 10,
          paddingBottom: 10,
          marginTop: 5,
        }}>
        <Col style={styleApp.center} size={10}>
          <AllIcons name="trophy" color={colors.grey} size={20} type={'font'} />
        </Col>
        <Col style={[styleApp.center2, {paddingLeft: 23}]} size={85}>
          <Text style={styleApp.text}>
            {Object.values(teamsData.teams).length} teams • {numberMembers}{' '}
            players
          </Text>
        </Col>
      </Row>
    );
  }
  rowUser(user, i) {
    const {infoUser, userConnected, userID} = this.props;
    return (
      <View style={{marginLeft: -20}}>
        <CardUser
          user={user}
          infoUser={infoUser}
          userConnected={userConnected}
          key={i}
          userID={userID}
          type="event"
          admin={false}
        />
      </View>
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

  summary(challenge, subscribe, dataCheckout) {
    if (challenge.info.sport === '') return null;
    const {info, date, location, images} = challenge;
    const sport = this.props.sports.filter(
      (sport) => sport.value === info.sport,
    )[0];

    const format = Object.values(sport.formats).filter(
      (format) => format.value === info.format,
    )[0];
    const {
      transfertWinner,
      totalAmount,
      creditCardCharge,
      totalWallet,
    } = dataCheckout;
    return (
      <View style={[styleApp.marginView, {paddingTop: 0}]}>
        <Text style={[styleApp.title, {fontSize: 20}]}>{info.name}</Text>
        <View style={[styleApp.divider2, {marginBottom: 10}]} />

        {this.rowIcon(sport.icon, this.title(sport.text), 'font', true)}
        {this.rowIcon(
          subscribe ? images[0] : info.image,
          this.title(location.address),
          'font',
          true,
        )}
        <View style={{height: 5}} />
        {this.rowIcon(format.icon, this.title(format.text), 'font')}
        <View style={{height: 5}} />
        {this.rowIcon(
          'cogs',
          this.title(
            '$' +
              challenge.price.amount +
              ' challenge, money multiple ' +
              challenge.price.odds,
          ),
          'font',
        )}
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

        <View style={{height: 10}} />
        {info.instructions !== '' &&
          this.rowIcon('parking', this.title(info.instructions), 'font')}

        {!subscribe && (
          <View style={[styleApp.divider2, {marginBottom: 0, marginTop: 10}]} />
        )}

        {!subscribe && this.listMembers(challenge.teamsData)}
        <View style={[styleApp.divider2, {marginBottom: 10, marginTop: 5}]} />

        {totalAmount === 0 ? null : this.props.userConnected ? (
          <View>
            {this.rowText(
              'Total',
              colors.title,
              'OpenSans-SemiBold',
              '$' + Number(totalAmount.toFixed(2)),
            )}
          </View>
        ) : (
          <View>
            {this.rowText(
              'Total',
              colors.title,
              'OpenSans-SemiBold',
              '$' + Number(totalAmount.toFixed(2)),
            )}
          </View>
        )}

        {this.props.userConnected &&
          totalAmount !== 0 &&
          this.rowText(
            'Credits',
            colors.green,
            'OpenSans-SemiBold',
            '$' + Number(Number(totalWallet).toFixed(2)),
          )}

        <View>
          {this.rowText(
            'Pay now',
            colors.title,
            'OpenSans-SemiBold',
            '$' + Number(Number(creditCardCharge).toFixed(2)),
          )}
          {/* <View style={[styleApp.divider2, {marginBottom: 0, marginTop: 10}]} /> */}
        </View>

        <View style={{height: 10}} />

        {this.props.userConnected && creditCardCharge !== 0 && (
          <CardCreditCard
            navigate={(val, data) => this.props.navigation.navigate(val, data)}
          />
        )}

        <View style={{height: 15}} />
        {this.reminder(challenge, subscribe, transfertWinner, creditCardCharge)}
      </View>
    );
  }
  async submit(challenge, dataCheckout) {
    this.setState({loader: true});

    const {dismiss} = this.props.navigation;
    const {
      userID,
      infoUser,
      tokenCusStripe,
      defaultCard,
      totalWallet,
    } = this.props;

    const payEntryChallenge = await payEntryFee(
      new Date().toString(),
      dataCheckout.totalAmount,
      userID,
      {
        tokenCusStripe: tokenCusStripe,
        defaultCard: defaultCard,
        totalWallet: totalWallet,
      },
      infoUser,
    );

    if (!payEntryChallenge.response) {
      await this.setState({loader: false});
      return this.props.navigation.navigate('Alert', {
        close: true,
        title: 'An error has occured.',
        subtitle: 'Please try again.',
        textButton: 'Got it!',
      });
    }

    const newChallenge = await createChallenge(challenge, userID, infoUser);
    if (!newChallenge) {
      await this.setState({loader: false});
      return this.props.navigation.navigate('Alert', {
        close: true,
        title: 'An error has occured.',
        subtitle: 'Please try again.',
        textButton: 'Got it!',
      });
    }
    await this.props.eventsAction('setAllEvents', {
      [newChallenge.objectID]: newChallenge,
    });
    await this.props.eventsAction('addFutureEvent', newChallenge.objectID);

    ///// create branch link
    const {url, description} = await createBranchUrl(
      newChallenge,
      'Challenge',
      newChallenge.images[0],
    );

    //////// get phone numbers from contact players
    const teams = newChallenge.teams;
    const totalMembersArray = Object.values(teams)
      .filter(
        (team) =>
          Object.values(team.members).filter((member) => member.index)
            .length !== 0,
      )
      .map((team) => Object.values(team.members));
    const allPhoneNumbers = [].concat
      .apply([], totalMembersArray)
      .map((member) => member.info.phoneNumber);

    /////// send sms
    if (allPhoneNumbers.length !== 0)
      await sendSMSFunction(allPhoneNumbers, description + ' ' + url);

    var that = this;
    setTimeout(async function () {
      await that.props.historicSearchAction('setSport', {
        value: newChallenge.info.sport,
        league: 'all',
      });
      await dismiss();

      await that.props.createChallengeAction('reset');
      await that.setState({loader: false});
      return true;
    }, 400);
  }
  async submitAttendance(challenge, dataCheckout) {
    this.setState({loader: true});
    const {goBack} = this.props.navigation;

    const {userID, infoUser, tokenCusStripe, defaultCard, route} = this.props;
    const {selectedUser} = route.params;
    const {totalWallet} = this.state;

    const payEntryChallenge = await payEntryFee(
      new Date().toString(),
      dataCheckout.totalAmount,
      userID,
      {
        tokenCusStripe: tokenCusStripe,
        defaultCard: defaultCard,
        totalWallet: totalWallet,
      },
      infoUser,
    );
    if (!payEntryChallenge.response) {
      await this.setState({loader: false});
      return this.props.navigation.navigate('Alert', {
        close: true,
        title: 'An error has occured.',
        subtitle: 'Please try again.',
        textButton: 'Got it!',
      });
    }

    if (selectedUser) {
      await firebase
        .database()
        .ref(
          'challenges/' + challenge.objectID + '/teams/' + selectedUser.team.id,
        )
        .update({status: 'confirmed', amountPaid: dataCheckout.totalAmount});
      await firebase
        .database()
        .ref(
          'challenges/' +
            challenge.objectID +
            '/teams/' +
            selectedUser.team.id +
            '/members/' +
            selectedUser.id,
        )
        .remove();
      await firebase
        .database()
        .ref(
          'challenges/' +
            challenge.objectID +
            '/teams/' +
            selectedUser.team.id +
            '/members/' +
            userID,
        )
        .update({
          id: userID,
          info: infoUser,
          status: 'confirmed',
        });
    } else {
      const teamUser = Object.values(challenge.teams).filter(
        (team) => team.captain.id === userID,
      )[0];
      await firebase
        .database()
        .ref('challenges/' + challenge.objectID + '/teams/' + teamUser.id)
        .update({status: 'confirmed', amountPaid: dataCheckout.totalAmount});

      await firebase
        .database()
        .ref(
          'challenges/' +
            challenge.objectID +
            '/teams/' +
            teamUser.id +
            '/members/' +
            userID,
        )
        .update({status: 'confirmed'});
    }

    await this.setState({loader: false});
    return goBack();
  }
  reminder(challenge, subscribe, transfertWinner, creditCardCharge) {
    if (!subscribe)
      return (
        <Text style={[styleApp.title, {fontSize: 13}]}>
          Reminder •{' '}
          <Text style={{fontFamily: 'OpenSans-Regular'}}>
            We will charge the challenge entry fee at the point of creating the
            challenge. You will be able to cancel and get refunded until your
            oponent confirms the challenge.{'\n'}
            {'\n'}
            You will receive{' '}
            <Text style={styleApp.textBold}>${transfertWinner}</Text> if you win
            the challenge. Your oponent will pay{' '}
            <Text style={styleApp.textBold}>
              $
              {challenge.price.amount *
                Math.max(0, challenge.price.odds - 1).toFixed(1)}
            </Text>{' '}
            to accept the challenge.
          </Text>
        </Text>
      );
    return (
      <Text style={[styleApp.title, {fontSize: 13}]}>
        Reminder •{' '}
        <Text style={{fontFamily: 'OpenSans-Regular'}}>
          {creditCardCharge !== 0 &&
            'We will charge the challenge entry fee at the point of accepting the challenge.' +
              '\n' +
              '\n'}
          You will receive{' '}
          <Text style={styleApp.textBold}>${transfertWinner}</Text> if you win
          the challenge.
        </Text>
      </Text>
    );
  }
  conditionButtonOn(creditCardCharge, defaultCard) {
    if (creditCardCharge !== 0 && !defaultCard) return false;
    return true;
  }
  render() {
    const {goBack} = this.props.navigation;
    const {route} = this.props;
    const {challenge, subscribe} = route.params;

    let {defaultCard} = this.props;
    let {totalWallet} = this.state;
    totalWallet = Number(totalWallet);

    const {amount, odds} = challenge.price;
    const k = amount * Math.max(0, odds - 1);

    let totalAmount = amount;
    if (subscribe) totalAmount = k;

    const creditCardCharge = Math.min(
      totalAmount,
      Math.max(0, totalAmount - totalWallet),
    );

    const transfertWinner = amount + amount * Math.max(0, odds - 1);
    const dataCheckout = {
      transfertWinner,
      totalAmount,
      creditCardCharge,
      totalWallet,
    };
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
          clickButton1={() => goBack()}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() =>
            this.summary(challenge, subscribe, dataCheckout)
          }
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={false}
        />

        <View style={styleApp.footerBooking}>
          {this.props.userConnected && !subscribe ? (
            <Button
              icon={'next'}
              backgroundColor="green"
              onPressColor={colors.greenLight}
              styleButton={{marginLeft: 20, width: width - 40}}
              disabled={!this.conditionButtonOn(creditCardCharge, defaultCard)}
              text={'Pay & Create challenge'}
              loader={this.state.loader}
              click={() => this.submit(challenge, dataCheckout)}
            />
          ) : this.props.userConnected && subscribe ? (
            <Button
              icon={'next'}
              backgroundColor="green"
              onPressColor={colors.greenLight}
              styleButton={{marginLeft: 20, width: width - 40}}
              disabled={!this.conditionButtonOn(creditCardCharge, defaultCard)}
              text={
                creditCardCharge === 0
                  ? 'Accept challenge'
                  : 'Pay & Accept challenge'
              }
              loader={this.state.loader}
              click={() => this.submitAttendance(challenge, dataCheckout)}
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
  createChallengeAction,
  historicSearchAction,
  groupsAction,
})(SummaryChallenge);
