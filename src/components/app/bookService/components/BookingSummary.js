import React, {Component} from 'react';
import {Animated, View, Text, TextInput, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Col, Row} from 'react-native-easy-grid';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {heightHeaderModal} from '../../../style/sizes';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import ScrollView from '../../../layout/scrollViews/ScrollView';
import {
  totalWalletSelector,
  userInfoSelector,
} from '../../../../store/selectors/user';
import {serviceSelector} from '../../../../store/selectors/services';
import CardUser from '../../../layout/cards/CardUser';
import CardCreditCard from '../../elementsUser/elementsPayment/CardCreditCard';
import ButtonBook from './ButtonBook';
import {navigate} from '../../../../../NavigationService';

class BookingSummary extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

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
    const {service, totalWallet} = this.props;

    const {owner, price, duration, title} = service;
    const {unit: unitPrice, value: valuePrice} = price;
    const {unit: unitDuration, value: valueDuration} = duration;
    return (
      <View style={[styleApp.marginView]}>
        <CardUser id={owner} />
        <View style={styles.separator} />
        <Text style={styleApp.title}>{title}</Text>
        {this.rowBooking({
          text: 'Duration',
          value: `${valueDuration} ${unitDuration}`,
        })}
        <View style={styles.separator} />
        {this.rowBooking({
          text: 'Booking fee',
          value: `${unitPrice}${valuePrice}`,
        })}
        {this.rowBooking({
          text: 'Credits',
          styleText: {color: colors.green},
          value: `$${totalWallet}`,
        })}
        <View style={styleApp.divider} />
        {this.rowBooking({
          text: 'Charge',
          value: `$${Math.max(0, valuePrice - totalWallet)}`,
          styleText: {fontWeight: 'bold'},
        })}
        <View style={styles.separator} />

        <CardCreditCard />
        <View style={styles.separator} />
        <Text style={styleApp.smallText}>
          <Text style={[styleApp.textBold, {fontSize: 12}]}> Reminder •</Text>{' '}
          Text explaining booking here
        </Text>
      </View>
    );
  };
  render() {
    const {navigation, service, route} = this.props;
    const {clubID} = route.params;
    const {id} = service;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          marginTop={10}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Booking summary'}
          inputRange={[10, 20]}
          initialBorderColorIcon={'transparent'}
          initialBackgroundColor={'transparent'}
          initialTitleOpacity={1}
          initialBorderWidth={1}
          initialBorderColorHeader={'transparent'}
          icon1={'chevron-left'}
          clickButton1={navigation.goBack}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.confirmBookingView}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={heightHeaderModal}
          offsetBottom={0}
          showsVerticalScrollIndicator={true}
        />
        <View style={[styleApp.footerBook, styleApp.marginView]}>
          <ButtonBook serviceID={id} clubID={clubID} navigation={navigation} />
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
  const {serviceID} = route.params;
  return {
    infoUser: userInfoSelector(state),
    service: serviceSelector(state, {id: serviceID}),
    totalWallet: totalWalletSelector(state),
  };
};

export default connect(mapStateToProps)(BookingSummary);
