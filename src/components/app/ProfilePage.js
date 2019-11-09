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
import SwiperLogout from './elementsUser/elementsProfile/SwiperLogout'
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
      <Row style={{marginLeft:0,width:'100%'}}>
        <Col size={90} style={styleApp.center2}>
          <Text style={[styleApp.title,{fontSize:14,fontFamily:'OpenSans-SemiBold',color:text=='Logout'?colors.primary:colors.title}]}>{text}</Text>
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
      <View style={{marginLeft:-20,width:width,marginTop:-10}}>
        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>
            <Text style={[styleApp.title,{marginBottom:0}]}>{'Hi, ' + this.props.infoUser.firstname + ' ' + this.props.infoUser.lastname}</Text>
            <Text style={[styleApp.subtitle,{marginBottom:0,marginTop:10}]}>{this.props.infoUser.countryCode + ' ' +this.props.infoUser.phoneNumber}</Text>
          </View>
        </View>
        
        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>
          <Text style={[styleApp.title,{marginBottom:0}]}>Account parameters</Text>

          <View style={styleApp.divider2} />
          {this.button('Personal information','Settings',{pageFrom:'Profile'})}
          {this.button('Payment','Payments',{pageFrom:'Profile'})}
          {this.button('My wallet','Wallet',{pageFrom:'Profile'})}
          </View>
        </View>

        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>
          <Text style={[styleApp.title,{marginBottom:0}]}>Assistance</Text>

          <View style={styleApp.divider2} />
          {this.button('Email','Alert',{},'email')}
          {this.button('Call','Alert',{},'call')}
          </View>
        </View>
        

        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>
          <Text style={[styleApp.title,{marginBottom:0}]}>Social media</Text>

          <View style={styleApp.divider2} />
          {this.button('Visit us on Instagram','Alert',{},'url','https://www.instagram.com/getgamefare')}
          </View>
        </View>

        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>
          <Text style={[styleApp.title,{marginBottom:0}]}>Legal</Text>

          <View style={styleApp.divider2} />
          {this.button('Privacy policy','Alert',{},'url','https://www.getgamefare.com/privacy')}
          {this.button('Terms of service','Alert',{},'url','https://www.getgamefare.com/terms')}
          </View>
        </View>

        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>
          
          {this.button('Logout','Alert',{textButton:'Logout',title:'Do you want to log out?',onGoBack: (data) => this.confirmLogout(data)})}
          </View>
        </View>
        




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
      <View style={[{flex:1,marginTop:0}]}>
        <SwiperLogout type={'profile'}/>

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
    marginLeft:0,
    width:'100%',
    borderColor:colors.borderColor,
    backgroundColor:'white',
    borderBottomWidth:0,
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
