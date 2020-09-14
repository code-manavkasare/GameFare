import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions, Animated} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
const {height, width} = Dimensions.get('screen');

import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import axios from 'axios';

import ScrollView from '../../../layout/scrollViews/ScrollView2';
import PlaceHolder from '../../../placeHolders/CardConversation';
import Config from 'react-native-config';

import sizes from '../../../style/sizes';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import CardTransfer from './CardTransfer';

class ListEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      listTransfers: [],
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    this.loadTransfers();
  }
  async loadTransfers() {
    let listTransfers = await database()
      .ref('usersTransfers/' + this.props.userID)
      .once('value');
    listTransfers = listTransfers.val();
    if (!listTransfers) {
      listTransfers = [];
    }
    listTransfers = Object.values(listTransfers).sort(function(a, b) {
      return new Date(b.date) - new Date(a.date);
    });
    return this.setState({
      loader: false,
      listTransfers: Object.values(listTransfers),
    });
  }
  placehoder() {
    return (
      <View>
        <PlaceHolder />
        <PlaceHolder />
        <PlaceHolder />
        <PlaceHolder />
        <PlaceHolder />
        <PlaceHolder />
      </View>
    );
  }
  listWallet() {
    const {loader, listTransfers} = this.state;
    return (
      <View style={{marginTop: 0, minHeight: height}}>
        {loader ? (
          this.placehoder()
        ) : listTransfers.length === 0 ? (
          <Text style={[styleApp.text, {marginLeft: 20, marginTop: 10}]}>
            You don't have any transfer yet.
          </Text>
        ) : (
          listTransfers.map((transfer, i) => (
            <CardTransfer key={i} transfer={transfer} />
          ))
        )}
      </View>
    );
  }
  async refresh() {
    await this.setState({loader: true});
    return this.loadTransfers();
  }
  widthdraw(wallet) {
    const {navigate} = this.props.navigation;
    if (Number(wallet.totalWallet) === 0) {
      return navigate('Alert', {
        close: true,
        title: 'You have insufficient funds in your wallet.',
        textButton: 'Got it!',
      });
    }
    if (!wallet.bankAccount) {
      return navigate('Payments');
    }
    return navigate('Alert', {
      subtitle:
        'Please note that funds may take a few business days to be transferred to your bank account.',
      title:
        'Do you wish to withdraw $' +
        wallet.totalWallet +
        ' on ' +
        wallet.bankAccount.bank_name +
        ' account?',
      textButton: 'Withdraw $' + wallet.totalWallet,
      onGoBack: () =>
        this.confirmWithdraw(
          Number(wallet.totalWallet),
          wallet.bankAccount,
          wallet.connectAccountToken,
        ),
    });
  }
  async confirmWithdraw(amount, tokenBankAccount, connectAccountToken) {
    const urlCreateUserConnectAccount = `${
      Config.FIREBASE_CLOUD_FUNCTIONS_URL
    }withdrawToBankAccount`;
    const {userID, wallet} = this.props;
    let {data} = await axios.get(urlCreateUserConnectAccount, {
      params: {
        userID: userID,
        amount: amount,
        userWallet: wallet.totalWallet,
        now: new Date().toString(),
        connectAccountToken: connectAccountToken,
      },
    });
    await this.props.navigation.navigate('Wallet');
    if (data.error) {
      return this.props.navigation.navigate('Alert', {
        close: true,
        title: 'An error has occured.',
        subtitle: data.error.message,
        textButton: 'Got it!',
      });
    }
    await this.props.navigation.navigate('Alert', {
      close: true,
      title:
        '$' + amount + ' has been successfully transferred to your account.',
      subtitle:
        'It will take few business days to be transferred to your bank account.',
      textButton: 'Got it!',
    });
    return this.refresh();
  }
  render() {
    const {dismiss, goBack} = this.props.navigation;
    const {wallet} = this.props;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Wallet: $' + wallet.totalWallet}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          //     initialBorderColorHeader={colors.grey}
          initialTitleOpacity={1}
          initialBorderWidth={0.3}
          typeIcon2={'font'}
          sizeIcon2={17}
          icon1={'chevron-left'}
          icon2={'text'}
          text2={'Get'}
          clickButton1={() => goBack()}
          clickButton2={() => this.widthdraw(wallet)}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.listWallet.bind(this)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottomScrollView={0}
          refreshControl={true}
          refresh={() => this.refresh()}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={sizes.heightFooter + 40}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    wallet: state.user.infoUser.wallet,
  };
};

export default connect(
  mapStateToProps,
  {},
)(ListEvent);
