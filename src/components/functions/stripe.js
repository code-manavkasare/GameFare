import stripe from 'tipsi-stripe';
import axios from 'axios';
import Config from 'react-native-config';

import {store} from '../../store/reduxStore';
import {getValueOnce} from '../database/firebase/methods';
import {payUser} from './wallet';

stripe.setOptions({
  publishableKey: 'pk_live_wO7jPfXmsYwXwe6BQ2q5rm6B00wx0PM4ki',
  merchantId: 'merchant.com.gamefare',
  androidPayMode: 'test',
  requiredBillingAddressFields: ['all'],
});

const options = {
  requiredBillingAddressFields: ['postal_address'],
};

const fetchStripeFees = async () => {
  const {fixed, variable} = await getValueOnce('variables/stripeFees');
  return {
    stripeFixed: fixed,
    stripeVariable: variable,
  };
};

const authorizePayment = async (amount) => {
  const {defaultCard, tokenCusStripe} = store.getState().user.infoUser.wallet;

  var url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}authorizePayment`;
  const {data} = await axios.get(url, {
    params: {
      amount,
      tokenCusStripe,
      cardID: defaultCard.id,
    },
  });
  return data;
};

const completePayment = async ({requestorID, paymentIntentID, amount}) => {
  const url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}chargeUser`;
  const {data} = await axios.get(url, {
    params: {
      requestorID,
      paymentIntentID,
      amount,
    },
  });

  return data;
};

export {stripe, options, authorizePayment, fetchStripeFees, completePayment};
