import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  InputAccessoryView,
  Dimensions,
  TextInput,
  Animated,
  Image,
} from 'react-native';
import {connect} from 'react-redux';
const {height, width} = Dimensions.get('screen');
import {Col, Row} from 'react-native-easy-grid';
import Config from 'react-native-config';
import database from '@react-native-firebase/database';
import moment from 'moment';
import DateTimePicker from 'react-native-modal-datetime-picker';

import AllIcons from '../../../layout/icons/AllIcons';
import ScrollView from '../../../layout/scrollViews/ScrollView';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
const countriesBankAccount = require('./elementsAddBankAccount/fieldsBankAccount.json');
const ListCountry = require('../../../login/elementsFlags/country.json');

import {heightHeaderHome} from '../../../style/sizes';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import ButtonFull from '../../../layout/buttons/ButtonFull';
import Button from '../../../layout/buttons/Button';
import ButtonColor from '../../../layout/Views/Button';
import axios from 'axios';

class ListEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      ssnNumber: '',
      country: 'US',
      currency: 'usd',
      address: {},
      email: '',
      birthdate: '',
      account_holder_name:
        this.props.infoUser.firstname + ' ' + this.props.infoUser.lastname,
      isDateTimePickerVisible: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.focusNextField = this.focusNextField.bind(this);
    this.hideDateTimePicker = this.hideDateTimePicker.bind(this);
    this.handleDatePicked = this.handleDatePicked.bind(this);
    this.inputs = {};
  }
  async componentDidMount() {}
  focusNextField(id) {
    this.inputs[id].focus();
  }
  unfocusNextField(id) {
    this.inputs[id].blur();
  }
  async submit() {
    this.setState({loader: true, error: false});
    const {userID, infoUser} = this.props;
    const {
      birthdate,
      address,
      ssnNumber,
      currency,
      country,
      email,
    } = this.state;
    const {navigate} = this.props.navigation;

    //////////////// Create Strip Connect account /////////////////
    const urlCreateUserConnectAccount = `${
      Config.FIREBASE_CLOUD_FUNCTIONS_URL
    }createUserStripeAccount`;
    let responseCreateConnectAccount = await axios.get(
      urlCreateUserConnectAccount,
      {
        params: {
          userID: userID,
          country: country,
          currency: currency,
          ssnNumber: ssnNumber.replace(' ', ''),

          birthdate: birthdate,
          firstname: infoUser.firstname,
          lastname: infoUser.lastname,
          email: email,
          phone: infoUser.countryCode + infoUser.phoneNumber,

          address: address.address,
          lat: address.lat,
          lng: address.lng,
        },
      },
    );
    responseCreateConnectAccount = responseCreateConnectAccount.data;
    if (responseCreateConnectAccount.error) {
      return this.wrongCB(responseCreateConnectAccount.error.message);
    }
    /////////////////////////////////////////////////////////////////////

    await database()
      .ref('users/' + userID + '/wallet/')
      .update({
        connectAccountToken: responseCreateConnectAccount.token,
      });
    return navigate('NewBankAccount');
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
  countrySelect(country) {
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
  birthdatSelect() {
    const birthDateSelected = this.state.birthdate !== '';
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={15} style={styleApp.center2}>
                <AllIcons
                  name="birthday-cake"
                  type="font"
                  size={20}
                  color={colors.title}
                />
              </Col>
              <Col size={70} style={styleApp.center2}>
                <Text
                  style={[
                    styleApp.input,
                    {color: birthDateSelected ? colors.title : colors.inputOff},
                  ]}>
                  {birthDateSelected
                    ? moment(this.state.birthdate).format('MMMM D, YYYY')
                    : 'Date of birth'}
                </Text>
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
        click={() => this.setState({isDateTimePickerVisible: true})}
        onPressColor={colors.off}
      />
    );
  }
  async setLocation(data) {
    await this.setState({address: data});
    return this.props.navigation.navigate('CreateConnectAccount');
  }
  locationSelect() {
    const locationSelected = this.state.address.lat ? true : false;
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={15} style={styleApp.center2}>
                <AllIcons
                  name="location-arrow"
                  type="font"
                  size={20}
                  color={colors.title}
                />
              </Col>
              <Col size={70} style={styleApp.center2}>
                <Text
                  style={[
                    styleApp.input,
                    {color: locationSelected ? colors.title : colors.inputOff},
                  ]}>
                  {locationSelected
                    ? this.state.address.address
                    : 'Billing address'}
                </Text>
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
        click={() =>
          this.props.navigation.navigate('Location', {
            setUniqueLocation: true,
            onGoBack: (data) => this.setLocation(data),
          })
        }
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
              {icon ? (
                <Col size={15} style={styleApp.center2}>
                  <AllIcons
                    name={icon}
                    type="font"
                    size={20}
                    color={colors.title}
                  />
                </Col>
              ) : null}
              <Col size={85} style={styleApp.center2}>
                <TextInput
                  placeholder={field.name}
                  style={styleApp.input}
                  onChangeText={(text) => this.setState({[field.id]: text})}
                  autoFocus={field.autofocus}
                  editable={field.editable}
                  keyboardType={field.keyboardType}
                  underlineColorAndroid="rgba(0,0,0,0)"
                  inputAccessoryViewID={field.id}
                  returnKeyType={'done'}
                  textContentType={
                    field.textContentType ? field.textContentType : null
                  }
                  maxLength={field.maxLength ? field.maxLength : null}
                  autoCompleteType={
                    field.autoCompleteType ? field.autoCompleteType : null
                  }
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
        click={() => (field.editable ? this.focusNextField(field.id) : true)}
        onPressColor={colors.off}
      />
    );
  }
  newBankAccount(country) {
    return (
      <View style={styleApp.marginView}>
        <Text style={[styleApp.title, {marginBottom: 10, marginTop: 30}]}>
          Personal information
        </Text>
        {this.countrySelect(country)}

        {this.field({
          name: 'Account holder name',
          id: 'account_holder_name',
          editable: false,
          keyboardType: 'default',
          autofocus: false,
        })}
        {this.field(
          {
            name: 'Email address',
            id: 'email',
            editable: true,
            keyboardType: 'email-address',
            autofocus: false,
            textContentType: 'emailAddress',
            autoCompleteType: 'email',
          },
          'at',
        )}

        {this.birthdatSelect()}
        {this.locationSelect()}

        <Text style={[styleApp.title, {marginBottom: 10, marginTop: 25}]}>
          Social security number
        </Text>
        {this.field({
          name: 'Last 4 digits',
          id: 'ssnNumber',
          keyboardType: 'number-pad',
          autofocus: false,
          maxLength: 4,
          editable: true,
        })}

        {this.state.error ? (
          <Text style={[styleApp.subtitle, {marginTop: 20, fontSize: 14}]}>
            {this.state.errorMessage}
          </Text>
        ) : null}
      </View>
    );
  }
  buttonActive() {
    const state = this.state;
    if (
      state.birthdate === '' ||
      state.ssnNumber === '' ||
      state.email === '' ||
      !state.address.lat
    ) {
      return false;
    }
    return true;
  }
  render() {
    const codeCountry = this.state.country;
    const country = ListCountry.filter(
      (country) => country.code === codeCountry,
    )[0];
    const buttonActive = this.buttonActive();
    return (
      <View style={[styleApp.stylePage]}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Personal information'}
          inputRange={[5, 10]}
          initialTitleOpacity={0}
          initialBackgroundColor={'white'}
          initialBorderColorIcon={'white'}
          icon1="chevron-left"
          clickButton1={() => this.props.navigation.goBack()}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.newBankAccount(country)}
          marginBottomScrollView={0}
          marginTop={heightHeaderHome}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={true}
        />

        <View style={styleApp.footerBooking}>
          <View style={{marginLeft: 20, width: width - 40}}>
            <Button
              backgroundColor={'green'}
              onPressColor={colors.greenClick}
              text={'Next'}
              disabled={!buttonActive}
              loader={this.state.loader}
              click={() => this.submit()}
            />
          </View>
        </View>

        <DateTimePicker
          headerTextIOS="Pick your date of birth"
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this.handleDatePicked}
          onCancel={this.hideDateTimePicker}
          style={{color: 'white'}}
        />

        <InputAccessoryView nativeID={'ssnNumber'}>
          <ButtonFull
            backgroundColor={'green'}
            onPressColor={colors.greenClick}
            enable={true}
            text="Done"
            click={() => this.unfocusNextField('ssnNumber')}
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
    connectAccountToken: state.user.infoUser.wallet.connectAccountToken,
  };
};

export default connect(
  mapStateToProps,
  {},
)(ListEvent);
