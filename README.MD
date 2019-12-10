#Hello ald welcome to GameFare

##Installation React native
    yarn && cd ios pod install

If error with react blob open /node_mudules/react-native-fetch-blob/iOS/react-native-fetch-blob.podspec
Change ‘React/Core’ to ‘React-Core’ then

    cd ios && pod update Mixpanel && pod install

To start application go to root folder then yarn iOS , normally if you have the last version of Xcode it should work :)

Run Xcode Product>Scheme>EditScheme, then into Run click on Build configuration put Debut instead of Release, then run

    yarn ios

##Debugging

We use Reactotron for debugging please install the software from github page : https://github.com/infinitered/reactotron/releases

We also use ESLint, be sure to have it installed on your VSCode extension
