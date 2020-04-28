import React, {Component, createRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import {CodeField, Cursor} from 'react-native-confirmation-code-field';
import {Col, Row} from 'react-native-easy-grid';
import database from '@react-native-firebase/database';
import axios from 'axios';
import {connect} from 'react-redux';
import Config from 'react-native-config';

import Loader from '../../layout/loaders/Loader';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import {userAction} from '../../../actions/userActions';
import {timeout} from '../../functions/coach';

const CELL_COUNT = 4;

const formatPhoneNumber = (phoneNumber) => {
  phoneNumber = phoneNumber.replace('-', '');
  phoneNumber = phoneNumber.replace('(', '');
  phoneNumber = phoneNumber.replace(')', '');
  phoneNumber = phoneNumber.replace(/ /g, '');
  return phoneNumber;
};

class VerifyFields extends Component {
  constructor(props) {
    super(props);
    this.state = {
      verifCode: '',
      loader: true,
      step: 'sending',
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.sendSMS = this.sendSMS.bind(this);
    this.field = createRef();
  }

  componentDidMount() {
    this.sendSMS();
  }
  async sendSMS() {
    await this.setState({loader: true, step: 'sending'});
    const {phoneNumber, country} = this.props.params;
    const {userID} = this.props;
    const phoneNumberFormated = formatPhoneNumber(phoneNumber);
    const url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}sendSMSVerification`;
    const promiseAxios = await axios.get(url, {
      params: {
        phoneNumber: phoneNumberFormated,
        countryCode: country.callingCode,
        userID: userID,
      },
    });
    if (!promiseAxios.data.response) {
      this.setState({step: 'wrongNumber', loader: false});
    } else {
      this.setState({step: 'sent', loader: false});
    }
  }
  async verifPhone(code) {
    this.setState({step: 'verifying', loader: true});
    const url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}verifyPhone`;
    const {
      phoneNumber,
      country,
      firebaseSignInToken,
      userID,
    } = this.props.params;
    const {close, navigate, userAction} = this.props;
    const phoneNumberFormated = formatPhoneNumber(phoneNumber);
    console.log('verufy ohone', phoneNumberFormated);
    console.log('country', country);
    const promiseAxios = await axios.get(url, {
      params: {
        phoneNumber: phoneNumberFormated,
        countryCode: country.callingCode,
        userID: userID,
        code: code.toString(),
      },
    });
    if (!promiseAxios.data.response) {
      this.clearCode();
      this.setState({
        step: 'error',
        verifCode: '',
        loader: false,
      });
    } else {
      this.setState({step: 'signIn'});
      var profileCompleted = await database()
        .ref('users/' + userID + '/profileCompleted')
        .once('value');
      profileCompleted = profileCompleted.val();
      await userAction('signIn', {
        userID: userID,
        firebaseSignInToken: firebaseSignInToken,
        phoneNumber: phoneNumber,
        countryCode: country.callingCode,
      });
      if (profileCompleted) {
        await timeout(550);
        close();
      } else {
        navigate('Complete', {
          data: {userID: userID},
        });
      }
    }
  }
  clearCode() {
    return this.setState({verifCode: ''});
  }
  loader() {
    if (this.state.loader)
      return (
        <View style={[styleApp.center, {marginTop: 10}]}>
          <Loader color={colors.green} size={50} />
        </View>
      );
    return null;
  }
  buttonResend() {
    if (!this.state.loader) {
      return (
        <Row style={{height: 30}}>
          <Col style={styleApp.center}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={async () => {
                await this.clearCode();
                this.sendSMS();
              }}
              style={{marginTop: 3}}>
              <Text style={[styles.textOn, {fontSize: 14}]}>Resend SMS</Text>
            </TouchableOpacity>
          </Col>
        </Row>
      );
    }
    return null;
  }
  statusSMS() {
    return (
      <Col style={styleApp.center}>
        {this.state.step === 'verifying' ? (
          <Text style={styleApp.input}>Verifying code...</Text>
        ) : this.state.step === 'signIn' ? (
          <Text style={styleApp.input}>We are signing you in...</Text>
        ) : this.state.step === 'sending' ? (
          <Text style={styleApp.input}>SMS being sent...</Text>
        ) : this.state.step === 'error' ? (
          <Text style={styleApp.input}>Wrong code</Text>
        ) : this.state.step === 'wrongNumber' ? (
          <Text style={styleApp.input}>Error, verify your number</Text>
        ) : this.state.step === 'sent' ? (
          <Text style={styleApp.input}>✓ SMS sent</Text>
        ) : null}
      </Col>
    );
  }
  subtitle() {
    return (
      'Enter the code sent to +' +
      this.props.params.country.callingCode +
      ' ' +
      this.props.params.phoneNumber
    );
  }
  verify() {
    const {verifCode} = this.state;
    return (
      <View style={styleApp.marginView}>
        <Text style={[styleApp.title, {marginBottom: 5, marginTop: 0}]}>
          Please enter the 4-digit code sent to you at{' '}
          {this.props.params.phoneNumber}
        </Text>

        <View style={styles.inputWrapper}>
          <CodeField
            value={verifCode}
            blurOnSubmit={true}
            variant="clear"
            autoFocus={true}
            ref={this.field}
            onChangeText={(value) => {
              this.setState({verifCode: value});
              if (value.length === CELL_COUNT) {
                this.verifPhone(value);
              }
            }}
            cellCount={CELL_COUNT}
            rootStyle={styles.input}
            keyboardType="number-pad"
            renderCell={({index, symbol, isFocused}) => (
              <Text
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}>
                {symbol}
              </Text>
            )}
          />
        </View>

        <Row style={{height: 45}}>{this.statusSMS()}</Row>
        {this.loader()}

        {this.buttonResend()}
      </View>
    );
  }
  render() {
    return this.verify();
  }
}

const styles = StyleSheet.create({
  inputWrapper: {
    alignItems: 'center',
    marginTop: 20,
    height: 55,
    width: '100%',
  },
  textOn: {
    ...styleApp.text,
    fontSize: 25,
    color: colors.green,
  },
  inputNotEmpty: {
    borderColor: colors.green,
  },
  input: {
    height: 55,
    width: 60 * 4,
    borderRadius: 2,
    //  backgroundColor: colors.red,
  },
  cell: {
    ...styleApp.text,
    width: 45,
    height: 45,
    lineHeight: 38,
    fontSize: 24,
    borderWidth: 2,
    borderColor: colors.off,
    textAlign: 'center',
    color: colors.blue,
    backgroundColor: colors.off2,
    borderRadius: 4,
  },
  focusCell: {
    borderColor: colors.blue,
    backgroundColor: colors.white,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(
  mapStateToProps,
  {userAction},
)(VerifyFields);
