import React, {Component} from 'react';
import {View, Text, TouchableOpacity, Animated} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

import {Col, Row} from 'react-native-easy-grid';
import axios from 'axios';
import Config from 'react-native-config';

import AllIcons from '../../../layout/icons/AllIcons';
import ScrollView from '../../../layout/scrollViews/ScrollView2';
import ButtonColor from '../../../layout/Views/Button';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

import sizes from '../../../style/sizes';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
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
  rowCB() {
    const {route, defaultCard} = this.props;
    const {data: dataCard} = route.params;
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={{height: 50, marginBottom: 20}}>
        <Row>
          <Col size={15} style={styleApp.center2}>
            {cardIcon(dataCard.brand)}
          </Col>
          <Col size={60} style={styleApp.center2}>
            <Text style={styleApp.text}>
              {dataCard.brand == 'applePay'
                ? 'Apple Pay'
                : '•••• ' +
                  dataCard.last4 +
                  '    ' +
                  dataCard.exp_month +
                  '/' +
                  dataCard.exp_year}
            </Text>
          </Col>
          <Col size={25} style={styleApp.center3}>
            {defaultCard && dataCard.id === defaultCard.id && (
              <View style={styleApp.viewSport}>
                <Text
                  style={[styleApp.text, {fontSize: 12, color: colors.white}]}>
                  Default
                </Text>
              </View>
            )}
          </Col>
        </Row>
      </TouchableOpacity>
    );
  }
  row(icon, text, data) {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row style={{paddingLeft: '5%', paddingRight: '5%'}}>
              <Col size={15} style={styleApp.center2}>
                <AllIcons
                  name={icon}
                  size={17}
                  color={colors.title}
                  type="font"
                />
              </Col>
              <Col size={75} style={[styleApp.center2]}>
                <Text style={styleApp.input}>{text}</Text>
              </Col>
            </Row>
          );
        }}
        click={() => this.action(data)}
        color="white"
        style={[
          {
            borderColor: colors.off,
            height: 60,
            width: '100%',
          },
        ]}
        onPressColor={colors.off}
      />
    );
  }
  async action(data) {
    const {params} = this.props.route;
    const {data: dataCard} = params;
    if (data === 'delete') {
      this.props.navigation.push('Alert', {
        title: 'Do you want to delete this payment method?',
        subtitle:
          dataCard.brand === 'applePay'
            ? 'Apple Pay'
            : '•••• ' +
              dataCard.last4 +
              '    ' +
              dataCard.exp_month +
              '/' +
              dataCard.exp_year,
        textButton: 'Delete',
        onGoBack: () => this.confirmDelete(),
      });
    } else {
      if (dataCard.id === this.props.defaultCard.id) {
        return this.props.navigation.goBack();
      } else {
        await database()
          .ref('users/' + this.props.userID + '/wallet/defaultCard/')
          .update(dataCard);
        return this.props.navigation.goBack();
      }
    }
  }
  async confirmDelete() {
    const {params} = this.props.route;
    const {data: dataCard} = params;
    this.setState({loader: true});
    var url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}deleteUserCreditCard`;
    const results = await axios.get(url, {
      params: {
        CardID: dataCard.id,
        userID: this.props.userID,
        tokenStripeCus: this.props.tokenCusStripe,
      },
    });
    if (results.data.response) {
      if (!this.props.cards) {
        await database()
          .ref('users/' + this.props.userID + '/wallet/defaultCard/')
          .remove();
      } else if (
        dataCard.id === this.props.defaultCard.id &&
        Object.values(this.props.cards).length > 0
      ) {
        await database()
          .ref('users/' + this.props.userID + '/wallet/defaultCard/')
          .update(Object.values(this.props.cards)[0]);
      } else if (dataCard.id === this.props.defaultCard.id) {
        await database()
          .ref('users/' + this.props.userID + '/wallet/defaultCard/')
          .remove();
      }
      this.props.navigation.navigate('Payments');
    } else {
      this.props.navigation.navigate('Payments');
    }
  }
  payments() {
    return (
      <View style={{marginTop: 0}}>
        <View style={styleApp.marginView}>
          {this.rowCB()}
          <View style={[styleApp.divider2, {marginTop: 0, marginBottom: 10}]} />
        </View>

        {this.row('check', 'Set as default', 'set')}
        {this.row('trash-alt', 'Delete payment method', 'delete')}
      </View>
    );
  }
  render() {
    const {params} = this.props.route;
    const {data: dataCard} = params;
    return (
      <View style={[styleApp.stylePage]}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={
            dataCard.brand === 'applePay' ? 'Apple Pay' : dataCard.brand
          }
          inputRange={[5, 10]}
          initialTitleOpacity={0}
          initialBackgroundColor={'white'}
          initialBorderColorIcon={'white'}
          icon1="arrow-left"
          clickButton1={() => this.props.navigation.goBack()}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={this.payments.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    defaultCard: state.user.infoUser.wallet.defaultCard,
    cards: state.user.infoUser.wallet.cards,
    tokenCusStripe: state.user.infoUser.wallet.tokenCusStripe,
  };
};

export default connect(
  mapStateToProps,
  {},
)(ListEvent);
