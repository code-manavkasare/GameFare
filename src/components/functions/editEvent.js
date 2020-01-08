import firebase from 'react-native-firebase';

async function editEventPrice(key, price, callback = ()=>{}) {
    console.log('Updating event ' + key + ' with price ' + price);
    await firebase
      .database()
      .ref('events/' + key + '/')
      .update({price: {joiningFee: Number(price)}})
      .then(() => callback);
}

async function editEventName(key, name, callback = ()=>{}) {
    console.log('Updating event ' + key + ' with price ' + price);
    // await firebase
    //   .database()
    //   .ref('events/' + key + '/')
    //   .update({info: {name: name}})
    //   .then(() => callback);
}

module.exports = {editEventPrice, editEventName};
