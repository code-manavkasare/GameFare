import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row, Grid} from 'react-native-easy-grid';

import ScrollView from '../../../layout/scrollViews/ScrollView2';
import ButtonColor from '../../../layout/Views/Button';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import AllIcons from '../../../layout/icons/AllIcons';

import sizes from '../../../style/sizes';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {cardIcon} from './iconCard';

class NewMethod extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialLoader: true,
      events: [],
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {}
  row(icon, text, page, data) {
    const {defaultCard} = this.props;
    return (
      <ButtonColor
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
        click={() => this.props.navigation.navigate(page, data)}
        color="white"
        style={styles.button}
        onPressColor={colors.off}
      />
    );
  }
  payments() {
    return (
      <View style={{marginTop: 0}}>
        <View style={styleApp.marginView}>
          <Text style={[styleApp.title, {marginBottom: 20, fontSize: 19}]}>
            New payment method
          </Text>
          <View style={[styleApp.divider2, {marginTop: 10, marginBottom: 0}]} />
        </View>

        {this.row(cardIcon('default'), 'Credit/Debit card', 'NewCard', {})}
        {/* {this.row(cardIcon('applePay'), 'Apple Pay', 'ApplePay', {})} */}
      </View>
    );
  }
  render() {
    return (
      <View style={[styleApp.stylePage]}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'New method'}
          inputRange={[5, 10]}
          initialTitleOpacity={0}
          initialBackgroundColor={'white'}
          initialBorderColorIcon={'white'}
          icon1="chevron-left"
          clickButton1={() => this.props.navigation.goBack()}
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
  button: {
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
  };
};

export default connect(
  mapStateToProps,
  {},
)(NewMethod);
