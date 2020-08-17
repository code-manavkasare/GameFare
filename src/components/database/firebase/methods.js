import database from '@react-native-firebase/database';

const getOnceValue = async (ref) => {
  const objectSnap = await database()
    .ref(ref)
    .once('value');
  return objectSnap.val();
};

module.exports = {
  getOnceValue,
};
