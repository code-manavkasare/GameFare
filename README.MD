# Welcome to GameFare

## Node Version

Our project use latest node stable version 12.14.1, and Firebase Cloud functions only work with node v8.

As we work on multiple project we will use an automatic node version manager (plugin for nvm)
We will install some paquet directly from network as brew is not managing our case well. Don't forget to have GPG singature verifier to avoid any security breach on your machine :  

    brew install gpg

As we install new things for the terminal and PATH will be updated, don't forget to reopen terminal everytime new PATH are created

- Clean all node installation frol your computer (for exemple if using brew as package manager and yarn) do :  

        brew uninstall yarn node

- First install nvm (https://github.com/nvm-sh/nvm#installing-and-updating), after installation close and reopen terminal  

        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash

If nvm is not recognised add it to your .zshrc or .bash_profile (dpeending on which temrinal you use):  

    source ~/.nvm/nvm.sh

- For this project we will use node v8 which has better stability so install it using nvm ! https://firebase.google.com/docs/functions/manage-functions#set_nodejs_version:  

        nvm install 8.16.0 (for firebase cloud function)
        nvm install 12.14.1 (for react-native project)

- Now you should be able to see your node installation, to check it :  

        nvm list  
        node -v

You should see node installation on your machine and node -v tells you which node installation is in use

- Install Automatic Node Versionning (AVN : https://github.com/wbyoung/avn)  

        npm install -g avn avn-nvm avn-n  
        avn setup

- Because we now use NVM for managing node package, we need to install yarn WITHOUT linking it a specific node version, and do it globally, to do that :  

        curl -o- -L https://yarnpkg.com/install.sh | bash

This will allow us to use yarn without a link to a node version and avoid reinstall it for every node version

You should be now set up 

Now evertime you cd in gamefare-native or playd-cloud you should see update from avn in your console like this :

    avn activated 8.16.0 (avn-nvm v8.16.0)

> Note that because you reinstall yarn, you'll need to reinstall everything linked to it !

## Installation React native

Install everything needed for react-native : https://facebook.github.io/react-native/docs/getting-started from React Native CLI Quickstart

    yarn && cd ios && pod install

## Start the App

Go to root folder then

    yarn ios

Firt build can throw bundle url error on emulator, if so relaunch and everything should work

If you have error Xcode can't find the node binary, DO not modify build configuration as it is a VERY bas practice, instead use a symlink :

    which node (will give you your actual node repo, will look like this : /Users/YourName/.nvm/versions/node/v12.14.1/bin/node)

And then simulate a clean node install to your actual used version (should be 12.14.1):

    ln -s /Users/YourName/.nvm/versions/node/v12.14.1/bin/node /usr/local/bin/node

Try yarn ios again, everything should work now.

## Xcode config for debugging

Run Xcode Product>Scheme>EditScheme, then into Run click on Build configuration put Debug instead of Release, then run

    yarn ios-dev 

for developper environment or 

    yarn ios-prod

for prod environment

## Debugging

We use Reactotron for debugging please install the software from github page : https://github.com/infinitered/reactotron/releases
We also use ESLint, be sure to have it installed on your VSCode extension

## Deploying

We use Fastlane for automatized deployment on Testflight. To use it first install it

    xcode-select --install
    brew install fastlane

Now fastlane should be installed ! To use it go to /ios repository of gamefare app and type :

    cd ios
    fastlane match appstore
    fastlane match development

You now have all working certification in order to push the app on the store.

    fastlane ios dev 
    fastlane ios prod

With dev and prod two different environment, dev will build and ship GameFare-dev, and prod will build the prod app GameFare

Thsi will push a new build of the current defined version. No need to always update version ! For versionning information : https://semver.org/
The build version is the lastest build version pushed to appstore +1

## Font

We use material and font awesome : https://fontawesome.com/icons?d=gallery

## Code Guidelines

We simply follow Airbnb Guideline : https://github.com/airbnb/javascript
And the guide for React work also for React Native: https://github.com/airbnb/javascript/tree/master/react

## Reset cache of debugger
rm -rf ~/Library/Application\ Support/React\ Native\ Debugger/

## Launch app on other simulator
yarn  ios-dev --simulator "iPhone 5s"

