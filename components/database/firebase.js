// import firebase from 'firebase'

// var initialized = false

// async function initFirebase() {
//     var config = {
//         apiKey: 'AIzaSyCqffYtWjKsml-3LFr75jdWp-er6QGUgR0',
//             authDomain: 'getplayd.firebaseapp.com',
//             databaseURL: 'https://getplayd.firebaseio.com',
//             projectId: 'getplayd',
//             storageBucket: 'getplayd.appspot.com',
//             messagingSenderId: '1022232395517'
//     }

//     await firebase.database.enableLogging(true)
//     await firebase.initializeApp(config)
//     return true
// }

// async function getDatabase() {
//     if (!initialized) {
//         await initFirebase()
//     }
//     console.log('on return databae')
//     return firebase.database()
// }

// module.exports = {getDatabase};
import * as Firebase from 'firebase'

let HAS_INITIALIZED = false

const initFirebase = () => {
    if (!HAS_INITIALIZED) {
        const config = {
            apiKey: 'AIzaSyCqffYtWjKsml-3LFr75jdWp-er6QGUgR0',
            authDomain: 'getplayd.firebaseapp.com',
            databaseURL: 'https://getplayd.firebaseio.com',
            projectId: 'getplayd',
            storageBucket: 'getplayd.appspot.com',
            messagingSenderId: '1022232395517'
        }
        Firebase.initializeApp(config)
        Firebase.database.enableLogging(true)
        
        HAS_INITIALIZED = true
    }
}

export const getDatabase = () => {
    initFirebase()
    return Firebase.database()
}