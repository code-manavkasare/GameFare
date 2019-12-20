import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
const {height, width} = Dimensions.get('screen');
import firebase from 'react-native-firebase';
import {Col, Row, Grid} from 'react-native-easy-grid';
import AllIcons from '../../../layout/icons/AllIcons';
import Header from '../../../layout/headers/HeaderButton';
import ScrollView from '../../../layout/scrollViews/ScrollView';
import BackButton from '../../../layout/buttons/BackButton';
import ButtonColor from '../../../layout/Views/Button';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

import sizes from '../../../style/sizes';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {cardIcon} from './iconCard';
import axios from 'axios';

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
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={{height: 50, marginBottom: 20}}>
        <Row>
          <Col size={15} style={styleApp.center2}>
            {cardIcon(this.props.navigation.getParam('data').brand)}
          </Col>
          <Col size={60} style={styleApp.center2}>
            <Text style={styleApp.text}>
              {this.props.navigation.getParam('data').brand == 'applePay'
                ? 'Apple Pay'
                : '•••• ' +
                  this.props.navigation.getParam('data').last4 +
                  '    ' +
                  this.props.navigation.getParam('data').exp_month +
                  '/' +
                  this.props.navigation.getParam('data').exp_year}
            </Text>
          </Col>
          <Col size={25} style={styleApp.center3}>
            {this.props.defaultCard ===
            undefined ? null : this.props.navigation.getParam('data').id ===
              this.props.defaultCard.id ? (
              <View style={styleApp.viewSport}>
                <Text
                  style={[
                    styleApp.textSport,
                    {fontSize: 12, color: colors.white},
                  ]}>
                  Default
                </Text>
              </View>
            ) : null}
          </Col>
        </Row>
      </TouchableOpacity>
    );
  }
  row(icon, text, data) {
    console.log('cest ici meme');
    console.log(data);
    console.log(this.props.defaultCard);
    return (
      <ButtonColor
        view={() => {
          return (
            <Row style={{paddingLeft: 20, paddingRight: 20}}>
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
            borderRadius: 0,
            borderBottomWidth: 0,
            marginTop: 0,
          },
        ]}
        onPressColor={colors.off}
      />
    );
  }
  async action(data) {
    if (data == 'delete') {
      this.props.navigation.navigate('Alert', {
        title: 'Do you want to delete this payment method?',
        subtitle:
          this.props.navigation.getParam('data').brand === 'applePay'
            ? 'Apple Pay'
            : '•••• ' +
              this.props.navigation.getParam('data').last4 +
              '    ' +
              this.props.navigation.getParam('data').exp_month +
              '/' +
              this.props.navigation.getParam('data').exp_year,
        textButton: 'Delete',
        onGoBack: () => this.confirmDelete(),
      });
    } else {
      if (
        this.props.navigation.getParam('data').id === this.props.defaultCard.id
      ) {
        return this.props.navigation.goBack();
      } else {
        await firebase
          .database()
          .ref('users/' + this.props.userID + '/wallet/defaultCard/')
          .update(this.props.navigation.getParam('data'));
        return this.props.navigation.goBack();
      }
    }
  }
  async confirmDelete() {
    // delete card
    this.setState({loader: true});
    console.log(this.props.navigation.getParam('data').id);
    var url =
      'https://us-central1-getplayd.cloudfunctions.net/deleteUserCreditCard';
    const results = await axios.get(url, {
      params: {
        CardID: this.props.navigation.getParam('data').id,
        userID: this.props.userID,
        tokenStripeCus: this.props.tokenCusStripe,
      },
    });
    if (results.data.response == true) {
      console.log('lllllllll');
      console.log(this.props.cards);
      console.log(Object.values(this.props.cards)[0]);
      console.log(this.props.defaultCard.id);
      console.log(this.props.navigation.getParam('data').id);
      if (this.props.cards == undefined) {
        await firebase
          .database()
          .ref('users/' + this.props.userID + '/wallet/defaultCard/')
          .remove();
      } else if (
        this.props.navigation.getParam('data').id ==
          this.props.defaultCard.id &&
        Object.values(this.props.cards).length > 0
      ) {
        await firebase
          .database()
          .ref('users/' + this.props.userID + '/wallet/defaultCard/')
          .update(Object.values(this.props.cards)[0]);
      } else if (
        this.props.navigation.getParam('data').id === this.props.defaultCard.id
      ) {
        await firebase
          .database()
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
      <View style={{marginTop: 10}}>
        <View style={styleApp.marginView}>
          {this.rowCB()}
          <View style={[styleApp.divider2, {marginTop: 0, marginBottom: 10}]} />
        </View>

        <View
          style={{
            height: 0,
            backgroundColor: colors.borderColor,
            marginLeft: 0,
            width: width,
          }}
        />
        {this.row('check', 'Set as default', 'set')}
        {this.row('trash-alt', 'Delete payment method', 'delete')}
      </View>
    );
  }
  render() {
    return (
      <View style={[styleApp.stylePage]}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={
            this.props.navigation.getParam('data').brand === 'applePay'
              ? 'Apple Pay'
              : this.props.navigation.getParam('data').brand
          }
          inputRange={[20, 50]}
          initialTitleOpacity={0}
          initialBackgroundColor={'white'}
          initialBorderColorIcon={'white'}
          icon1="arrow-left"
          clickButton1={() => this.props.navigation.goBack()}
        />
        <ScrollView
          // style={{marginTop:sizes.heightHeaderHome}}
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={this.payments.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={true}
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

export default connect(mapStateToProps, {})(ListEvent);
