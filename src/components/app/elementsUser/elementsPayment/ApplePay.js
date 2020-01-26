import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Platform,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
const {height, width} = Dimensions.get('screen');
import firebase from 'react-native-firebase';
import {Col, Row, Grid} from 'react-native-easy-grid';
import AllIcons from '../../../layout/icons/AllIcons';
import Header from '../../../layout/headers/HeaderButton';
import ScrollView from '../../../layout/scrollViews/ScrollView';
import BackButton from '../../../layout/buttons/BackButton';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

import sizes from '../../../style/sizes';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import Loader from '../../../layout/loaders/Loader';

import stripe from 'tipsi-stripe';

stripe.setOptions({
  publishableKey: 'pk_live_wO7jPfXmsYwXwe6BQ2q5rm6B00wx0PM4ki',
  merchantId: 'merchant.gamefare',
  androidPayMode: 'test',
});

class ListEvent extends Component {
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
    await this.setState({message: message});
    this.setState({loader: false});
  }
  addNewPaymentMethod(brand, title) {
    var card = {
      brand: brand,
      id: brand,
      title: title,
    };
    firebase
      .database()
      .ref('users/' + this.props.userID + '/wallet/defaultCard/')
      .update(card);
    if (this.props.cards) {
      if (
        Object.values(this.props.cards).filter(
          (card) => card.brand === 'applePay',
        ).length == 0
      ) {
        firebase
          .database()
          .ref('users/' + this.props.userID + '/wallet/cards/' + brand)
          .update(card);
      }
    } else {
      firebase
        .database()
        .ref('users/' + this.props.userID + '/wallet/cards/' + brand)
        .update(card);
    }
  }
  applePayComponent() {
    return (
      <View style={{marginTop: 20, paddingLeft: 20, paddingRight: 20}}>
        <Row>
          {this.state.loader == true ? (
            <Col style={styleApp.center}>
              <Loader color="primary" size={20} />
            </Col>
          ) : (
            <Col>
              <Text style={styleApp.text}>{this.state.message}</Text>
            </Col>
          )}
        </Row>
      </View>
    );
  }
  render() {
    return (
      <View style={[styleApp.stylePage]}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Apple Pay'}
          inputRange={[20, 50]}
          initialTitleOpacity={0}
          initialBackgroundColor={'white'}
          initialBorderColorIcon={'white'}
          icon1="arrow-left"
          icon2="text"
          text2="Close"
          clickButton1={() => this.props.navigation.goBack()}
          clickButton2={() => this.props.navigation.dismiss()}
        />
        <ScrollView
          // style={{marginTop:sizes.heightHeaderHome}}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.applePayComponent.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    defaultCard: state.user.infoUser.wallet.defaultCard,
    cards: state.user.infoUser.wallet.cards,
  };
};

export default connect(mapStateToProps, {})(ListEvent);
