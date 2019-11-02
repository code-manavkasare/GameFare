import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Linking,
    Image
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

class ProfilePage extends Component {
  state={check:false}
  static getDerivedStateFromProps(props, state) {
    return state
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Profile',
      headerStyle: {
          backgroundColor: colors.primary,
          borderBottomWidth:0
      },
      headerTitleStyle: {
          color:'white',
          fontFamily:'OpenSans-Bold',
          fontSize:14,
      },
      // headerLeft: () => <BackButton name='home' size={20} type='mat' click={() => navigation.navigate('Home')} />,
    }
  };
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
          <Text style={[styleApp.title,{fontSize:13,fontFamily:'OpenSans-SemiBold'}]}>{text}</Text>
        </Col>
        <Col size={10} style={styleApp.center3}>
          <FontIcon size={16} name={'angle-right'} color={colors.title} /> 
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
  rowCheck (text) {
    return (
      <Row style={{height:30}}>
        <Col size={10} style={styleApp.center2}>
          <AllIcons name='check' type='mat' size={17} color={colors.grey} />
        </Col>
        <Col size={90}  style={styleApp.center2}>
          <Text style={[styleApp.text,{fontSize:14}]}>{text}</Text>
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
        <Text style={[styleApp.title,{fontSize:19,marginBottom:15}]}>Join the GameFare community now!</Text>

        {this.rowCheck('Organize your sport events')}
        {this.rowCheck('Join sessions')}
        {this.rowCheck('Find your favourite coach')}
        {this.rowCheck('Rate your oponents')}
        {this.rowCheck('Create your community')}

        <View style={{height:20}} />
        <Button text='Sign in' click={() => this.props.navigation.navigate('Phone',{pageFrom:'Profile'})} backgroundColor={'green'} onPressColor={colors.greenClick}/>
      </View>
    )
  }
  render() {
    return (
      <View style={{ height:'100%',backgroundColor:'white' }}>
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
    borderColor:colors.off,
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
