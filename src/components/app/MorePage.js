import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Alert,
  Image,
  Animated,
  TouchableOpacity,
  Share,
} from 'react-native';
import {connect} from 'react-redux';

import {Col, Row, Grid} from 'react-native-easy-grid';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import Communications from 'react-native-communications';

import ScrollView from '../layout/scrollViews/ScrollView2';
import HeaderBackButton from '../layout/headers/HeaderBackButton';
import sizes from '../style/sizes';
import ButtonNotification from './elementsUser/elementsProfile/ButtonNotification';
import {navigate} from '../../../NavigationService';
import styleApp from '../style/style';
import colors from '../style/colors';
import AllIcons from '../layout/icons/AllIcons';
import ButtonColor from '../layout/Views/Button';
import Button from '../layout/buttons/Button';
import AsyncImage from '../layout/image/AsyncImage';

import {logout} from '../../store/actions/userActions';
import {createInviteToAppBranchUrl} from '../database/branch';
import {boolShouldComponentUpdate} from '../functions/redux';
import {
  userConnectedSelector,
  userIDSelector,
  userInfoSelector,
  walletSelector,
} from '../../store/selectors/user';

class MorePage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'MorePage',
    });
  }
  button2(dataButton) {
    const {text, icon, click, text2} = dataButton;
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={10} style={styleApp.center2}>
                <AllIcons
                  type={icon.type}
                  size={icon.size}
                  name={icon.name}
                  color={icon.color}
                />
              </Col>
              <Col size={60} style={styleApp.center2}>
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
                <Text style={[styleApp.text, {color: colors.primary}]}>
                  {text2}
                </Text>
              </Col>
              <Col size={10} style={styleApp.center3}>
                <AllIcons
                  type="mat"
                  size={20}
                  name={'keyboard-arrow-right'}
                  color={colors.grey}
                />
              </Col>
            </Row>
          );
        }}
        click={() => click()}
        color="white"
        style={styles.button}
        onPressColor={colors.off}
      />
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
                    styleApp.text,
                    {
                      fontSize: 15,
                      color: text === 'Logout' ? colors.red : colors.title,
                    },
                  ]}>
                  {text}
                </Text>
              </Col>
              <Col size={20} style={styleApp.center3}>
                {page === 'Wallet' ? (
                  <Text style={[styleApp.textBold, {color: colors.primary}]}>
                    $
                    {this.props.wallet.totalWallet
                      ? Number(this.props.wallet.totalWallet).toFixed(1)
                      : null}
                  </Text>
                ) : null}
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
      navigate('Alert', {
        textButton: 'Logout',
        title: 'Sign out',
        subtitle: 'Are you sure you want to sign out?',
        colorButton: 'red',
        onPressColor: colors.red,
        onGoBack: (data) => this.confirmLogout(data),
        nextNavigation: () => navigate('VideoLibrary'),
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
      } else {
        Linking.openURL(url);
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  }
  call() {
    Communications.phonecall('+13477380603', true);
  }
  sendEmail() {
    const {userConnected, infoUser} = this.props;
    var email1 = 'contact@getgamefare.com';
    let subject = infoUser.firstname + ' ' + infoUser.lastname;
    if (!userConnected) {
      subject = '';
    }
    Communications.email([email1], null, null, subject, '');
  }

  goToEditProfile = () => {
    this.props.navigation.navigate('EditProfilePage');
  };

  profile() {
    const {infoUser, userConnected} = this.props;
    return (
      <View style={{marginTop: 20, marginBottom: 50}}>
        {userConnected ? (
          <View>
            <TouchableOpacity
              onPress={() => this.goToEditProfile()}
              style={styleApp.marginView}
              activeOpacity={0.9}>
              <Row>
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
                        {infoUser?.firstname[0] + infoUser.lastname[0]}
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

            <View style={{height: 20}} />

            {this.button2({
              text: 'Share GameFare with your friends',
              icon: {
                name: 'gifts',
                type: 'font',
                size: 20,
                color: colors.title,
              },
              click: async () => {
                const url = await createInviteToAppBranchUrl();
                Share.share({url});
              },
            })}

            <Text style={styles.title}>Account parameters</Text>
            <View style={styles.divider} />

            {this.button('cog', 'App Settings', 'AppSettings')}
            <ButtonNotification displayBeforeLoader={true} />

            {this.button('user-alt-slash', 'Blocked users', 'BlockedUsersList')}
            {this.button('credit-card', 'Payment', 'Payments')}
            {this.button('wallet', 'Wallet', 'Wallet')}
          </View>
        ) : (
          <View style={styleApp.center}>
            <Image
              source={require('../../img/images/tennisZoom.png')}
              style={{height: 100, width: 100, marginBottom: 20}}
            />

            {/* <Text style={styleApp.text}>
              Sign in to start improving your tennis skills.
            </Text> */}

            <Button
              backgroundColor="primary"
              onPressColor={colors.primaryLight}
              enabled={true}
              text="Sign in"
              icon={{
                name: 'user',
                size: 24,
                type: 'font',
                color: colors.white,
              }}
              styleButton={styles.buttonLogin}
              loader={false}
              click={async () => navigate('SignIn')}
            />
          </View>
        )}

        <Text style={styles.title}>Assistance</Text>
        <View style={styles.divider} />
        {this.button('envelope', 'Email', 'Alert', 'email')}

        <Text style={styles.title}>Social media</Text>
        <View style={styles.divider} />
        {this.button(
          'instagram',
          'Visit us on Instagram',
          'Alert',
          'url',
          'https://www.instagram.com/getgamefare',
        )}

        <Text style={styles.title}>Legal</Text>
        <View style={styles.divider} />
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

        {/* {this.button2({
          text: 'Test notif open session',
          icon: {
            name: 'user',
            type: 'font',
            size: 20,
            color: colors.title,
          },
          click: () =>
            clickNotification({
              date: Date.now(),
              typeNavigation: 'navigate',
              action: 'Session',
              data: {
                screen: 'Session',
                coachSessionID: '3tniy7ismz4kf3egg2z',
                date: Date.now(),
              },
            }),
        })}

        {this.button2({
          text: 'Test notif open video',
          icon: {
            name: 'user',
            type: 'font',
            size: 20,
            color: colors.title,
          },
          click: () =>
            clickNotification({
              date: Date.now(),
              typeNavigation: 'navigate',
              action: 'VideoPlayerPage',
              data: {
                objectID: '-MEjvxdF9hqpyOAoVStt',
                date: Date.now(),
              },
            }),
        })} */}

        {/* {__DEV__ ? (
          <View>
            {this.button2({
              text: 'Test notif open stream',
              icon: {
                name: 'user',
                type: 'font',
                size: 20,
                color: colors.title,
              },
              click: () =>
                NavigationService.navigate('Stream', {
                  screen: 'GroupsPage',
                  params: {
                    openSession: true,
                    objectID: 'yrhyg3a4nrik9v83hjx',
                  },
                }),
            }) : null}
            {this.button2({
              text: 'Test notif open conversation',
              icon: {
                name: 'user',
                type: 'font',
                size: 20,
                color: colors.title,
              },
              click: () =>
                NavigationService.push('Conversation', {
                  data: '-M4pyI87V02bA7Uz1_ah',
                  uniqueStack: 'true',
                }),
            })}

            {this.button2({
              text: 'Test notif appears',
              icon: {
                name: 'user',
                type: 'font',
                size: 20,
                color: colors.title,
              },
              click: () => {
                const {layoutAction} = this.props;
                layoutAction('setLayout', {
                  notification: {
                    data: {
                      action: 'Stream',
                      screen: 'GroupsPage',
                      objectID: 'yrhyg3a4nrik9v83hjx',
                      typeNavigation: 'navigate',
                      notUniqueStack: 'true',
                      date: Date.now(),
                    },
                    notification: {
                      title: 'Marroco has invited you to a video chat ',
                      timestamp: Date.now(),
                      body: 'Click on this notification to join.',
                      picture:
                        'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
                    },
                  },
                });
              },
            })}
            {this.button2({
          text: 'Test notif appears',
          icon: {
            name: 'user',
            type: 'font',
            size: 20,
            color: colors.title,
          },
          click: () => {
            const {layoutAction} = this.props;
            layoutAction('setLayout', {
              notification: {
                data: {
                  action: 'Stream',
                  screen: 'GroupsPage',
                  objectID: 'yrhyg3a4nrik9v83hjx',
                  typeNavigation: 'navigate',
                  notUniqueStack: 'true',
                  date: Date.now(),
                  picture:
                    'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
                },
                notification: {
                  title: 'Marroco has invited you to a video chat ',
                  timestamp: Date.now(),
                  body:
                    'Click on this notification to join. Click on this notification to join. Click on this notification to join. Click on this notification to join.c ',
                },
              },
            });
          },
        })}
          </View>
        )} */}

        <View style={[{marginTop: 20}]}>
          {this.props.userConnected
            ? this.button('logout', 'Logout', 'Alert', 'logout')
            : null}
        </View>
      </View>
    );
  }
  async confirmLogout() {
    await logout();
    return true;
  }
  render() {
    const {infoUser, userConnected} = this.props;
    const {goBack} = this.props.navigation;
    return (
      <View style={[styleApp.stylePage]}>
        <HeaderBackButton
          marginTop={10}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={
            userConnected ? infoUser.firstname + ' ' + infoUser.lastname : null
          }
          inputRange={[2, 5]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialBorderColorHeader={colors.white}
          initialTitleOpacity={0}
          initialBorderWidth={1}
          icon1={'times'}
          typeIcon1="font"
          sizeIcon1={21}
          colorIcon1={colors.title}
          clickButton1={() => goBack()}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.profile()}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome - 30}
          offsetBottom={70}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    height: 55,
    marginLeft: 0,
    width: '100%',
    paddingLeft: '5%',
    paddingRight: '5%',
    borderColor: colors.borderColor,
    backgroundColor: 'white',
    borderBottomWidth: 0,
  },
  divider: {
    ...styleApp.divider,
    marginLeft: '5%',
    width: '90%',
  },
  buttonLogin: {
    //  marginRight: '5%',
    //  marginLeft: '5%',
    width: '90%',
    height: 55,
    marginTop: 20,
  },
  title: {
    ...styleApp.text,
    fontSize: 12,
    marginLeft: '5%',
    marginBottom: 10,
    marginTop: 30,
  },
  asyncImage: {
    width: 75,
    height: 75,
    borderColor: colors.off,
    borderRadius: 45,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: userIDSelector(state),
    infoUser: userInfoSelector(state),
    wallet: walletSelector(state),
    userConnected: userConnectedSelector(state),
  };
};

export default connect(mapStateToProps)(MorePage);
