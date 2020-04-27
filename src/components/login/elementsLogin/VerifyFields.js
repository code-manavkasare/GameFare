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

const CELL_COUNT = 4;

class VerifyFields extends Component {
  constructor(props) {
    super(props);
    this.state = {
      verifCode: '',
      loader: true,
      step: 'sending',
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    // this.verifPhone = this.verifPhone.bind(this)
    this.sendSMS = this.sendSMS.bind(this);
  }
  field = createRef();
  componentDidMount() {
    this.sendSMS();
  }
  async sendSMS() {
    this.setState({loader: true, step: 'sending'});
    var phoneNumber = this.props.params.phoneNumber;
    phoneNumber = phoneNumber.replace('-', '');
    phoneNumber = phoneNumber.replace('(', '');
    phoneNumber = phoneNumber.replace(')', '');
    phoneNumber = phoneNumber.replace(/ /g, '');

    var url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}sendSMSVerification`;
    const promiseAxios = await axios.get(url, {
      params: {
        phoneNumber: phoneNumber,
        countryCode: this.props.params.country.callingCode,
        userID: this.props.params.userID,
      },
    });
    if (promiseAxios.data.response == false) {
      this.setState({step: 'wrongNumber', loader: false});
    } else {
      this.setState({step: 'sent', loader: false});
    }
  }
  onFinishCheckingCode(val) {
    this.verifPhone(val);
  }
  cellProps = ({/*index, isFocused,*/ hasValue}) => {
    if (hasValue) {
      return {
        style: [styles.input, styles.inputNotEmpty],
      };
    }
    return {
      style: styles.input,
    };
  };
  async verifPhone(code) {
    this.setState({step: 'verifying', loader: true});
    var url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}verifyPhone`;
    var phoneNumber = this.props.params.phoneNumber;
    phoneNumber = phoneNumber.replace('-', '');
    phoneNumber = phoneNumber.replace('(', '');
    phoneNumber = phoneNumber.replace(')', '');
    phoneNumber = phoneNumber.replace(/ /g, '');
    const promiseAxios = await axios.get(url, {
      params: {
        phoneNumber: phoneNumber,
        countryCode: this.props.params.country.callingCode,
        userID: this.props.params.userID,
        code: code.toString(),
      },
    });
    if (promiseAxios.data.response == false) {
      this.clearCode();
      // this.field.focus()
      this.setState({
        step: 'error',
        verifCode: '',
        loader: false,
      });
    } else {
      this.setState({step: 'signIn'});
      var profileCompleted = await database()
        .ref('users/' + this.props.params.userID + '/profileCompleted')
        .once('value');
      profileCompleted = profileCompleted.val();
      await this.props.userAction('signIn', {
        userID: this.props.params.userID,
        firebaseSignInToken: this.props.params.firebaseSignInToken,
        phoneNumber: phoneNumber,
        countryCode: this.props.params.country.callingCode,
      });
      if (profileCompleted) {
        var that = this;
        setTimeout(function() {
          that.props.close();
        }, 550);
      } else {
        this.props.navigate('Complete', {
          data: {userID: this.props.params.userID},
        });
      }
    }
  }
  clearCode() {
    const {current} = this.field;
    if (current) {
      current.clear();
      current.focus();
    }
  }
  loader() {
    if (this.state.loader)
      return (
        <View style={[styles.center, {marginTop: 10}]}>
          <Loader color={colors.green} size={40} type={2} />
        </View>
      );
    return null;
  }
  buttonResend() {
    if (!this.state.loader) {
      return (
        <Row style={{height: 30}}>
          <Col style={styles.center}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                this.sendSMS();
              }}
              style={{marginTop: 3}}>
              <Text style={styles.textOn}>Resend SMS</Text>
            </TouchableOpacity>
          </Col>
        </Row>
      );
    }
    return null;
  }
  statusSMS() {
    return (
      <Col style={styles.center}>
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
    // const setValue = (value) => {
    //   return this.setState({value: value});
    // };
    // const {value} = this.state;
    // const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
    // const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    //   value,
    //   setValue,
    // });
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
              <View
                style={{
                  height: 55,
                  borderBottomWidth: 1,
                  //     borderColor: 'red',
                  marginRight: 5,
                }}>
                <Text
                  key={index}
                  style={[styles.textOn, isFocused && styles.textOn]}>
                  {symbol || (isFocused ? null : null)}
                </Text>
              </View>
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
    marginTop: 10,
    height: 80,
    width: '100%',
    // justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapStyle: {
    height: 50,
    marginTop: 5,
  },
  textOn: {
    fontSize: 25,
    ...styleApp.text,
    color: colors.green,
  },
  inputNotEmpty: {
    borderColor: colors.green,
  },
  input: {
    height: 55,
    width: 50 * 4,
    borderRadius: 2,
    //  backgroundColor: colors.red,
    borderBottomWidth: 3,
    borderColor: colors.blue,
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(
  mapStateToProps,
  {userAction},
)(VerifyFields);
