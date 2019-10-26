import React, {Component} from 'react';

import AllIcons from '../../../layout/icons/AllIcons'
import colors from '../../../style/colors'

function cardIcon(brand) {
  var icon = 'credit-card'
  if (brand == 'MasterCard') {
    icon = 'cc-mastercard'
  } else if (brand == 'applePay') {
    icon = 'cc-apple-pay'
  }  else if (brand == 'American Express') {
    icon = 'cc-amex'
  } else if (brand == 'Discover') {
    icon = 'cc-discover'
  } else if (brand == 'Diners Club') {
    icon = 'cc-diners-club'
  } else if (brand == 'JCB') {
    icon = 'cc-jcb'
  } else if (brand == 'Visa') {
    icon = 'cc-visa'
  }
  return <AllIcons size={20} name={icon} color={colors.title} type='font' />
}

module.exports = {cardIcon};

