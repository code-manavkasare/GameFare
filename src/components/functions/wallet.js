import database from '@react-native-firebase/database';

import {getValueOnce} from '../database/firebase/methods';
// import {fetchGameFareCommission} from '../database/firebase/fetchData';
// import {fetchStripeFees} from './stripe';

const calculateFees = async ({amount}) => {
  // const {stripeFixed, stripeVariable} = await fetchStripeFees();
  // const gamefareCommission = await fetchGameFareCommission();

  amount = amount ?? 0;

  // // Stripe processing
  // let processingFees = amount * stripeVariable + stripeFixed;

  // // GameFare commission
  // let serviceCharge = amount * gamefareCommission * 0.01;

  // // Total amount to transfer
  // let total = amount - serviceCharge - processingFees;
  let total = amount;

  // processingFees = processingFees.toFixed(2);
  // serviceCharge = serviceCharge.toFixed(2);
  total = total.toFixed(2);

  return {processingFees: 0, serviceCharge: 0, total};
};

const payUser = async ({userID, amount, description}) => {
  const walletPath = `users/${userID}/wallet/totalWallet`;

  let currentWallet = parseFloat(await getValueOnce(walletPath));
  if (isNaN(currentWallet)) currentWallet = 0;

  let {total} = await calculateFees({amount});

  let newWallet = Number(parseFloat(total) + currentWallet).toFixed(2);

  let updates = {
    [walletPath]: newWallet,
  };

  const transferCharge = {
    invoice: {
      totalPrice: total,
    },
    title: description,
    type: 'plus',
    date: new Date(),
  };
  try {
    await database()
      .ref('usersTransfers/' + userID)
      .push(transferCharge);
    await database()
      .ref()
      .update(updates);
    return true;
  } catch (err) {
    return false;
  }
};

export {payUser, calculateFees};
