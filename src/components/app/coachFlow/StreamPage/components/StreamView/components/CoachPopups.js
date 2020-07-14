import React, {Component} from 'react';
import {View, Text, Image, StyleSheet, Animated, Switch} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import database from '@react-native-firebase/database';

import {coachAction} from '../../../../../../../actions/coachActions';
import {navigate} from '../../../../../../../../NavigationService';
import {timeout} from '../../../../../../functions/coach';

import CardCreditCard from '../../../../../../app/elementsUser/elementsPayment/CardCreditCard';
import ImageUser from '../../../../../../layout/image/ImageUser';
import ButtonAcceptPayment from '../../../../../../layout/buttons/ButtonAcceptPayment';
import isEqual from 'lodash.isequal';

class CoachPopups extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  getInfoCoach(props) {
    const {members, userID} = props;
    if (!members) return false;
    const coaches = Object.values(members).filter(
      (member) =>
        member.id !== userID && member.info.coach && member.isConnected,
    );
    if (coaches.length !== 0) return coaches[0];
    return false;
  }
  async componentDidUpdate(prevProps, prevState) {
    const {
      infoUser,
      member,
      defaultCard,
      cards,
      coachSessionID,
      currentSessionID,
    } = this.props;
    await timeout(200);
    if (coachSessionID === currentSessionID) {
      if (
        this.props.isConnected &&
        member.permissionOtherUserToRecord !== undefined
      ) {
        if (infoUser.coach && member.chargeForSession === undefined) {
          return this.openCoachIsCharging();
        }
      }

      const prevCoach = this.getInfoCoach(prevProps);
      const coach = this.getInfoCoach(this.props);

      if (
        !isEqual(prevCoach.isConnected, coach.isConnected) &&
        coach.isConnected &&
        coach.chargeForSession &&
        member.isConnected
      )
        return this.openMemberAcceptCharge(true);
    }
  }
  isSessionFree() {
    const coach = this.getInfoCoach(this.props);
    if (!coach) return true;
    return !coach.chargeForSession;
  }
  async openMemberAcceptCharge(forceCloseSession) {
    const {
      coachSessionID,
      endCoachSesion,
      userID,
      close,
      open,
      closeStream,
      defaultCard,
      tokenCusStripe,
      card,
    } = this.props;
    const coach = this.getInfoCoach(this.props);

    const {hourlyRate, currencyRate} = coach.info;
    const setAcceptCharge = async (val) => {
      let updates = {};
      updates[
        `coachSessions/${coachSessionID}/members/${userID}/acceptCharge`
      ] = val;
      updates[`coachSessions/${coachSessionID}/members/${userID}/payment`] = {
        tokenStripe: tokenCusStripe,
        cardID: defaultCard.id,
      };
      await database()
        .ref()
        .update(updates);

      open(true);
    };
    if (forceCloseSession) await close();
    navigate('Alert', {
      textButton: 'Allow',
      title: 'This session requires a payment.',
      subtitle: `Your coach's hourly rate is ${currencyRate}$${hourlyRate}. You will be charged $${(
        hourlyRate / 60
      ).toFixed(1)}/min spent on the session.`,
      displayList: true,
      disableClickOnBackdrop: true,
      close: false,
      icon: <ImageUser user={coach} />,
      componentAdded: <CardCreditCard />,
      listOptions: [
        {
          title: 'Decline',
          // forceNavigation: true,
          // operation: () => !card && closeStream(),
        },
        {
          title: 'Accept',
          disabled: !defaultCard,
          button: (
            <ButtonAcceptPayment
              click={() => setAcceptCharge(true)}
              textButton="Accept"
            />
          ),
        },
      ],
    });
  }
  openCoachIsCharging() {
    const {coachSessionID, infoUser, userID} = this.props;
    const {hourlyRate, currencyRate} = infoUser;
    const setChargingSession = async (val) => {
      let updates = {};
      updates[
        `coachSessions/${coachSessionID}/members/${userID}/info/coach`
      ] = true;
      updates[
        `coachSessions/${coachSessionID}/members/${userID}/chargeForSession`
      ] = val;
      updates[
        `coachSessions/${coachSessionID}/members/${userID}/info/currencyRate`
      ] = currencyRate;
      updates[
        `coachSessions/${coachSessionID}/members/${userID}/info/hourlyRate`
      ] = hourlyRate;
      await database()
        .ref()
        .update(updates);
      return true;
    };
    navigate('Alert', {
      title: 'Do you want to charge players for the session?',
      subtitle: `Your hourly rate is ${currencyRate}$${hourlyRate}. The players will be charged $${(
        hourlyRate / 60
      ).toFixed(1)}/min spent on the session.`,
      displayList: true,
      close: false,
      disableClickOnBackdrop: true,
      listOptions: [
        {
          operation: () => setChargingSession(false),
        },
        {
          operation: () => setChargingSession(true),
        },
      ],
    });
  }
  render() {
    return null;
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    currentScreenSize: state.layout.currentScreenSize,
    infoUser: state.user.infoUser.userInfo,
    cards: state.user.infoUser.wallet.cards,
    defaultCard: state.user.infoUser.wallet.defaultCard,
    tokenCusStripe: state.user.infoUser.wallet.tokenCusStripe,
    currentSessionID: state.coach.currentSessionID,
  };
};

CoachPopups.propTypes = {
  isConnected: PropTypes.bool,
  members: PropTypes.object,
};

export default connect(
  mapStateToProps,
  {coachAction},
)(CoachPopups);
