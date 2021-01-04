import React, {Component} from 'react';
import {View, Text, StyleSheet, Platform, Animated} from 'react-native';
import {connect} from 'react-redux';

import database from '@react-native-firebase/database';

import {Col, Row, Grid} from 'react-native-easy-grid';
import ScrollView from '../../../layout/scrollViews/ScrollView2';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

import {heightHeaderHome} from '../../../style/sizes';
import styleApp from '../../../style/style';
import ButtonColor from '../../../layout/Views/Button';
import colors from '../../../style/colors';
import Loader from '../../../layout/loaders/Loader';
import {stripe} from '../../../functions/stripe';

class ApplePay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    const deviceSupportsApplePay = await stripe.deviceSupportsApplePay();
    var message = '';
    let setup = false;
    if (!deviceSupportsApplePay) {
      message = 'Your device does not support apple pay.';
    } else {
      const canMakeApplePayPayments = await stripe.canMakeApplePayPayments();
      if (!canMakeApplePayPayments) {
        if (Platform.OS === 'ios') {
          message =
            'Apple Pay is not configured yet on this device. Please go to your Wallet app and configure it.';
        } else {
          message =
            'Google Pay is set up and ready for use. You can book your appointments with Google Pay.';
        }
      } else {
        setup = true;
        if (Platform.OS === 'ios') {
          message =
            'Apple Pay is set up and ready for use. You can now use it to join your favourite events.';
          this.setState({message: message});
          await this.addNewPaymentMethod('applePay', 'Apple Pay');
        } else {
          message =
            'Google Pay is set up and ready for use. You can now use it to join your favourite events.';
          this.setState({message: message});
          await this.addNewPaymentMethod('googlePay', 'Google Pay');
        }
      }
    }
    await this.setState({message: message, setup: setup});
    this.setState({loader: false});
  }
  addNewPaymentMethod(brand, title) {
    var card = {
      brand: brand,
      id: brand,
      title: title,
    };
    database()
      .ref('users/' + this.props.userID + '/wallet/defaultCard/')
      .update(card);
    if (this.props.cards) {
      if (
        Object.values(this.props.cards).filter(
          (card) => card.brand === 'applePay',
        ).length == 0
      ) {
        database()
          .ref('users/' + this.props.userID + '/wallet/cards/' + brand)
          .update(card);
      }
    } else {
      database()
        .ref('users/' + this.props.userID + '/wallet/cards/' + brand)
        .update(card);
    }
  }
  applePayComponent() {
    return (
      <View style={{marginTop: 20, paddingLeft: '5%', paddingRight: '5%'}}>
        <Row>
          {this.state.loader ? (
            <Col style={styleApp.center}>
              <Loader color="primary" size={20} />
            </Col>
          ) : (
            <Col>
              <Text style={styleApp.text}>{this.state.message}</Text>
            </Col>
          )}
        </Row>
        {!this.state.setup ? (
          <ButtonColor
            view={() => {
              return (
                <Row>
                  <Col style={styleApp.center}>
                    <Text style={styleApp.text}>Setup Apple Pay</Text>
                  </Col>
                </Row>
              );
            }}
            click={() => stripe.openApplePaySetup()}
            color={colors.white}
            style={styles.buttonCancel}
            onPressColor={colors.off}
          />
        ) : null}
      </View>
    );
  }
  render() {
    const {navigation} = this.props;
    return (
      <View style={[styleApp.stylePage]}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Apple Pay'}
          inputRange={[20, 50]}
          initialTitleOpacity={0}
          initialBackgroundColor={'white'}
          initialBorderColorIcon={'white'}
          icon1="chevron-left"
          icon2="text"
          text2="Close"
          clickButton1={() => navigation.goBack()}
          clickButton2={() => navigation.dangerouslyGetParent().pop()}
        />
        <ScrollView
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.applePayComponent.bind(this)}
          marginBottomScrollView={0}
          marginTop={heightHeaderHome}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonCancel: {
    height: 55,
    borderTopWidth: 0.4,
    borderBottomWidth: 0.4,
    marginTop: 40,
    borderColor: colors.grey,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    defaultCard: state.user.infoUser.wallet.defaultCard,
    cards: state.user.infoUser.wallet.cards,
  };
};

export default connect(mapStateToProps)(ApplePay);
