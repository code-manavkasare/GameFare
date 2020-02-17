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
  Image,
  Keyboard,
} from 'react-native';
import {connect} from 'react-redux';
const {height, width} = Dimensions.get('screen');
import {Col, Row} from 'react-native-easy-grid';
import Config from 'react-native-config';
import firebase from 'react-native-firebase';
import DateTimePicker from 'react-native-modal-datetime-picker';

import AllIcons from '../../../layout/icons/AllIcons';
import ScrollView from '../../../layout/scrollViews/ScrollView';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
const countriesBankAccount = require('./elementsAddBankAccount/fieldsBankAccount.json');
const ListCountry = require('../../../login/elementsFlags/country.json');

import sizes from '../../../style/sizes';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {cardIcon} from './iconCard';
import ButtonFull from '../../../layout/buttons/ButtonFull';
import ButtonColor from '../../../layout/Views/Button';
import axios from 'axios';

class ListEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      ssnNumber: '',
      address: {},
      birthdate: '',
      isDateTimePickerVisible: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.focusNextField = this.focusNextField.bind(this);
    this.inputs = {};
  }
  async componentDidMount() {}
  focusNextField(id) {
    this.inputs[id].focus();
  }
  async submit() {
    this.setState({loader: true, error: false});
    const {userID, infoUser} = this.props;
    if (Platform.OS === 'android') {
      Keyboard.dismiss();
    }
    const urlCreateToken = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}createBankAccountToken`;
    let dataCreateToken = await axios.get(urlCreateToken, {
      params: this.state,
    });
    dataCreateToken = dataCreateToken.data;
    if (dataCreateToken.error)
      return this.wrongCB(dataCreateToken.error.message);

    const urlCreateUserConnectAccount = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}createUserConnectAccount`;
    let responseCreateConnectAccount = await axios.get(
      urlCreateUserConnectAccount,
      {
        params: {
          userID: userID,
          birthdate: this.props.dataUser.infoUser.birthdate,
          firstname: infoUser.firstname,
          lastname: infoUser.lastname,
          email: infoUser.email,
          phone: infoUser.countryCode + infoUser.phone,
          ssnNumber: this.state.ssnNumber.replace(' ', ''),
          tokenAccount: dataCreateToken.bankAccount.id,
          address: address,
          lat: lat,
          lng: lng,
        },
      },
    );
    responseCreateConnectAccount = responseCreateConnectAccount.data;
    if (responseCreateConnectAccount.error)
      return this.wrongCB(responseCreateConnectAccount.error.message);

    await firebase
      .database()
      .ref('users/' + userID + '/wallet/')
      .update({
        stripeConnectToken: responseCreateConnectAccount.token,
      });

    await firebase
      .database()
      .ref(
        'users/' +
          userID +
          '/wallet/bankAccounts/' +
          dataCreateToken.bankAccount.id,
      )
      .update(dataCreateToken.bankAccount);
  }
  wrongCB(message) {
    this.setState({loader: false, error: true, errorMessage: message});
  }
  hideDateTimePicker() {
    this.setState({isDateTimePickerVisible: false});
  }
  handleDatePicked(date) {
    var strDate = date.toString();
    this.setState({birthdate: strDate, isDateTimePickerVisible: false});
  }
  countrySelect(country, countryBankAccount) {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={15} style={styleApp.center2}>
                <Image
                  source={{
                    uri: country.flag,
                  }}
                  style={{width: 27, height: 21, borderRadius: 3}}
                />
              </Col>
              <Col size={70} style={styleApp.center2}>
                <Text style={styleApp.input}>{country.name}</Text>
              </Col>
              <Col size={15} style={styleApp.center}>
                <AllIcons
                  name="keyboard-arrow-down"
                  type="mat"
                  size={20}
                  color={colors.title}
                />
              </Col>
            </Row>
          );
        }}
        color={'white'}
        style={[styleApp.inputForm, {borderBottomWidth: 1}]}
        click={() => true}
        onPressColor={colors.off}
      />
    );
  }
  field(field, icon) {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              {icon && (
                <Col size={15} style={styleApp.center2}>
                  <AllIcons
                    name={icon}
                    type="font"
                    size={20}
                    color={colors.title}
                  />
                </Col>
              )}
              <Col size={85} style={styleApp.center2}>
                <TextInput
                  placeholder={field.name}
                  style={styleApp.input}
                  onChangeText={(text) => this.setState({[field.id]: text})}
                  autoFocus={field.autofocus}
                  keyboardType={field.keyboardType}
                  underlineColorAndroid="rgba(0,0,0,0)"
                  inputAccessoryViewID={'bank'}
                  ref={(input) => {
                    this.inputs[field.id] = input;
                  }}
                  value={this.state[field.id]}
                />
              </Col>
            </Row>
          );
        }}
        color={'white'}
        style={[styleApp.inputForm, {borderBottomWidth: 1}]}
        click={() => this.focusNextField(field.id)}
        onPressColor={colors.off}
      />
    );
  }
  newBankAccount(country) {
    return (
      <View style={styleApp.marginView}>
        <Text style={[styleApp.title, {marginBottom: 10, marginTop: 10}]}>
          Personal information
        </Text>
        {this.countrySelect(country)}

        

        {this.field({
          name: 'Account holder name',
          id: 'account_holder_name',
          keyboardType: 'default',
          autofocus: false,
        })}

        {this.state.error && (
          <Text style={[styleApp.subtitle, {marginTop: 20, fontSize: 14}]}>
            {this.state.errorMessage}
          </Text>
        )}
      </View>
    );
  }
  buttonActive(countryBankAccount) {
    const state = this.state;
    if (state.birthdate === '' || state.ssnNumber === '' || !state.address.lat)
      return false;

    return true;
  }
  render() {
    const codeCountry = this.state.country;
    const country = ListCountry.filter(
      (country) => country.code === codeCountry,
    )[0];
    console.log('newBankAccount', country);
    const buttonActive = this.buttonActive();
    console.log('buttonActive', buttonActive);
    return (
      <View style={[styleApp.stylePage]}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Personal information'}
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
          contentScrollView={() =>
            this.newBankAccount(country)
          }
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={true}
        />

        <InputAccessoryView nativeID={'bank'}>
          <ButtonFull
            backgroundColor={'green'}
            onPressColor={colors.greenClick}
            enable={buttonActive}
            text="Confirm"
            click={() => this.submit()}
            loader={this.state.loader}
          />
        </InputAccessoryView>

        <DateTimePicker
          titleIOS="Pick your date of birth"
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this.handleDatePicked}
          onCancel={this.hideDateTimePicker}
          style={{color: 'white'}}
        />
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
