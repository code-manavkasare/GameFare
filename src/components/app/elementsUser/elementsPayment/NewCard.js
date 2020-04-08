import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  InputAccessoryView,
  Dimensions,
  TextInput,
  Animated,
  Platform,
  Keyboard,
} from 'react-native';
import {connect} from 'react-redux';
const {height, width} = Dimensions.get('screen');
import {Col, Row} from 'react-native-easy-grid';
import Config from 'react-native-config';

import AllIcons from '../../../layout/icons/AllIcons';
import ScrollView from '../../../layout/scrollViews/ScrollView';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

import sizes from '../../../style/sizes';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {cardIcon} from './iconCard';
import ButtonFull from '../../../layout/buttons/ButtonFull';
import axios from 'axios';

class ListEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cardNumber: '',
      expDate: '',
      cvv: '',
      cardType: 'default',
      digitsRequired: 16,
      lengthCVV: 3,
      inputFocus: '',
      loader: false,
      error: false,
      errorMessage: '',
      zipCode: '',
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {}

  doneScan(card) {
    var numberCard = card.cardNumber.toString();
    numberCard =
      numberCard.slice(0, 4) +
      ' ' +
      numberCard.slice(4, 8) +
      ' ' +
      numberCard.slice(8, 12) +
      ' ' +
      numberCard.slice(12, numberCard.length);
    this.changeCardNumber(numberCard, true);
    var expiryMonth = card.expiryMonth.toString();
    if (expiryMonth != 0) {
      if (expiryMonth.length == 1) {
        expiryMonth = '0' + expiryMonth;
      } else {
        expiryMonth = expiryMonth.toString();
      }
      var expiryYear = card.expiryYear.toString();
      expiryYear = expiryYear.slice(2, 4);
      var date = expiryMonth + '/' + expiryYear;
      this.setState({expDate: date});
      this.cvvTextInput.focus();
    } else {
      this.dateTextInput.focus();
    }
    this.props.navigation.navigate('NewCard');
  }
  async submit() {
    this.setState({loader: true, error: false});
    if (Platform.OS === 'android') {
      Keyboard.dismiss();
    }
    var expiry = this.state.expDate;
    expiry = expiry.split('/');
    const monthExpiry = expiry[0];
    const yearExpiry = expiry[1];

    const urlCreateToken = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}createTokenCard`;
    let response = await axios.get(urlCreateToken, {
      params: {
        number: this.state.cardNumber,
        exp_month: monthExpiry,
        exp_year: yearExpiry,
        cvc: this.state.cvv,
        address_zip: this.state.zipCode,
      },
    });
    response = response.data;
    if (response.error) {
      this.wrongCB(response.error.message);
    } else {
      var url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}addUserCreditCard`;
      let promiseAddCreditCard = await axios.get(url, {
        params: {
          tokenCard: response.token,
          userID: this.props.userID,
          name:
            this.props.infoUser.firstname + ' ' + this.props.infoUser.lastname,
          email: this.props.infoUser.email ? this.props.infoUser.email : '',
          tokenStripeCus: this.props.tokenCusStripe,
          brand: response.brand,
        },
      });
      promiseAddCreditCard = promiseAddCreditCard.data;
      if (promiseAddCreditCard.response) {
        Keyboard.dismiss();
        this.props.navigation.dangerouslyGetParent().pop()
      } else {
        if (promiseAddCreditCard.message) {
          this.wrongCB(promiseAddCreditCard.message);
        } else {
          this.wrongCB('An error has occured. Please verify your entry.');
        }
      }
    }
  }
  changeCardNumber(rawText, auto) {
    var currentText = this.state.cardNumber;
    var text = rawText.replace(' ', '');
    var slice4 = Number(text.slice(0, 4));
    var slice2 = Number(text.slice(0, 2));
    var slice6 = Number(text.slice(0, 6));
    var digitsRequired = 19;
    var lengthCVV = 3;
    var cardType = 'default';
    if (text[0] == '4') {
      cardType = 'Visa';
      digitsRequired = 23;
    } else if (text[0] == '3' && (text[1] == '4' || text[1] == '7')) {
      cardType = 'American Express';
      lengthCVV = 4;
      digitsRequired = 19;
    } else if (
      (text[0] == '5' &&
        (text[1] == '1' ||
          text[1] == '2' ||
          text[1] == '3' ||
          text[1] == '4' ||
          text[1] == '5')) ||
      (text[0] == '2' &&
        (text[1] == '3' ||
          text[1] == '4' ||
          text[1] == '5' ||
          text[1] == '6' ||
          text[1] == '7'))
    ) {
      cardType = 'MasterCard';
      digitsRequired = 19;
    } else if (
      (slice6 >= 300000 && slice6 <= 305999) ||
      (slice6 >= 309500 && slice6 <= 309599) ||
      (slice6 >= 360000 && slice6 <= 369999) ||
      (slice6 >= 380000 && slice6 <= 399999)
    ) {
      cardType = 'Diners Club';
      digitsRequired = 17;
    } else if (
      slice6 == 601174 ||
      (slice6 >= 601100 && slice6 <= 601109) ||
      (slice6 >= 601120 && slice6 <= 601149) ||
      (slice6 >= 601177 && slice6 <= 601179) ||
      (slice6 >= 601186 && slice6 <= 601199) ||
      (slice6 >= 644000 && slice6 <= 659999)
    ) {
      cardType = 'Discover';
      digitsRequired = 19;
    } else if (
      slice2 == 50 ||
      (slice2 >= 56 && slice2 <= 64) ||
      (slice2 >= 66 && slice2 <= 69)
    ) {
      cardType = 'default';
      digitsRequired = 23;
    } else if (slice4 >= 3528 && slice4 <= 3589) {
      cardType = 'JCB';
      digitsRequired = 23;
    } else {
      cardType = 'default';
      digitsRequired = 23;
    }
    var newText = '';
    if (rawText.length == 4) {
      newText = rawText + ' ';
    } else if (rawText.length == 5 && currentText.length == 6) {
      newText = rawText.replace(' ', '');
    } else if (rawText.length == 5 && currentText.length == 4) {
      newText = currentText + ' ' + rawText[4];
    } else if (rawText.length == 9) {
      newText = rawText + ' ';
    } else if (rawText.length == 10 && currentText.length == 11) {
      newText = rawText.slice(0, 9);
    } else if (rawText.length == 10 && currentText.length == 9) {
      newText = currentText + ' ' + rawText[9];
    } else if (rawText.length == 14) {
      newText = rawText + ' ';
    } else if (rawText.length == 15 && currentText.length == 16) {
      newText = rawText.slice(0, 14);
    } else if (rawText.length == 15 && currentText.length == 14) {
      newText = currentText + ' ' + rawText[14];
    } else {
      newText = rawText;
    }
    if (rawText.length == digitsRequired && auto == false) {
      this.dateTextInput.focus();
    }
    this.setState({
      lengthCVV: lengthCVV,
      cardNumber: newText,
      digitsRequired: digitsRequired,
      cardType: cardType,
    });
  }
  changedate(text) {
    var newText = '';
    var currentVal = this.state.expDate;
    if (text.length == 2 && currentVal.length == 3) {
      newText = text;
    } else if (text.length == 2) {
      newText = text + '/';
    } else if (text.length == 3 && currentVal.length == 4) {
      newText = text.replace('/', '');
    } else if (text.length == 3 && currentVal.length == 2) {
      newText = currentVal + '/' + text[2];
    } else if (text.length == 5) {
      newText = text;
      this.cvvTextInput.focus();
    } else {
      newText = text;
    }
    this.setState({expDate: newText});
  }
  changecvv(text) {
    this.setState({cvv: text});
  }
  wrongCB(message) {
    this.setState({loader: false, error: true, errorMessage: message});
  }
  payments() {
    return (
      <View style={styleApp.marginView}>
        <TouchableOpacity
          style={[styleApp.inputForm, {borderBottomWidth: 1}]}
          activeOpacity={0.7}
          onPress={() => this.numberTextInput.focus()}>
          <Row>
            <Col size={15} style={styleApp.center2}>
              {cardIcon(this.state.cardType)}
            </Col>
            <Col size={70} style={styleApp.center2}>
              <TextInput
                placeholder="Card number"
                style={styleApp.input}
                onChangeText={(text) => {
                  this.changeCardNumber(text, false);
                }}
                keyboardType="number-pad"
                autoFocus={true}
                underlineColorAndroid="rgba(0,0,0,0)"
                onFocus={() => {
                  this.setState({inputFocus: 'number'});
                }}
                onBlur={() => {
                  this.setState({inputFocus: ''});
                }}
                inputAccessoryViewID={'cardNumber'}
                ref={(input) => {
                  this.numberTextInput = input;
                }}
                value={this.state.cardNumber}
                maxLength={this.state.digitsRequired}
              />
            </Col>
            <Col
              size={15}
              style={styleApp.center}
              activeOpacity={0.7}
              onPress={() =>
                this.props.navigation.navigate('Scan', {
                  onGoBack: (data) => this.doneScan(data),
                })
              }>
              <AllIcons
                color={colors.title}
                size={20}
                name="camera"
                type="font"
              />
            </Col>
          </Row>
        </TouchableOpacity>

        <Row style={{height: 55, marginTop: 5, marginBottom: 10}}>
          <Col size={40}>
            <TouchableOpacity
              style={[styleApp.inputForm, styleApp.center2]}
              activeOpacity={0.8}
              onPress={() => {
                this.dateTextInput.focus();
              }}>
              <TextInput
                placeholder="MM/YY"
                style={styleApp.input}
                onChangeText={(text) => {
                  this.changedate(text);
                }}
                keyboardType="number-pad"
                underlineColorAndroid="rgba(0,0,0,0)"
                inputAccessoryViewID={'cardNumber'}
                onFocus={() => {
                  this.setState({inputFocus: 'date'});
                }}
                onBlur={() => {
                  this.setState({inputFocus: ''});
                }}
                ref={(input) => {
                  this.dateTextInput = input;
                }}
                value={this.state.expDate}
                maxLength={5}
              />
            </TouchableOpacity>
          </Col>
          <Col size={10}></Col>
          <Col size={40}>
            <TouchableOpacity
              style={[styleApp.inputForm, styleApp.center2]}
              activeOpacity={0.8}
              onPress={() => {
                this.cvvTextInput.focus();
              }}>
              <TextInput
                placeholder="CVV"
                style={styleApp.input}
                underlineColorAndroid="rgba(0,0,0,0)"
                inputAccessoryViewID={'cardNumber'}
                onChangeText={(text) => {
                  this.changecvv(text);
                }}
                keyboardType="number-pad"
                onFocus={() => {
                  this.setState({inputFocus: 'cvv'});
                }}
                onBlur={() => {
                  this.setState({inputFocus: ''});
                }}
                ref={(input) => {
                  this.cvvTextInput = input;
                }}
                value={this.state.cvv}
                maxLength={this.state.lengthCVV}
              />
            </TouchableOpacity>
          </Col>
        </Row>

        <TouchableOpacity
          style={styleApp.inputForm}
          activeOpacity={0.7}
          onPress={() => this.zipTextInput.focus()}>
          <Row>
            <Col size={15} style={styleApp.center2}>
              <AllIcons
                color={colors.title}
                size={20}
                name="search-location"
                type="font"
              />
            </Col>
            <Col size={85} style={styleApp.center2}>
              <TextInput
                placeholder="Zip code"
                style={styleApp.input}
                onChangeText={(text) => {
                  this.setState({zipCode: text});
                }}
                keyboardType="number-pad"
                underlineColorAndroid="rgba(0,0,0,0)"
                inputAccessoryViewID={'cardNumber'}
                onFocus={() => {
                  this.setState({inputFocus: 'zip'});
                }}
                onBlur={() => {
                  this.setState({inputFocus: ''});
                }}
                ref={(input) => {
                  this.zipTextInput = input;
                }}
                value={this.state.zipCode}
                maxLength={6}
              />
            </Col>
          </Row>
        </TouchableOpacity>

        {this.state.error == true ? (
          <Text style={[styleApp.subtitle, {marginTop: 20, fontSize: 14}]}>
            {this.state.errorMessage}
          </Text>
        ) : null}
      </View>
    );
  }
  render() {
    return (
      <View style={[styleApp.stylePage]}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Credit/Debit card'}
          inputRange={[20, 50]}
          initialTitleOpacity={0}
          initialBackgroundColor={'white'}
          initialBorderColorIcon={'white'}
          icon1="arrow-left"
          clickButton1={() => this.props.navigation.goBack()}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={this.payments.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={true}
        />

        <InputAccessoryView nativeID={'cardNumber'}>
          <ButtonFull
            backgroundColor={'green'}
            onPressColor={colors.greenClick}
            enable={
              !(
                this.state.cardNumber.length == 0 ||
                this.state.cvv.length < 3 ||
                this.state.expDate.length < 5 ||
                this.state.zipCode.length == 0
              )
            }
            text="Confirm"
            click={() => this.submit()}
            loader={this.state.loader}
          />
        </InputAccessoryView>
      </View>
    );
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    defaultCard: state.user.infoUser.wallet.defaultCard,
    cards: state.user.infoUser.wallet.cards,
    tokenCusStripe: state.user.infoUser.wallet.tokenCusStripe,
  };
};

export default connect(mapStateToProps, {})(ListEvent);
