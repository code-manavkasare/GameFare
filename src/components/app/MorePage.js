import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Alert,
  Image,
  Animated,
  Share,
} from 'react-native';
import {connect} from 'react-redux';

import {Col, Row} from 'react-native-easy-grid';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import Communications from 'react-native-communications';

import ScrollView from '../layout/scrollViews/ScrollView2';
import HeaderBackButton from '../layout/headers/HeaderBackButton';
import {navigate} from '../../../NavigationService';
import styleApp from '../style/style';
import colors from '../style/colors';
import AllIcons from '../layout/icons/AllIcons';
import ButtonColor from '../layout/Views/Button';
import Button from '../layout/buttons/Button';
import {rowTitle} from './TeamPage/components/elements';

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
  button({icon, text, page, type, url, onClick}) {
    const textStyle = {
      ...styles.buttonTitle,
      color: text === 'Logout' ? colors.red : colors.title,
    };
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
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
              <Col size={70} style={styleApp.center2}>
                <Text style={textStyle}>{text}</Text>
              </Col>
              <Col size={20} style={styleApp.center3}>
                {page === 'Wallet' ? (
                  <Text style={styles.balanceText}>
                    $
                    {this.props.wallet.totalWallet
                      ? Number(this.props.wallet.totalWallet).toFixed(2)
                      : null}
                  </Text>
                ) : (
                  <AllIcons
                    type="mat"
                    size={20}
                    name={'keyboard-arrow-right'}
                    color={icon === 'logout' ? colors.red : colors.grey}
                  />
                )}
              </Col>
            </Row>
          );
        }}
        click={() => (onClick ? onClick() : this.clickButton(page, type, url))}
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
        await InAppBrowser.open(url, {
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

  profile() {
    const {userConnected} = this.props;
    return (
      <View style={{paddingTop: 60, marginTop: 0, marginBottom: 50}}>
        {userConnected ? (
          <View>
            <View style={{height: 20}} />

            {rowTitle({
              hideDividerHeader: true,
              title: 'Settings',
              titleColor: colors.black,
              titleStyle: {
                fontWeight: '800',
                fontSize: 23,
                marginLeft: '5%',
              },
            })}
            {this.button({
              icon: 'gifts',
              text: 'Share GameFare with Friends',
              onClick: async () => {
                const url = await createInviteToAppBranchUrl();
                Share.share({url});
              },
            })}

            <Text style={styles.title}>Account parameters</Text>
            <View style={styles.divider} />

            {this.button({
              icon: 'cog',
              text: 'App Settings',
              page: 'AppSettings',
            })}

            {this.button({
              icon: 'bell',
              text: 'Notifications',
              page: 'NotificationPage',
            })}

            {this.button({
              icon: 'user-alt-slash',
              text: 'Blocked users',
              page: 'BlockedUsersList',
            })}
            {this.button({
              icon: 'credit-card',
              text: 'Payment',
              page: 'Payments',
            })}
            {this.button({icon: 'wallet', text: 'Wallet', page: 'Wallet'})}
          </View>
        ) : (
          <View style={styleApp.center}>
            <Image
              source={require('../../img/images/tennisZoom.png')}
              style={{height: 100, width: 100, marginBottom: 20}}
            />

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

        <Text style={styles.title}>Support</Text>
        <View style={styles.divider} />
        {this.button({
          icon: 'envelope',
          text: 'Email',
          page: 'Alert',
          type: 'email',
        })}

        <Text style={styles.title}>Social Media</Text>
        <View style={styles.divider} />
        {this.button({
          icon: 'instagram',
          text: 'Visit us on Instagram',
          page: 'Alert',
          type: 'url',
          url: 'https://www.instagram.com/getgamefare',
        })}

        <Text style={styles.title}>Legal</Text>
        <View style={styles.divider} />
        {this.button({
          text: 'Privacy policy',
          page: 'Alert',
          type: 'url',
          url: 'https://www.getgamefare.com/privacy',
        })}
        {this.button({
          text: 'Terms of service',
          page: 'Alert',
          type: 'url',
          url: 'https://www.getgamefare.com/terms',
        })}

        <View style={[{marginTop: 20}]}>
          {this.props.userConnected
            ? this.button({
                icon: 'logout',
                text: 'Logout',
                page: 'Alert',
                type: 'logout',
              })
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
    const {goBack} = this.props.navigation;
    return (
      <View style={[styleApp.stylePage]}>
        <HeaderBackButton
          marginTop={10}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Settings'}
          inputRange={[0, 20]}
          initialBorderColorIcon={'transparent'}
          initialBackgroundColor={colors.white}
          initialBorderColorHeader={'transparent'}
          initialTitleOpacity={0}
          initialBorderWidth={0}
          icon1={'chevron-left'}
          typeIcon1="font"
          sizeIcon1={17}
          colorIcon1={colors.title}
          clickButton1={() => goBack()}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.profile()}
          marginBottomScrollView={0}
          marginTop={-30}
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
    marginLeft: '5%',
    width: '90%',
  },
  buttonTitle: {
    ...styleApp.text,
    fontSize: 14,
  },
  buttonLogin: {
    width: '90%',
    height: 55,
    marginTop: 20,
  },
  balanceText: {
    ...styleApp.textBold,
    fontSize: 13,
    color: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 13,
    backgroundColor: colors.green,
    overflow: 'hidden',
    minWidth: 55,
  },
  title: {
    ...styleApp.textBold,
    color: colors.greyDarker,
    fontSize: 19,
    marginLeft: '5%',
    marginBottom: 10,
    marginTop: 30,
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
