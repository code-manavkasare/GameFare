import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row, Grid} from 'react-native-easy-grid';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import Communications from 'react-native-communications';

import ScrollView from '../layout/scrollViews/ScrollView2';
import sizes from '../style/sizes';
import styleApp from '../style/style';
import colors from '../style/colors';
import AllIcons from '../layout/icons/AllIcons';
import Button from '../layout/buttons/Button';
import ButtonColor from '../layout/Views/Button';
import AsyncImage from '../layout/image/AsyncImage';

import {userAction} from '../../actions/userActions';
const {height, width} = Dimensions.get('screen');

class MorePage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  title(text) {
    return (
      <Row style={{marginTop: 20, marginBottom: 10}}>
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

  button(icon, text, page, type, url) {
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
                    name={icon === 'logout' ? 'bicycle' : icon}
                    color={icon === 'logout' ? colors.red : colors.title}
                  />
                </Col>
              ) : null}
              <Col size={60} style={[styleApp.center2, {paddingLeft: 0}]}>
                <Text
                  style={[
                    styleApp.input,
                    {
                      fontSize: 14,
                      color: text === 'Logout' ? colors.red : colors.title,
                    },
                  ]}>
                  {text}
                </Text>
              </Col>
              <Col size={20} style={styleApp.center3}>
                {page === 'Wallet' && (
                  <Text style={[styleApp.text, {color: colors.primary}]}>
                    ${this.props.wallet.totalWallet}
                  </Text>
                )}
              </Col>
              <Col size={10} style={styleApp.center3}>
                <AllIcons
                  type="mat"
                  size={20}
                  name={'keyboard-arrow-right'}
                  color={icon === 'logout' ? colors.red : colors.grey}
                />
              </Col>
            </Row>
          );
        }}
        click={() => this.clickButton(page, type, url)}
        color="white"
        style={styles.button}
        onPressColor={colors.off}
      />
    );
  }
  clickButton(page, type, url) {
    if (type === 'url') {
      this.openLink(url);
    } else if (type === 'call') {
      this.call();
    } else if (type === 'email') {
      this.sendEmail();
    } else if (type === 'logout') {
      this.props.navigation.navigate('Alert', {
        textButton: 'Logout',
        title: 'Do you want to log out?' + '\n',
        colorButton: 'red',
        onPressColor: colors.red,
        onGoBack: (data) => this.confirmLogout(data),
      });
    } else {
      this.props.navigation.navigate(page);
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

  goToEditProfile = () => {
    this.props.navigation.navigate('EditProfilePage');
  };

  profile() {
    const {infoUser, userConnected} = this.props;
    return (
      <View style={{marginLeft: 0, width: width, marginTop: 0}}>
        <View style={styleApp.marginView}>
          {userConnected ? (
            <View>
              <TouchableOpacity
                onPress={() => this.goToEditProfile()}
                activeOpacity={0.9}>
                <Row style={{marginBottom: 20}}>
                  <Col size={30} style={styleApp.center2}>
                    {infoUser.picture ? (
                      <AsyncImage
                        style={styles.asyncImage}
                        mainImage={infoUser.picture}
                      />
                    ) : (
                      <View
                        style={[
                          styles.asyncImage,
                          styleApp.center,
                          {backgroundColor: colors.off},
                        ]}>
                        <Text style={[styleApp.input, {fontSize: 20}]}>
                          {infoUser.firstname[0] + infoUser.lastname[0]}
                        </Text>
                      </View>
                    )}
                  </Col>
                  <Col size={70} style={styleApp.center2}>
                    <Text style={styleApp.title}>
                      {infoUser.firstname + ' ' + infoUser.lastname}
                    </Text>
                    <Text style={styleApp.subtitle}>
                      {infoUser.countryCode + ' ' + infoUser.phoneNumber}
                    </Text>
                  </Col>
                </Row>
              </TouchableOpacity>

              <Text style={styleApp.text}>Account parameters</Text>
              <View style={[styleApp.divider2, {marginTop: 15}]} />
              {this.button('credit-card', 'Payment', 'Payments')}
              {this.button('wallet', 'Wallet', 'Wallet')}
              {this.button(
                'user-alt-slash',
                'Blocked users',
                'BlockedUsersList',
              )}
            </View>
          ) : null}
        </View>

        <View style={[styleApp.marginView, {marginTop: 30}]}>
          <Text style={styleApp.text}>Assistance</Text>

          <View style={[styleApp.divider2, {marginBottom: 0, marginTop: 15}]} />
          {this.button('envelope', 'Email', 'Alert', 'email')}
          {/* {this.button('phone', 'Call', 'Alert', 'call')} */}
        </View>

        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>
            <Text style={styleApp.text}>Social media</Text>

            <View style={[styleApp.divider2, {marginBottom: 0}]} />
            {this.button(
              'instagram',
              'Visit us on Instagram',
              'Alert',
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
              'url',
              'https://www.getgamefare.com/privacy',
            )}
            {this.button(
              false,
              'Terms of service',
              'Alert',
              'url',
              'https://www.getgamefare.com/terms',
            )}
          </View>
        </View>

        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>
            {this.props.userConnected &&
              this.button('logout', 'Logout', 'Alert', 'logout')}
          </View>
        </View>
      </View>
    );
  }
  async confirmLogout() {
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
  render() {
    return (
      <View style={styleApp.stylePage}>
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.profile()}
          marginBottomScrollView={sizes.heightFooter}
          marginTop={sizes.marginTopApp + 30}
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
  asyncImage: {
    width: 90,
    height: 90,
    borderColor: colors.off,
    borderRadius: 45,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    wallet: state.user.infoUser.wallet,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps, {userAction})(MorePage);
