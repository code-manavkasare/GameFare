import React, {Component} from 'react';
import {Animated, View, Text, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Col, Row} from 'react-native-easy-grid';

import styleApp from '../../../style/style';
import {heightHeaderModal} from '../../../style/sizes';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import ScrollView from '../../../layout/scrollViews/ScrollView';
import {userInfoSelector} from '../../../../store/selectors/user';
import {bookingSelector} from '../../../../store/selectors/bookings';
import CardUser from '../../../layout/cards/CardUser';
import ButtonComplete from './ButtonComplete';
import {calculateFees} from '../../../functions/wallet';

class BookingCompletion extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      processingFees: 0,
      serviceCharge: 0,
      total: 0,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  componentDidMount = async () => {
    const {booking} = this.props;
    const {service} = booking;
    const {price} = service;
    const {value} = price;
    const {processingFees, serviceCharge, total} = await calculateFees({
      amount: value,
    });
    this.setState({processingFees, serviceCharge, total});
  };

  rowBooking = ({value, text, styleText}) => {
    return (
      <Row style={styles.padding}>
        <Col style={styleApp.center2}>
          <Text style={[styleApp.text, styleText]}>{text}</Text>
        </Col>
        <Col style={styleApp.center3}>
          <Text style={[styleApp.text, styleText]}>{value}</Text>
        </Col>
      </Row>
    );
  };

  confirmBookingView = () => {
    const {booking} = this.props;
    const {service} = booking;
    const {requestorID} = booking;
    const {price, duration, title} = service;
    const {unit: unitPrice, value: valuePrice} = price;
    const {unit: unitDuration, value: valueDuration} = duration;
    const {processingFees, serviceCharge, total} = this.state;
    return (
      <View style={[styleApp.marginView]}>
        <CardUser id={requestorID} />
        <View style={styles.separator} />
        <Text style={styleApp.title}>{title}</Text>
        <View style={styles.separator} />
        {this.rowBooking({
          text: 'Duration',
          value: `${valueDuration} ${unitDuration}`,
        })}
        <View style={styleApp.divider} />
        {this.rowBooking({
          text: 'Booking Income',
          value: `${unitPrice}${valuePrice}`,
        })}
        {this.rowBooking({
          text: 'Service Charge',
          value: `${unitPrice}${serviceCharge}`,
        })}
        {this.rowBooking({
          text: 'Processing',
          value: `${unitPrice}${processingFees}`,
        })}
        <View style={styleApp.divider} />
        {this.rowBooking({
          text: 'Income Total',
          value: `${unitPrice}${total}`,
          styleText: {fontWeight: 'bold'},
        })}
        <View style={styles.separator} />

        <View style={styles.separator} />
        <Text style={styleApp.smallText}>
          <Text style={[styleApp.textBold, {fontSize: 12}]}> Note •</Text>{' '}
          Completing this booking will charge the requestor immediately.
        </Text>
      </View>
    );
  };
  render() {
    const {navigation, booking} = this.props;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          marginTop={10}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Complete Booking'}
          inputRange={[10, 20]}
          initialBorderColorIcon={'transparent'}
          initialBackgroundColor={'transparent'}
          initialTitleOpacity={1}
          initialBorderWidth={1}
          initialBorderColorHeader={'transparent'}
          icon1={'chevron-left'}
          sizeIcon1={17}
          clickButton1={navigation.goBack}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.confirmBookingView}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={heightHeaderModal + 5}
          offsetBottom={0}
          showsVerticalScrollIndicator={true}
        />
        <View style={[styleApp.footerBook, styleApp.marginView]}>
          <ButtonComplete bookingID={booking.id} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  padding: {paddingTop: 10, paddingBottom: 10},
  separator: {height: 20},
});

const mapStateToProps = (state, props) => {
  const {route} = props;
  const {bookingID} = route.params;
  return {
    infoUser: userInfoSelector(state),
    booking: bookingSelector(state, {id: bookingID}),
  };
};

export default connect(mapStateToProps)(BookingCompletion);
