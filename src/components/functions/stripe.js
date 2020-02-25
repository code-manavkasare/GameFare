import stripe from 'tipsi-stripe';

stripe.setOptions({
  publishableKey: 'pk_live_wO7jPfXmsYwXwe6BQ2q5rm6B00wx0PM4ki',
  merchantId: 'merchant.com.gamefare',
  androidPayMode: 'test',
  requiredBillingAddressFields: ['all'],
});

const options = {
  requiredBillingAddressFields: ['postal_address'],
};

const chargeUser = async (amount, wallet, userID) => {};

module.exports = {
  stripe,
  options,
  chargeUser,
};
