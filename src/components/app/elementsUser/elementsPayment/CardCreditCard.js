import React, {Component} from 'react';
import {Text, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row, Grid} from 'react-native-easy-grid';
import AllIcons from '../../../layout/icons/AllIcons';

import styleApp from '../../../style/style';
import {cardIcon} from './iconCard';
import ButtonColor from '../../../layout/Views/Button';
import colors from '../../../style/colors';

class CardCreditCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialLoader: true,
      events: [],
    };
  }
  async componentDidMount() {}
  brand() {
    if (!this.props.cards) {
      return 'default';
    }
    return this.props.defaultCard.brand;
  }
  textCard() {
    if (!this.props.cards) {
      return 'Add payment method';
    }
    if (this.props.defaultCard.brand === 'applePay') return 'Apple Pay';
    if (this.props.defaultCard.brand === 'googlePay') return 'Google Pay';
    return '•••• ' + this.props.defaultCard.last4;
  }

  render() {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={20} style={styleApp.center}>
                {cardIcon(this.brand())}
              </Col>
              <Col size={70} style={styleApp.center2}>
                <Text style={styleApp.text}>{this.textCard()}</Text>
              </Col>
              <Col size={10} style={styleApp.center}>
                <AllIcons
                  name="keyboard-arrow-down"
                  color={colors.grey}
                  size={20}
                  type="mat"
                />
              </Col>
            </Row>
          );
        }}
        click={() => this.props.navigate('Payments', {pageFrom: 'Checkout'})}
        color="white"
        style={[styleApp.cardSelect]}
        onPressColor={colors.off}
      />
    );
  }
}

const styles = StyleSheet.create({
  buttonCard: {},
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    cards: state.user.infoUser.wallet.cards,
    defaultCard: state.user.infoUser.wallet.defaultCard,
  };
};

export default connect(
  mapStateToProps,
  {},
)(CardCreditCard);
