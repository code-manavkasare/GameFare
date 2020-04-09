import React, {Component} from 'react';
import {
  StyleSheet,
  Dimensions,
  Linking,
  View,
  Alert,
} from 'react-native';
import colors from '../../style/colors';
import styleApp from '../../style/style';
import InAppBrowser from 'react-native-inappbrowser-reborn'

export default class Button extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
componentDidMount() {
  this.openLink()
}
async openLink() {
  const {route} = this.props
  const {url} = route.params
  try {
    if (await InAppBrowser.isAvailable()) {
      const result = await InAppBrowser.open(url, {
        // iOS Properties
        dismissButtonStyle: 'cancel',
        preferredBarTintColor: '#453AA4',
        preferredControlTintColor: 'white',
        readerMode: false,
        animated: false,
        modalPresentationStyle: 'overFullScreen',
        modalTransitionStyle: 'partialCurl',
        modalEnabled: true,
        enableBarCollapsing: false,
        // Android Properties
        showTitle: true,
        toolbarColor: '#6200EE',
        secondaryToolbarColor: 'black',
        enableUrlBarHiding: true,
        enableDefaultShare: true,
        forceCloseOnRedirection: false,
        // Specify full animation resource identifier(package:anim/name)
        // or only resource name(in case of animation bundled with app).
        animations: {
          startEnter: 'slide_in_right',
          startExit: 'slide_out_left',
          endEnter: 'slide_in_left',
          endExit: 'slide_out_right'
        },
        headers: {
          'my-custom-header': 'my custom header value'
        }
      })
      Alert.alert(JSON.stringify(result))
    }
    else Linking.openURL(url)
  } catch (error) {
    Alert.alert(error.message)
  }
}
  render() {
    return (
     <View style={styleApp.stylePage}></View>
    );
  }
}

const styles = StyleSheet.create({

});
