import React, {Component} from 'react';
import {Animated} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import Button from './Button';
import colors from '../../style/colors';

class ButtonAcceptPayment extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  buttonDisable() {
    const {defaultCard, cards} = this.props;
    return !defaultCard || !cards;
  }
  render() {
    const {click, textButton} = this.props;
    return (
      <Button
        backgroundColor={'green'}
        disabled={this.buttonDisable()}
        onPressColor={colors.greenLight}
        text={textButton}
        click={() => click()}
        loader={false}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    cards: state.user.infoUser.wallet.cards,
    defaultCard: state.user.infoUser.wallet.defaultCard,
    tokenCusStripe: state.user.infoUser.wallet.tokenCusStripe,
  };
};

ButtonAcceptPayment.propTypes = {
  textButton: PropTypes.string,
  click: PropTypes.func,
};

export default connect(
  mapStateToProps,
  {},
)(ButtonAcceptPayment);
