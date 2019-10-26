import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Linking
} from 'react-native';
import {connect} from 'react-redux';

import Header from '../layout/headers/HeaderButton'
import ScrollView from '../layout/scrollViews/ScrollView'
import sizes from '../style/sizes'
import styleApp from '../style/style'
import colors from '../style/colors'
import { Col, Row, Grid } from "react-native-easy-grid";
import FontIcon from 'react-native-vector-icons/FontAwesome';
import {userAction} from '../../actions/userActions'
import InAppBrowser from 'react-native-inappbrowser-reborn'
import Communications from 'react-native-communications';

class ProfilePage extends Component {
  state={check:false}
  static getDerivedStateFromProps(props, state) {
    return state
  }
  title(text) {
    return (
      <Row style={{marginBottom:5,marginTop:20}}>
        <Col style={styleApp.center2}>
          <Text style={[styleApp.title,{fontSize:11,color:colors.grey}]}>{text}</Text>
        </Col>
      </Row>
    )
  }
  bigtitle(text) {
    return (
      <Row style={{marginBottom:5}}>
        <Col style={styleApp.center2}>
          <Text style={[styleApp.title,{fontSize:19}]}>{text}</Text>
        </Col>
      </Row>
    )
  }
  subtitle(text) {
    return (
      <Row style={{marginBottom:0}}>
        <Col style={styleApp.center2}>
          <Text style={[styleApp.subtitle,{fontSize:13}]}>{text}</Text>
        </Col>
      </Row>
    )
  }
  button(text,page,data,type,url) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => this.clickButton(text,page,data,type,url)} style={styles.button}>
      <Row>
        <Col size={90} style={styleApp.center2}>
          <Text style={[styleApp.title,{fontSize:13}]}>{text}</Text>
        </Col>
        <Col size={10} style={styleApp.center3}>
          <FontIcon size={20} name={'angle-right'} color={colors.title} /> 
        </Col>
      </Row>
      </TouchableOpacity>
    )
  }
  clickButton(text,page,data,type,url) {
    console.log('type')
    console.log(type)

    if (type == 'url') {
      this.openLink(url)
    } else if (type == 'call') {
      this.call()
    } else if (type == 'email') {
      this.sendEmail()
    } else if (type == 'link') {
      // this.sendEmail()
    } else {
      this.props.navigation.navigate(page,data)
    }
  }
  async openLink(url) {
    try {
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.open(url, {
          // iOS Properties
          dismissButtonStyle: 'cancel',
          preferredBarTintColor: colors.primary,
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'overFullScreen',
          modalTransitionStyle: 'coverVertical',
          modalEnabled: true,
          // Android Properties
          showTitle: true,
          toolbarColor: colors.primary,
          secondaryToolbarColor: colors.primary,
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
          },
          waitForRedirectDelay: 0
        })
        Alert.alert(JSON.stringify(result))
      }
      else Linking.openURL(url)
    } catch (error) {
      Alert.alert(error.message)
    }
  }
  call() {
    Communications.phonecall('+13477380603', true);  
  }
  sendEmail(){
    var email1 = 'contact@getgamefare.com';
    var subject = this.props.infoUser.firstname + ' ' + this.props.infoUser.lastname
    Communications.email([email1],null,null, subject ,'');
  }
  profile() {
    return (
      <View>
        {this.bigtitle(this.props.infoUser.firstname + ' ' + this.props.infoUser.lastname)}
        {this.subtitle(this.props.infoUser.countryCode + ' ' +this.props.infoUser.phoneNumber)}

        <View style={{height:10}} />

        {this.title('Account parameters')}

        {this.button('Personal information','Settings',{})}
        {this.button('Payment','Payments',{pageFrom:'Profile'})}
        {this.button('My wallet','Wallet',{})}

        {this.title('Assistance')}

        {this.button('Email','Alert',{},'email')}
        {this.button('Call','Alert',{},'call')}

        {this.title('Social media')}

        {this.button('Visit us on Instagram','Alert',{},'url','https://www.instagram.com/getgamefare')}

        {this.title('Legal')}

        {this.button('Privacy policy','Alert',{},'url','https://www.getgamefare.com/privacy')}
        {this.button('Terms of service','Alert',{},'url','https://www.getgamefare.com/terms')}

        {this.title('')}
        {this.button('Logout','Alert',{textButton:'Logout',title:'Do you want to log out?',onGoBack: (data) => this.confirmLogout(data)})}




      </View>
    )
  }
  async confirmLogout (data) {
    console.log('close logout')
    console.log(data)
    await this.props.userAction('logout',{userID:this.props.userID})
    this.props.navigation.navigate('Home')
  }
  render() {
    return (
      <View style={{ flex: 1,backgroundColor:'white' }}>
        <Header
        onRef={ref => (this.headerRef = ref)}
        title={'Profile'}
        icon={'angle-left'}
        close={() => this.props.navigation.navigate('Home')}
        />
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.profile()}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button:{
    height:50,
    borderColor:colors.off,
    borderBottomWidth:1,
  },
});

const  mapStateToProps = state => {
  return {
    userID:state.user.userID,
    infoUser:state.user.infoUser.userInfo
  };
};

export default connect(mapStateToProps,{userAction})(ProfilePage);
