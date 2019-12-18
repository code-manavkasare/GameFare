#Welcome to GameFare

## Installation React native

Install everything needed for react-native : https://facebook.github.io/react-native/docs/getting-started from React Native CLI Quickstart

    yarn && cd ios && pod install

## Start the App

Go to root folder then

    yarn ios

Firt build can throw bundle url error on emulator, if so relaunch and everything should work

## Xcode config for debugging

Run Xcode Product>Scheme>EditScheme, then into Run click on Build configuration put Debug instead of Release, then run

    yarn ios

## Debugging

We use Reactotron for debugging please install the software from github page : https://github.com/infinitered/reactotron/releases
We also use ESLint, be sure to have it installed on your VSCode extension

##Font
We use material and font awesome : https://fontawesome.com/icons?d=gallery

##Code Guidelines
We simply follow Airbnb Guideline : https://github.com/airbnb/javascript
And the guide for React work also for React Native: https://github.com/airbnb/javascript/tree/master/react
