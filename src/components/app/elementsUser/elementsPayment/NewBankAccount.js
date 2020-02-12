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
      loader: '',
      routingNumber: '',
      accountNumber: '',
      ssnNumber: '',
      bankName: '',
      name: this.props.infoUser.firstname + ' ' + this.props.infoUser.lastname,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {}

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
    }
  }
  wrongCB(message) {
    this.setState({loader: false, error: true, errorMessage: message});
  }
  newBankAccount() {
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
                placeholder="Bank Name"
                style={styleApp.input}
                onChangeText={(text) => this.setState({bankName: text})}
                autoFocus={true}
                underlineColorAndroid="rgba(0,0,0,0)"
                inputAccessoryViewID={'bankName'}
                ref={(input) => {
                  this.numberTextInput = input;
                }}
                value={this.state.bankName}
                
              />
            </Col>
          </Row>
        </TouchableOpacity>

        <Row style={{height: 55, marginTop: 5, marginBottom: 10}}>
          <Col>
            <TouchableOpacity
              style={[styleApp.inputForm, styleApp.center2]}
              activeOpacity={0.8}
              onPress={() => {
                this.dateTextInput.focus();
              }}>
              <TextInput
                placeholder="Routing number"
                style={styleApp.input}
                onChangeText={(text) => this.setState({routingNumber: text})}
                keyboardType="number-pad"
                underlineColorAndroid="rgba(0,0,0,0)"
                inputAccessoryViewID={'cardNumber'}
                ref={(input) => {
                  this.dateTextInput = input;
                }}
                value={this.state.routingNumber}
              />
            </TouchableOpacity>
          </Col>
        </Row>

        <Row style={{height: 55, marginTop: 5, marginBottom: 10}}>
          <Col>
            <TouchableOpacity
              style={[styleApp.inputForm, styleApp.center2]}
              activeOpacity={0.8}
              onPress={() => {
                this.dateTextInput.focus();
              }}>
              <TextInput
                placeholder="Account number"
                style={styleApp.input}
                onChangeText={(text) => this.setState({accountNumber: text})}
                keyboardType="number-pad"
                underlineColorAndroid="rgba(0,0,0,0)"
                inputAccessoryViewID={'cardNumber'}
                ref={(input) => {
                  this.dateTextInput = input;
                }}
                value={this.state.accountNumber}
              />
            </TouchableOpacity>
          </Col>
        </Row>

        <Row style={{height: 55, marginTop: 5, marginBottom: 10}}>
          <Col>
            <TouchableOpacity
              style={[styleApp.inputForm, styleApp.center2]}
              activeOpacity={0.8}
              onPress={() => {
                this.dateTextInput.focus();
              }}>
              <TextInput
                placeholder="Account number"
                style={styleApp.input}
                onChangeText={(text) => this.setState({name: text})}
                underlineColorAndroid="rgba(0,0,0,0)"
                inputAccessoryViewID={'cardNumber'}
                ref={(input) => {
                  this.dateTextInput = input;
                }}
                value={this.state.name}
              />
            </TouchableOpacity>
          </Col>
        </Row>

        {this.state.error && (
          <Text style={[styleApp.subtitle, {marginTop: 20, fontSize: 14}]}>
            {this.state.errorMessage}
          </Text>
        )}
      </View>
    );
  }
  render() {
    return (
      <View style={[styleApp.stylePage]}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Bank account'}
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
          contentScrollView={this.newBankAccount.bind(this)}
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
                this.state.routingNumber === ''
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
    tokenCusStripe: state.user.infoUser.wallet.tokenCusStripe,
  };
};

export default connect(mapStateToProps, {})(ListEvent);
