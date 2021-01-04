import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import {Col, Row, Grid} from 'react-native-easy-grid';
import AllIcons from '../../../layout/icons/AllIcons';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import ScrollView from '../../../layout/scrollViews/ScrollView2';

import {heightHeaderHome, heightHeaderModal} from '../../../style/sizes';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import ButtonColor from '../../../layout/Views/Button';
import {cardIcon} from './iconCard';

class ListEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialLoader: true,
      events: [],
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {}
  row(icon, text, data) {
    const {defaultCard} = this.props;
    return (
      <ButtonColor
        key={data.id}
        view={() => {
          return (
            <Row style={{paddingLeft: '5%', paddingRight: '5%'}}>
              <Col size={15} style={styleApp.center2}>
                {icon}
              </Col>
              <Col size={75} style={[styleApp.center2]}>
                <Text style={styleApp.input}>{text}</Text>
              </Col>
              <Col size={10} style={styleApp.center3}>
                {!defaultCard ? (
                  <AllIcons
                    type="mat"
                    size={20}
                    name={'keyboard-arrow-right'}
                    color={icon === 'logout' ? colors.red : colors.grey}
                  />
                ) : defaultCard.id === data.id ? (
                  <View style={styles.defaultView}>
                    <Text style={styles.textDefault}>Default</Text>
                  </View>
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
        click={() => this.openPage(data)}
        color="white"
        style={styles.buttonRow}
        onPressColor={colors.off}
      />
    );
  }
  rowBankAccount() {
    const {bankAccount} = this.props;
    return (
      <ButtonColor
        view={() => {
          return (
            <Row style={{paddingLeft: 20, paddingRight: 20}}>
              <Col size={15} style={styleApp.center2}>
                <AllIcons
                  name="university"
                  size={20}
                  color={colors.title}
                  type="font"
                />
              </Col>
              <Col size={75} style={[styleApp.center2]}>
                <Text style={styleApp.title}>{bankAccount.bank_name}</Text>
                <Text style={styleApp.subtitle}>
                  {bankAccount.account_holder_name}
                </Text>
                <Text style={[styleApp.subtitle, {marginTop: 4}]}>
                  {bankAccount.routing_number} ••••{bankAccount.last4}
                </Text>
              </Col>
              <Col size={10} style={styleApp.center}>
                <AllIcons
                  name="keyboard-arrow-right"
                  size={20}
                  color={colors.grey}
                  type="mat"
                />
              </Col>
            </Row>
          );
        }}
        click={() => this.openBankAccount(bankAccount)}
        color="white"
        style={{flex: 1, marginTop: 10, paddingTop: 5, paddingBottom: 5}}
        onPressColor={colors.off}
      />
    );
  }
  openBankAccount(bankAccount) {
    return this.props.navigation.push('Alert', {
      title: 'Do you want to remove this bank account?',
      subtitle: bankAccount.routing_number + ' ••••' + bankAccount.last4,
      textButton: 'Remove',
      onGoBack: () => this.confirmDeleteBankAccount(),
    });
  }
  async confirmDeleteBankAccount() {
    const {userID} = this.props;
    await database()
      .ref('users/' + userID + '/wallet/bankAccount')
      .remove();
    return this.props.navigation.navigate('Payments');
  }
  openPage(data) {
    const {navigation} = this.props;
    if (data === 'new') {
      return navigation.navigate('NewMethod');
    } else if (data === 'bank') {
      if (!this.props.connectAccountToken)
        return navigation.navigate('CreateConnectAccount');
      return navigation.navigate('NewBankAccount');
    }
    return navigation.navigate('DetailCard', {
      data: data,
    });
  }
  listCard() {
    if (!this.props.cards) return null;
    return Object.values(this.props.cards).map((card, i) =>
      this.row(
        cardIcon(card.brand),
        card.brand === 'applePay' ? 'Apple Pay' : '•••• ' + card.last4,
        card,
      ),
    );
  }
  payments() {
    return (
      <View style={{marginTop: 0}}>
        <View style={styleApp.marginView}>
          <Text
            style={[
              styleApp.title,
              {marginBottom: 20, fontSize: 19, marginLeft: 0},
            ]}>
            Payment methods
          </Text>
          <View
            style={[styleApp.divider2, {marginTop: 10, marginBottom: 10}]}
          />
        </View>

        {this.listCard()}
        {this.row(cardIcon('default'), 'New payment method', 'new')}

        <View style={[styleApp.marginView, {marginTop: 30}]}>
          <Text
            style={[
              styleApp.title,
              {marginBottom: 20, fontSize: 19, marginLeft: 0},
            ]}>
            Bank Account
          </Text>
          <View
            style={[styleApp.divider2, {marginTop: 10, marginBottom: 10}]}
          />
        </View>

        {this.props.bankAccount
          ? this.rowBankAccount()
          : this.row(cardIcon('bank'), 'Link bank account', 'bank')}
      </View>
    );
  }
  render() {
    const {navigation} = this.props;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          //marginTop={10}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Payment methods'}
          inputRange={[0, 20]}
          initialTitleOpacity={0}
          initialBackgroundColor={'white'}
          initialBorderColorIcon={'white'}
          icon1="times"
          clickButton1={() => navigation.dangerouslyGetParent().pop()}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={this.payments.bind(this)}
          marginBottomScrollView={0}
          marginTop={heightHeaderHome}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  defaultView: {
    backgroundColor: colors.greenLight,
    borderRadius: 3,
    height: 25,
    width: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textDefault: {
    ...styleApp.text,
    color: colors.white,
    fontSize: 12,
  },
  buttonRow: {
    borderColor: colors.off,
    height: 60,
    width: '100%',
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    defaultCard: state.user.infoUser.wallet.defaultCard,
    cards: state.user.infoUser.wallet.cards,
    connectAccountToken: state.user.infoUser.wallet.connectAccountToken,
    bankAccount: state.user.infoUser.wallet.bankAccount,
  };
};

export default connect(
  mapStateToProps,
  {},
)(ListEvent);
