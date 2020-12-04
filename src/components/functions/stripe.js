import stripe from 'tipsi-stripe';
import axios from 'axios';
import Config from 'react-native-config';

import {store} from '../../store/reduxStore';

stripe.setOptions({
  publishableKey: 'pk_live_wO7jPfXmsYwXwe6BQ2q5rm6B00wx0PM4ki',
  merchantId: 'merchant.com.gamefare',
  androidPayMode: 'test',
  requiredBillingAddressFields: ['all'],
});

const options = {
  requiredBillingAddressFields: ['postal_address'],
};

const chargeUser = async (amount) => {
  const {userID} = store.getState().user;
  const {
    totalWallet,
    defaultCard,
    tokenCusStripe,
  } = store.getState().user.infoUser.wallet;

  var url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}chargeUser`;
  const {data} = await axios.get(url, {
    params: {
      amount,
      userID,
      currentUserWallet: totalWallet,
      now: new Date(),
      tokenCusStripe,
      cardID: defaultCard.id,
    },
  });
  console.log('data', data);
  return data;
};

export {stripe, options, chargeUser};
