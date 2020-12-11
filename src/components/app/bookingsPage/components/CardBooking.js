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
import Button from '../../../layout/buttons/Button';

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
  cancelBooking = () => {
    const {booking} = this.props;
    updateBookingStatusAlert({bookingID: booking.id, status: 'cancelled'});
  };
  completeBooking = () => {
    const {booking} = this.props;
    updateBookingStatusAlert({bookingID: booking.id, status: 'completed'});
  };
  messageButton = () => {
    const {booking} = this.props;
    const {status} = booking;
    const color =
      status === 'confirmed' || status === 'pending'
        ? 'primary'
        : 'greyMidDark';
    return (
      <Button
        icon={{
          name: 'comment-alt',
          type: 'font',
          size: 15,
          color: colors.white,
          solid: true,
        }}
        textButton={{fontSize: 16}}
        backgroundColor={color}
        onPressColor={colors[color]}
        text={'Message'}
        styleButton={styles.button}
        click={this.openConversation}
      />
    );
  };
  cardInvitationProps() {
    const {booking, userID} = this.props;
    const {serviceOwnerID, requestorID, status} = booking;
    const isServiceOwner = userID === serviceOwnerID;
    const invitationStatus = {
      value: status,
      icon: statusStyles[status].icon,
      backgroundColor: statusStyles[status].backgroundColor,
    };
    if (isServiceOwner) {
      const user = {
        userID: requestorID,
        prefix: 'Service request from ',
      };
      const buttonNo =
        status === 'pending'
          ? {
              action: this.declineBooking,
            }
          : status === 'confirmed'
          ? {
              action: this.cancelBooking,
              text: 'Cancel',
            }
          : null;
      const buttonYes =
        status === 'pending'
          ? {
              action: this.confirmBooking,
            }
          : status === 'confirmed'
          ? {
              action: this.completeBooking,
              text: 'Complete',
            }
          : null;
      return {user, buttonNo, buttonYes, invitationStatus};
    } else {
      const user = {
        userID: serviceOwnerID,
        prefix: 'Request sent to ',
      };
      return {user, invitationStatus};
    }
  }
  invitationCard() {
    const {booking} = this.props;
    const {serviceID, timestamp} = booking;
    const {
      user,
      buttonNo,
      buttonYes,
      invitationStatus,
    } = this.cardInvitationProps();
    return (
      <CardInvitation
        onPress={this.openConversation}
        style={styles.cardInvitation}
        user={user}
        date={timestamp}
        buttonNo={buttonNo}
        buttonYes={buttonYes}
        invitationStatus={invitationStatus}>
        <CardService
          id={serviceID}
          displayOwner={false}
          disableEdit
          disableDelete
          disableBookButton
          styleContainer={styles.serviceContainer}
        />
        {this.messageButton()}
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
  cardInvitation: {marginTop: 10, marginBottom: 20},
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
  button: {
    marginTop: 15,
    height: 40,
  },
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
