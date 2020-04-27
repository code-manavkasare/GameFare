import messaging from '@react-native-firebase/messaging';
import database from '@react-native-firebase/database';

async function permissions() {
  try {
    await messaging().requestPermission();
    return true;
  } catch (err) {
    return false;
  }
}

async function subscribeToTopics(topics) {
  var permission = await permissions();
  if (!permission) {
    return false;
  }
  for (var i in topics) {
    await messaging().subscribeToTopic(topics[i]);
  }
  return true;
}

const refreshTokenOnDatabase = async (userID) => {
  const token = await messaging().getToken();
  await database()
    .ref('users/' + userID + '/')
    .update({FCMToken: token});
  return true;
};

module.exports = {subscribeToTopics, refreshTokenOnDatabase};
