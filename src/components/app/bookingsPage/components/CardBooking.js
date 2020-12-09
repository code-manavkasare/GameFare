import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {string} from 'prop-types';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {navigate} from '../../../../../NavigationService';

import {bindBooking, unbindBooking} from '../../../database/firebase/bindings';
import {boolShouldComponentUpdate} from '../../../functions/redux';
import {userIDSelector} from '../../../../store/selectors/user';
import {bookingSelector} from '../../../../store/selectors/bookings';
import CardService from '../../clubSettings/components/CardService';
import {updateBookingStatusAlert} from '../../../functions/booking';
import CardInvitation from '../../clubsPage/components/CardInvitation';

class CardBooking extends Component {
  static propTypes = {
    id: string,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount = () => {
    const {id} = this.props;
    id && bindBooking(id);
  };
  componentWillUnmount = () => {
    const {id} = this.props;
    id && unbindBooking(id);
  };
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'CardBooking',
    });
  }
  openConversation = () => {
    const {id} = this.props.booking;
    navigate('Conversation', {
      id,
    });
  };
  confirmBooking = () => {
    const {booking} = this.props;
    updateBookingStatusAlert({bookingID: booking.id, status: 'confirmed'});
  };
  declineBooking = () => {
    const {booking} = this.props;
    updateBookingStatusAlert({bookingID: booking.id, status: 'declined'});
  };
  invitationCard() {
    const {booking, userID} = this.props;
    const {serviceID, serviceOwnerID, requestorID, status} = booking;
    const isServiceOwner = userID === serviceOwnerID;
    const user = isServiceOwner
      ? {
          userID: requestorID,
          prefix: 'Service request from ',
        }
      : {
          userID: serviceOwnerID,
          prefix: 'Request sent to ',
        };
    const buttonNo =
      isServiceOwner && status === 'pending'
        ? {
            action: this.declineBooking,
          }
        : null;
    const buttonYes =
      isServiceOwner && status === 'pending'
        ? {
            action: this.confirmBooking,
          }
        : null;
    const invitationStatus = {
      value: status,
      icon: statusStyles[status].icon,
      backgroundColor: statusStyles[status].backgroundColor,
    };
    return (
      <CardInvitation
        onPress={this.openConversation}
        style={styles.cardInvitation}
        user={user}
        buttonNo={buttonNo}
        buttonYes={buttonYes}
        invitationStatus={invitationStatus}>
        <CardService
          id={serviceID}
          displayOwner={false}
          disableEdit
          disableDelete
          styleContainer={styles.serviceContainer}
        />
      </CardInvitation>
    );
  }
  render() {
    const {booking} = this.props;
    if (!booking) return <View />;
    return this.invitationCard();
  }
}

const styles = StyleSheet.create({
  card: {
    ...styleApp.marginView,
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: colors.off,
  },
  cardInvitation: {marginBottom: 30},
  title: {
    ...styleApp.textBold,
    fontSize: 17,
    color: colors.title,
  },
  subtitle: {
    ...styleApp.textBold,
    color: colors.title,
    fontSize: 11,
    marginTop: 4,
  },
  serviceContainer: {paddingVertical: null},
});

const statusStyles = {
  pending: {
    icon: {
      type: 'font',
      size: 12,
      name: 'user',
      solid: true,
    },
    backgroundColor: colors.greyMidDark,
  },
  declined: {
    icon: {
      type: 'font',
      size: 12,
      name: 'times',
    },
    backgroundColor: colors.red,
  },
  confirmed: {
    icon: {
      type: 'font',
      size: 12,
      name: 'check',
    },
    backgroundColor: colors.greyDark,
  },
  completed: {
    icon: {
      type: 'font',
      size: 12,
      name: 'check',
    },
    backgroundColor: colors.greenStrong,
  },
  cancelled: {
    icon: {
      type: 'font',
      size: 12,
      name: 'times',
    },
    backgroundColor: colors.red,
  },
};

const mapStateToProps = (state, props) => {
  return {
    booking: bookingSelector(state, props),
    userID: userIDSelector(state),
  };
};

export default connect(mapStateToProps)(CardBooking);
