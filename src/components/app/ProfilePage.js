import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Linking,
    Image,
    Dimensions
} from 'react-native';
import {connect} from 'react-redux';

import Header from '../layout/headers/HeaderButton'
import ScrollView from '../layout/scrollViews/ScrollView'
import sizes from '../style/sizes'
import styleApp from '../style/style'
import colors from '../style/colors'
import AllIcons from '../layout/icons/AllIcons'
import { Col, Row, Grid } from "react-native-easy-grid";
import FontIcon from 'react-native-vector-icons/FontAwesome';
import Button from '../layout/buttons/Button'
import {userAction} from '../../actions/userActions'
import InAppBrowser from 'react-native-inappbrowser-reborn'
import Communications from 'react-native-communications';
const { height, width } = Dimensions.get('screen')

class ProfilePage extends Component {
  state={check:false}
  static getDerivedStateFromProps(props, state) {
    return state
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Profile',
      headerStyle:styleApp.styleHeader,
      headerTitleStyle: styleApp.textHeader,
      // headerLeft: () => <BackButton name='home' size={20} type='mat' click={() => navigation.navigate('Home')} />,
    }
  };
  title(text) {
    return (
      <Row style={{marginBottom:5,marginTop:20,marginBottom:10}}>
        <Col style={styleApp.center2}>
          <Text style={[styleApp.title,{fontSize:12,color:colors.title,fontFamily:'OpenSans-SemiBold'}]}>{text}</Text>
        </Col>
      </Row>
    )
  }
  bigtitle(text) {
    return (
      <Row style={{marginBottom:5}}>
        <Col style={styleApp.center2}>
          <Text style={[styleApp.title,{fontSize:19,fontFamily:'OpenSans-SemiBold'}]}>{text}</Text>
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
      <Row style={{marginLeft:20,width:width-40}}>
        <Col size={90} style={styleApp.center2}>
          <Text style={[styleApp.title,{fontSize:14,fontFamily:'OpenSans-Regular'}]}>{text}</Text>
        </Col>
        <Col size={10} style={styleApp.center3}>
          <AllIcons type='mat' size={20} name={'keyboard-arrow-right'} color={colors.title} /> 
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
        {this.bigtitle('Hi, ' + this.props.infoUser.firstname + ' ' + this.props.infoUser.lastname)}
        {this.subtitle(this.props.infoUser.countryCode + ' ' +this.props.infoUser.phoneNumber)}

        <View style={{height:10}} />

        {this.title('Account parameters')}
        
        <View style={{backgroundColor:colors.borderColor,height:0.3,marginLeft:-20,width:width}}/>
        {this.button('Personal information','Settings',{pageFrom:'Profile'})}
        {this.button('Payment','Payments',{pageFrom:'Profile'})}
        {this.button('My wallet','Wallet',{pageFrom:'Profile'})}

        {this.title('Assistance')}

        <View style={{backgroundColor:colors.borderColor,height:0.3,marginLeft:-20,width:width}}/>
        {this.button('Email','Alert',{},'email')}
        {this.button('Call','Alert',{},'call')}

        {this.title('Social media')}

        <View style={{backgroundColor:colors.borderColor,height:0.3,marginLeft:-20,width:width}}/>
        {this.button('Visit us on Instagram','Alert',{},'url','https://www.instagram.com/getgamefare')}

        {this.title('Legal')}

        <View style={{backgroundColor:colors.borderColor,height:0.3,marginLeft:-20,width:width}}/>
        {this.button('Privacy policy','Alert',{},'url','https://www.getgamefare.com/privacy')}
        {this.button('Terms of service','Alert',{},'url','https://www.getgamefare.com/terms')}

        {this.title('')}
        <View style={{backgroundColor:colors.borderColor,height:0.3,marginLeft:-20,width:width}}/>
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
  rowCheck (text) {
    return (
      <Row style={{height:30}}>
        <Col size={10} style={styleApp.center2}>
          <AllIcons name='check' type='mat' size={17} color={colors.grey} />
        </Col>
        <Col size={90}  style={styleApp.center2}>
          <Text style={[styleApp.text,{fontFamily:'OpenSans-Regular',fontSize:14}]}>{text}</Text>
        </Col>
      </Row>
    )
  }
  profileLogout() {
    return (
      <View style={[{flex:1,marginTop:20}]}>
        <Row>
          <Col style={styleApp.center}>
            <Image source={require('../../img/images/rocket.png')} style={{width:100,height:100,marginBottom:30}} />
          </Col>
        </Row>
        <Text style={[styleApp.title,{fontSize:19,marginBottom:15,marginRight:20}]}>Join the GameFare community now!</Text>

        {this.rowCheck('Organize your sport events')}
        {this.rowCheck('Join sessions')}
        {this.rowCheck('Find your favorite coach')}
        {this.rowCheck('Rate your opponents')}
        {this.rowCheck('Create your community')}

        <View style={{height:20}} />
        <Button text='Sign in' click={() => this.props.navigation.navigate('Phone',{pageFrom:'Profile'})} backgroundColor={'green'} onPressColor={colors.greenClick}/>
      </View>
    )
  }
  render() {
    return (
      <View style={{ height:'100%',backgroundColor:colors.off2 }}>
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.props.userConnected?this.profile():this.profileLogout()}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={90}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button:{
    height:50,
    marginLeft:-20,
    width:width,
    borderColor:colors.borderColor,
    backgroundColor:'white',
    borderBottomWidth:0.3,
  },
});

const  mapStateToProps = state => {
  return {
    userID:state.user.userID,
    infoUser:state.user.infoUser.userInfo,
    userConnected:state.user.userConnected,
  };
};

export default connect(mapStateToProps,{userAction})(ProfilePage);
