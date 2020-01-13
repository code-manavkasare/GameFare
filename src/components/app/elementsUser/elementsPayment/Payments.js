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
import {Col, Row, Grid} from 'react-native-easy-grid';
import AllIcons from '../../../layout/icons/AllIcons';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import ScrollView from '../../../layout/scrollViews/ScrollView';

import sizes from '../../../style/sizes';
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
    return (
      <ButtonColor
        view={() => {
          return (
            <Row style={{paddingLeft: 20, paddingRight: 20}}>
              <Col size={15} style={styleApp.center2}>
                {icon}
              </Col>
              <Col size={75} style={[styleApp.center2]}>
                <Text style={styleApp.input}>{text}</Text>
              </Col>
              <Col size={10} style={styleApp.center}>
                {this.props.defaultCard == undefined ? null : this.props
                    .defaultCard.id == data.id ? (
                  <View style={styles.defaultView}>
                    <Text style={styles.textDefault}>D</Text>
                  </View>
                ) : null}
              </Col>
            </Row>
          );
        }}
        click={() => this.openPage(data)}
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
  openPage(data) {
    if (data == 'new') {
      return this.props.navigation.navigate('NewMethod', {
        pageFrom: this.props.navigation.getParam('pageFrom'),
      });
    } else if (data == 'bank') {
      return this.props.navigation.navigate('Alert', {
        textButton: 'Close',
        title: 'Coming soon!',
        close: true,
        onGoBack: () => this.props.navigation.navigate('Payments'),
      });
    }
    return this.props.navigation.navigate('DetailCard', {
      pageFrom: this.props.navigation.getParam('pageFrom'),
      data: data,
    });
  }
  listCard() {
    if (!this.props.cards) return null;
    return Object.values(this.props.cards).map((card, i) =>
      this.row(
        cardIcon(card.brand),
        card.brand == 'applePay' ? 'Apple Pay' : '•••• ' + card.last4,
        card,
      ),
    );
  }
  payments() {
    return (
      <View style={{marginTop: 20}}>
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

        <View
          style={{
            height: 0,
            backgroundColor: colors.borderColor,
            width: width - 40,
            marginLeft: 20,
          }}
        />
        {this.listCard()}
        {this.row(cardIcon('default'), 'New payment method', 'new')}

        <View style={[styleApp.marginView, {marginTop: 30}]}>
          <Text
            style={[
              styleApp.title,
              {marginBottom: 20, fontSize: 19, marginLeft: 0},
            ]}>
            Bank Accounts
          </Text>
          <View
            style={[styleApp.divider2, {marginTop: 10, marginBottom: 10}]}
          />
        </View>

        <View
          style={{
            height: 0,
            backgroundColor: colors.borderColor,
            width: width - 40,
            marginLeft: 20,
          }}
        />
        {this.row(cardIcon('bank'), 'Link bank account', 'bank')}
      </View>
    );
  }
  render() {
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Payment methods'}
          inputRange={[20, 50]}
          initialTitleOpacity={0}
          initialBackgroundColor={'white'}
          initialBorderColorIcon={'white'}
          icon1="times"
          clickButton1={() => this.props.navigation.dismiss()}
        />
        <ScrollView
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

const styles = StyleSheet.create({
  defaultView: {
    backgroundColor: colors.greenLight,
    borderRadius: 12.5,
    height: 25,
    width: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textDefault: {
    color: colors.white,
    fontSize: 12,
    fontFamily: 'OpenSans-Bold',
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    defaultCard: state.user.infoUser.wallet.defaultCard,
    cards: state.user.infoUser.wallet.cards,
  };
};

export default connect(mapStateToProps, {})(ListEvent);
