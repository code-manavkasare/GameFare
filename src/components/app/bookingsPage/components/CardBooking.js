import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {string} from 'prop-types';
import {Col, Row} from 'react-native-easy-grid';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {navigate} from '../../../../../NavigationService';

import {bindBooking, unbindBooking} from '../../../database/firebase/bindings';
import {boolShouldComponentUpdate} from '../../../functions/redux';
import {userIDSelector} from '../../../../store/selectors/user';
import {removeService} from '../../../functions/clubs';
import AllIcon from '../../../layout/icons/AllIcons';
import {bookingSelector} from '../../../../store/selectors/bookings';
import CardService from '../../clubSettings/components/CardService';
import Button from '../../../layout/buttons/Button';
import {updateBookingStatusAlert} from '../../../functions/booking';
import {capitalize} from '../../../functions/coach';

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

  removeService = () => {
    const {service, clubID} = this.props;
    const {id, title} = service;
    navigate('Alert', {
      title: 'Are you sure you want to delete ' + title + '?',
      subtitle: 'This action cannot be undone.',
      textButton: `Delete`,
      colorButton: 'red',
      onPressColor: colors.red,
      onGoBack: async () => removeService({clubID, serviceID: id}),
    });
  };
  openConversation = () => {
    const {id} = this.props.booking;
    console.log('id', id);
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
  rowButtonsStatus = () => {
    const {userID, booking} = this.props;
    const {serviceOwnerID, status} = booking;
    if (serviceOwnerID !== userID || status !== 'pending') return null;
    return (
      <Row>
        <Col size={45}>
          <Button
            backgroundColor="red"
            onPressColor={colors.redLight}
            text={'Decline'}
            styleButton={{height: 55}}
            click={this.declineBooking}
          />
        </Col>
        <Col size={5} />
        <Col size={45}>
          <Button
            backgroundColor="green"
            onPressColor={colors.greenLight}
            text={'Confirm'}
            styleButton={{height: 55}}
            click={this.confirmBooking}
          />
        </Col>
      </Row>
    );
  };
  render() {
    const {booking} = this.props;

    if (!booking) return <View />;
    const {serviceID, status} = booking;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => true}
        style={styles.card}>
        <CardService id={serviceID} displayOwner={true} hideButtons={true} />
        <Row
          style={{
            marginTop: 20,
            paddingBottom: 20,
            paddingTop: 10,
          }}>
          <Col size={60} style={styleApp.center2}>
            <Text style={styles.title}>
              Status: {capitalize(status.toString())}
            </Text>
          </Col>
          <Col size={20} />
          <Col
            size={20}
            style={styleApp.center3}
            activeOpacity={0.6}
            onPress={this.openConversation}>
            <AllIcon
              name="comment-alt"
              type="font"
              size={20}
              color={colors.title}
            />
          </Col>
        </Row>
        {this.rowButtonsStatus()}
      </TouchableOpacity>
    );
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
});

const mapStateToProps = (state, props) => {
  return {
    booking: bookingSelector(state, props),
    userID: userIDSelector(state),
  };
};

export default connect(mapStateToProps)(CardBooking);
