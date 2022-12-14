import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  InputAccessoryView,
  View,
} from 'react-native';
import {connect} from 'react-redux';

import MatIcon from 'react-native-vector-icons/MaterialIcons';
import {Col, Row, Grid} from 'react-native-easy-grid';
import axios from 'axios';
import Config from 'react-native-config';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import Loader from '../../layout/loaders/Loader';
import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';
import {
  formatNumber,
  isValidNumberCheck,
  placeholder,
} from '../../functions/phoneNumber';
import {timeout} from '../../functions/coach';
import {logMixpanel} from '../../functions/logs';
import {formatPhoneNumber} from '../../functions/users';

const ListCountry = require('../elementsFlags/country.json');

export default class PhoneFields extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      phoneNumber: '',
      isValid: false,
    };
    this.changePhone = this.changePhone.bind(this);
  }
  focusPhoneField() {
    this.firstTextInput.focus();
  } 
  shouldComponentUpdate(nextProps, nextState) {
    if (this.state !== nextState) return true;
    else if (this.props.country !== nextProps.country) return true;
    return false;
  }
  async next(phone) {
    this.setState({loader: true});
    logMixpanel({
      label: 'Click next',
      params: {
        phone: phoneNumber,
        countryCode: '+' + this.props.country.callingCode,
      },
    });
    var url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}signUpUser`;
    const phoneNumber = formatPhoneNumber(phone);

    const promiseAxios = await axios.get(url, {
      params: {
        phone: phoneNumber,
        countryCode: '+' + this.props.country.callingCode,
        giftAmount: 0,
      },
    });
    if (promiseAxios.data.response) {
      await this.setState({loader: false});
      await this.props.navigate('Verify', {
        data: {
          ...promiseAxios.data,
          phoneNumber: phone,
          country: this.props.country,
        },
      });
    } else {
      this.setState({error: true, loader: false});
    }
  }
  async changePhone(val) {
    var formatPhone = formatNumber(
      this.props.country.code,
      val,
      this.props.country.callingCode,
      this.state.phoneNumber,
    );
    this.setState({
      phoneNumber: formatPhone,
      isValid: isValidNumberCheck(this.props.country.code, formatPhone),
    });
  }
  inputPhone() {
    const {code, callingCode} = this.props.country;
    const {phoneNumber} = this.state;
    return (
      <TextInput
        style={[styleApp.textBold, {fontSize: 17}]}
        placeholder={placeholder(code, callingCode)}
        placeholderTextColor={colors.greyMidDark}
        autoCapitalize="none"
        underlineColorAndroid="rgba(0,0,0,0)"
        autoCorrect={true}
        autoFocus={true}
        ref={(input) => {
          this.firstTextInput = input;
        }}
        inputAccessoryViewID={'phoneInput'}
        keyboardType={'phone-pad'}
        returnKeyType={'done'}
        onChangeText={(text) => this.changePhone(text)}
        value={phoneNumber}
      />
    );
  }
  countryCol() {
    return (
      <Row>
        <Col style={styleApp.center} size={40}>
          <Image
            source={{
              uri: Object.values(ListCountry).filter(
                (country) => this.props.country.code === country.code,
              )[0].flag,
            }}
            style={{width: 32, height: 25, borderRadius: 3}}
          />
        </Col>
        <Col style={[styleApp.center]} size={20}>
          <MatIcon name="keyboard-arrow-down" color="#757575" size={15} />
        </Col>
        <Col
          size={40}
          style={[
            styleApp.center,
            {borderBottomWidth: 0, borderColor: '#EAEAEA'},
          ]}>
          <Text style={[styleApp.textBold, {fontSize: 17}]}>
            +{this.props.country.callingCode}
          </Text>
        </Col>
      </Row>
    );
  }
  async selectCountry(countrySelected) {
    const {navigate, country} = this.props; 
    await navigate('Phone', {
      country: countrySelected ? countrySelected : country,
    });
    await timeout(200);
    this.firstTextInput.focus();
  }
  render() {
    const {navigate} = this.props;
    const {isValid} = this.state;
    return (
      <View style={styles.content}>
        <Row style={styles.rowField}>
          <Col
            size={35}
            activeOpacity={0.8}
            onPress={async () => {
              await this.firstTextInput.blur();
              await timeout(200);
              navigate('ListCountry', {
                onGoBack: (country) => this.selectCountry(country),
              });
            }}>
            {this.countryCol()}
          </Col>

          <Col size={80} style={styleApp.center2}>
            {this.inputPhone()}
          </Col>
        </Row>

        <InputAccessoryView nativeID={'phoneInput'}>
          <Row style={styles.rowNext}>
            <Col style={styleApp.center2}>
              <Text style={styleApp.text}>
                We will text you the verification code.
              </Text>
            </Col>

            <Col style={styleApp.center3}>
              <ButtonColor
                view={() => {
                  if (this.state.loader)
                    return <Loader color={colors.white} size={40} type={2} />;
                  return (
                    <AllIcons
                      name="arrow-right"
                      type="font"
                      color={isValid ? colors.white : colors.grey}
                      size={20}
                    />
                  );
                }}
                click={() => isValid && this.next(this.state.phoneNumber)}
                color={isValid ? colors.green : colors.white}
                style={[
                  styles.buttonNext,
                  {borderColor: isValid ? colors.green : colors.grey},
                ]}
                onPressColor={isValid ? colors.greenLight : colors.white}
              />
            </Col>
          </Row>
        </InputAccessoryView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: '100%',
  },
  rowField: {
    height: 55,
    marginTop: 15,
    backgroundColor: colors.greenUltraLight,
    borderBottomWidth: 3,
    borderColor: colors.green,
  },
  rowNext: {
    flex: 1, 
    width: '100%',
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 10,
  },
  buttonNext: {
    height: 60,
    width: 60,
    borderRadius: 30,

    borderWidth: 1,
  },
});
