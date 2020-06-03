import database from '@react-native-firebase/database';

const getValueOnce = async (ref) => {
  const objectSnap = await database()
    .ref(ref)
    .once('value');
  return objectSnap.val();
};

export {getValueOnce};
