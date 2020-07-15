import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import database from '@react-native-firebase/database';

import {coachAction} from '../../../../../../../actions/coachActions';
import {navigate} from '../../../../../../../../NavigationService';
import {
  timeout,
  infoCoach,
  openMemberAcceptCharge,
} from '../../../../../../functions/coach';

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
    return infoCoach(members, userID);
  }
  async componentDidUpdate(prevProps, prevState) {
    const {
      infoUser,
      member,
      session,
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
        return openMemberAcceptCharge(session);
    }
  }
  isSessionFree() {
    const coach = this.getInfoCoach(this.props);
    if (!coach) return true;
    return !coach.chargeForSession;
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
