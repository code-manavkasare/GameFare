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
// import {updateStepLogin} from '../../../actions/loginActions'
// import {initApp} from '../../../actions/initAppActions'
import Flag from 'react-native-flags';
import NavigationService from '../../../../NavigationService';

import MatIcon from 'react-native-vector-icons/MaterialIcons';
import {Col, Row, Grid} from 'react-native-easy-grid';
import axios from 'axios';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import Button from '../../layout/buttons/Button';
import Loader from '../../layout/loaders/Loader';
import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';
import {
  formatNumber,
  isValidNumberCheck,
  placeholder,
} from '../../functions/phoneNumber';

const ListCountry = require('../elementsFlags/country.json');

const {height, width} = Dimensions.get('screen');

class PhoneFields extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      phoneNumber: '',
      isValid: false,
    };
    this.changePhone = this.changePhone.bind(this);
  }
  componentDidMount() {
    var that = this;
    setTimeout(function() {
      that.firstTextInput.focus();
    }, 550);
  }
  focusPhoneField() {
    this.firstTextInput.focus();
  }
  s;
  shouldComponentUpdate(nextProps, nextState) {
    if (this.state !== nextState) return true;
    else if (this.props.country !== nextProps.country) return true;
    return false;
  }
  async next(phone) {
    // this.firstTextInput.blur()
    this.setState({loader: true});
    var url = 'https://us-central1-getplayd.cloudfunctions.net/signUpUser';
    var phoneNumber = phone;
    phoneNumber = phoneNumber.replace('-', '');
    phoneNumber = phoneNumber.replace(')', '');
    phoneNumber = phoneNumber.replace('(', '');
    phoneNumber = phoneNumber.replace(/ /g, '');
    // var giftAmount = Number(this.props.giftAmount)

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
        pageFrom: this.props.pageFrom,
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
    return (
      <TextInput
        style={[styleApp.input, {fontSize: 17}]}
        // placeholder={'(012) 345 6789'}
        placeholder={placeholder(
          this.props.country.code,
          this.props.country.callingCode,
        )}
        placeholderTextColor={'#AFAFAF'}
        autoCapitalize="none"
        underlineColorAndroid="rgba(0,0,0,0)"
        autoCorrect={true}
        autoFocus={false}
        ref={(input) => {
          this.firstTextInput = input;
        }}
        inputAccessoryViewID={'phoneInput'}
        keyboardType={'phone-pad'}
        returnKeyType={'done'}
        onChangeText={(text) => this.changePhone(text)}
        value={this.state.phoneNumber}
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
          <Text style={[styleApp.input, {fontSize: 17}]}>
            +{this.props.country.callingCode}
          </Text>
        </Col>
      </Row>
    );
  }
  async selectCountry(country) {
    await NavigationService.navigate('Phone', {country: country});
    this.firstTextInput.focus();
  }
  render() {
    return (
      <View style={styles.content}>
        <Row style={styles.rowField}>
          <Col
            size={35}
            style={[{borderRightWidth: 0, borderColor: '#EAEAEA'}]}
            activeOpacity={0.8}
            onPress={() => {
              this.props.navigate('ListCountry', {
                onGoBack: (country) => this.selectCountry(country),
              });
            }}>
            {this.countryCol()}
          </Col>

          <Col
            size={80}
            style={[
              styleApp.center2,
              {marginRight: 0},
              {borderBottomWidth: 0, borderColor: '#EAEAEA'},
            ]}>
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
                    return <Loader color="white" size={25} />;
                  return (
                    <AllIcons
                      name="arrow-forward"
                      type="mat"
                      color={this.state.isValid ? colors.white : colors.green}
                      size={23}
                    />
                  );
                }}
                click={() => this.next(this.state.phoneNumber)}
                color={!this.state.isValid ? colors.white : colors.green}
                style={[
                  {
                    height: 60,
                    width: 60,
                    borderRadius: 30,
                    borderColor: this.state.isValid
                      ? colors.white
                      : colors.green,
                    borderWidth: 1,
                  },
                ]}
                onPressColor={colors.greenClick}
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
  rowScreen: {
    height: 55,
    width: '100%',
    marginTop: 0,
    borderRadius: 5,
    paddingHorizontal: 8,
    fontSize: 15,
    fontFamily: 'OpenSans-Regular',
    borderWidth: 0,
    shadowColor: '#46474B',
    shadowOffset: {width: 0, height: 2},
    backgroundColor: 'white',
    shadowOpacity: 0,
    shadowRadius: 5,
    justifyContent: 'center',
    borderColor: '#eaeaea',
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
    // backgroundColor: 'red',
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 10,
  },
  input: {
    height: 40,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
    paddingHorizontal: 8,
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#4A4A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const mapStateToProps = (state) => {
  return {
    // country:state.user.country,
  };
};

export default connect(mapStateToProps, {})(PhoneFields);
