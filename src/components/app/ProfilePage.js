import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import {connect} from 'react-redux';

import Header from '../layout/headers/HeaderButton';
import ScrollView from '../layout/scrollViews/ScrollView2';
import sizes from '../style/sizes';
import styleApp from '../style/style';
import colors from '../style/colors';
import AllIcons from '../layout/icons/AllIcons';
import {Col, Row, Grid} from 'react-native-easy-grid';
import FontIcon from 'react-native-vector-icons/FontAwesome';
import Button from '../layout/buttons/Button';
import ButtonColor from '../layout/Views/Button';
import HeaderBackButton from '../layout/headers/HeaderBackButton';

import {userAction} from '../../actions/userActions';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import Communications from 'react-native-communications';
import SwiperLogout from './elementsUser/elementsProfile/SwiperLogout';
const {height, width} = Dimensions.get('screen');

class ProfilePage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  title(text) {
    return (
      <Row style={{marginBottom: 5, marginTop: 20, marginBottom: 10}}>
        <Col style={styleApp.center2}>
          <Text
            style={[
              styleApp.title,
              {
                fontSize: 12,
                color: colors.title,
                fontFamily: 'OpenSans-SemiBold',
              },
            ]}>
            {text}
          </Text>
        </Col>
      </Row>
    );
  }
  bigtitle(text) {
    return (
      <Row style={{marginBottom: 5}}>
        <Col style={styleApp.center2}>
          <Text
            style={[
              styleApp.title,
              {fontSize: 19, fontFamily: 'OpenSans-SemiBold'},
            ]}>
            {text}
          </Text>
        </Col>
      </Row>
    );
  }
  subtitle(text) {
    return (
      <Row style={{marginBottom: 0}}>
        <Col style={styleApp.center2}>
          <Text style={[styleApp.subtitle, {fontSize: 13}]}>{text}</Text>
        </Col>
      </Row>
    );
  }
  /*
  
      
  */
  button(icon, text, page, data, type, url) {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row style={{marginLeft: 0, width: '100%'}}>
              {icon ? (
                <Col size={10} style={styleApp.center2}>
                  <AllIcons
                    type="font"
                    size={17}
                    name={icon == 'logout' ? 'bicycle' : icon}
                    color={icon == 'logout' ? colors.green : colors.title}
                  />
                </Col>
              ) : null}
              <Col size={80} style={[styleApp.center2, {paddingLeft: 0}]}>
                <Text
                  style={[
                    styleApp.title,
                    {
                      fontSize: 14,
                      fontFamily: 'OpenSans-SemiBold',
                      color: text == 'Logout' ? colors.green : colors.title,
                    },
                  ]}>
                  {text}
                </Text>
              </Col>
              <Col size={10} style={styleApp.center3}>
                <AllIcons
                  type="mat"
                  size={20}
                  name={'keyboard-arrow-right'}
                  color={icon == 'logout' ? colors.green : colors.grey}
                />
              </Col>
            </Row>
          );
        }}
        click={() => this.clickButton(text, page, data, type, url)}
        color="white"
        style={styles.button}
        onPressColor={colors.off}
      />
    );
  }
  clickButton(text, page, data, type, url) {
    console.log('type');
    console.log(type);

    if (type == 'url') {
      this.openLink(url);
    } else if (type == 'call') {
      this.call();
    } else if (type == 'email') {
      this.sendEmail();
    } else if (type == 'link') {
      // this.sendEmail()
    } else {
      this.props.navigation.navigate(page, data);
    }
  }
  async openLink(url) {
    try {
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.open(url, {
          // iOS Properties
          dismissButtonStyle: 'cancel',
          preferredBarTintColor: 'white',
          preferredControlTintColor: colors.primary,
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'overFullScreen',
          modalTransitionStyle: 'coverVertical',
          modalEnabled: true,
          // Android Properties
          showTitle: true,
          toolbarColor: 'white',
          secondaryToolbarColor: colors.primary,
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: false,
          // Specify full animation resource identifier(package:anim/name)
          // or only resource name(in case of animation bundled with app).
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right',
          },
          headers: {
            'my-custom-header': 'my custom header value',
          },
          waitForRedirectDelay: 0,
        });
        Alert.alert(JSON.stringify(result));
      } else Linking.openURL(url);
    } catch (error) {
      Alert.alert(error.message);
    }
  }
  call() {
    Communications.phonecall('+13477380603', true);
  }
  sendEmail() {
    var email1 = 'contact@getgamefare.com';
    var subject =
      this.props.infoUser.firstname + ' ' + this.props.infoUser.lastname;
    Communications.email([email1], null, null, subject, '');
  }
  profile() {
    return (
      <View style={{marginLeft: 0, width: width, marginTop: 0}}>
        <View style={[styleApp.marginView, {marginTop: 0}]}>
          {this.props.userConnected ? (
            <View>
              <Text style={[styleApp.title, {marginBottom: 30}]}>
                {'Hi, ' +
                  this.props.infoUser.firstname +
                  ' ' +
                  this.props.infoUser.lastname}
              </Text>
              {/* <Text style={[styleApp.subtitle,{marginTop:5,marginBottom:30}]}>{this.props.infoUser.countryCode + ' ' +this.props.infoUser.phoneNumber}</Text> */}

              <Text style={styleApp.smallText}>
                {this.props.userConnected
                  ? 'Account parameters'
                  : 'Sign in to GameFare'}
              </Text>
              <View
                style={[styleApp.divider2, {marginBottom: 0, marginTop: 15}]}
              />
              {this.button('credit-card', 'Payment', 'Payments', {
                pageFrom: 'Profile',
              })}
              {/* {this.button('shopping-bag','My wallet','Wallet',{pageFrom:'Profile'})} */}
            </View>
          ) : null}
        </View>

        <View style={[styleApp.marginView, {marginTop: 30}]}>
          <Text style={styleApp.text}>Assistance</Text>

          <View style={[styleApp.divider2, {marginBottom: 0, marginTop: 15}]} />
          {this.button('envelope', 'Email', 'Alert', {}, 'email')}
          {this.button('phone', 'Call', 'Alert', {}, 'call')}
        </View>

        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>
            <Text style={styleApp.text}>Social media</Text>

            <View style={[styleApp.divider2, {marginBottom: 0}]} />
            {this.button(
              'instagram',
              'Visit us on Instagram',
              'Alert',
              {},
              'url',
              'https://www.instagram.com/getgamefare',
            )}
          </View>
        </View>

        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>
            <Text style={styleApp.text}>Legal</Text>

            <View style={[styleApp.divider2, {marginBottom: 0}]} />
            {this.button(
              false,
              'Privacy policy',
              'Alert',
              {},
              'url',
              'https://www.getgamefare.com/privacy',
            )}
            {this.button(
              false,
              'Terms of service',
              'Alert',
              {},
              'url',
              'https://www.getgamefare.com/terms',
            )}
          </View>
        </View>

        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>
            {this.props.userConnected
              ? this.button('logout', 'Logout', 'Alert', {
                  textButton: 'Logout',
                  title: 'Do you want to log out?',
                  onGoBack: (data) => this.confirmLogout(data),
                })
              : null}
          </View>
        </View>
      </View>
    );
  }
  async confirmLogout(data) {
    console.log('close logout');
    console.log(data);
    await this.props.userAction('logout', {userID: this.props.userID});
    this.props.navigation.navigate('Home');
  }
  rowCheck(text) {
    return (
      <Row style={{height: 30}}>
        <Col size={10} style={styleApp.center2}>
          <AllIcons name="check" type="mat" size={17} color={colors.grey} />
        </Col>
        <Col size={90} style={styleApp.center2}>
          <Text
            style={[
              styleApp.text,
              {fontFamily: 'OpenSans-Regular', fontSize: 14},
            ]}>
            {text}
          </Text>
        </Col>
      </Row>
    );
  }
  profileLogout() {
    return (
      <View style={[styleApp.viewHome]}>
        <View style={styleApp.marginView}>
          <SwiperLogout type={'profile'} />

          <View style={{height: 20}} />
          <Button
            text="Sign in"
            click={() =>
              this.props.navigation.navigate('Phone', {pageFrom: 'Profile'})
            }
            backgroundColor={'green'}
            onPressColor={colors.greenClick}
          />
        </View>
      </View>
    );
  }
  render() {
    return (
      <View style={{height: '100%'}}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Profile'}
          inputRange={[50, 80]}
          initialBorderColorIcon={colors.grey}
          initialBackgroundColor={'white'}
          typeIcon2={'font'}
          sizeIcon2={17}
          initialTitleOpacity={0}
          icon1={null}
          icon2={null}
          // clickButton2={() => this.props.navigation.navigate('Settings',{pageFrom:'Profile'})}
          clickButton2={() => console.log('')}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.profile()}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90}
          showsVerticalScrollIndicator={true}
        />

        {!this.props.userConnected ? (
          <View
            style={[
              styleApp.footerBooking,
              {bottom: 0, height: 90, paddingLeft: 20, paddingRight: 20},
            ]}>
            <Button
              text="Sign in"
              click={() =>
                this.props.navigation.navigate('Phone', {pageFrom: 'Profile'})
              }
              backgroundColor={'green'}
              onPressColor={colors.greenClick}
            />
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    height: 55,
    marginLeft: -20,
    width: width,
    paddingLeft: 20,
    paddingRight: 20,
    borderColor: colors.borderColor,
    backgroundColor: 'white',
    borderBottomWidth: 0,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps, {userAction})(ProfilePage);
