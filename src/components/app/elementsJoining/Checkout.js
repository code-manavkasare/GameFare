import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Linking,
    Animated
} from 'react-native';
import {connect} from 'react-redux';
import {eventsAction} from '../../../actions/eventsActions'

const { height, width } = Dimensions.get('screen')
import { StackActions, NavigationActions } from 'react-navigation';
import HeaderBackButton from '../../layout/headers/HeaderBackButton'

import Header from '../../layout/headers/HeaderButton'
import BackButton from '../../layout/buttons/BackButton'
import ScrollView from '../../layout/scrollViews/ScrollView'
import sizes from '../../style/sizes'
import styleApp from '../../style/style'
import colors from '../../style/colors'
import { Col, Row, Grid } from "react-native-easy-grid";
import FontIcon from 'react-native-vector-icons/FontAwesome';
import {userAction} from '../../../actions/userActions'
import Button from '../../layout/buttons/Button'

import AllIcons from '../../layout/icons/AllIcons'
import DateEvent from '../elementsEventCreate/DateEvent'
import CardCreditCard from '../elementsUser/elementsPayment/CardCreditCard'
import axios from 'axios'
import firebase from 'react-native-firebase'

import stripe from 'tipsi-stripe'
stripe.setOptions({
  publishableKey: 'pk_live_wO7jPfXmsYwXwe6BQ2q5rm6B00wx0PM4ki',
  merchantId: 'merchant.gamefare',
  androidPayMode: 'test',
  requiredBillingAddressFields:['all']
});
var options ={
  requiredBillingAddressFields:['postal_address']
}

class ProfilePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader:false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0)
  }
  shouldComponentUpdate(nextProps,nextState) {
    if (this.props.futureEvents != nextProps.futureEvents) return false
    return true
  }
  componentDidMount() {
    console.log('checkout mount')
    console.log(this.status(this.props.navigation.getParam('data')))
  }
  dateTime(start,end) {
    return <DateEvent 
    start={start}
    end={end}
    />
  }
  rowIcon (component,icon) {
    return (
      <Row style={{marginTop:20}}>
        <Col size={10} style={styleApp.center2}>
          <AllIcons name={icon} color={colors.greyDark} size={16} type='font' />
        </Col>
        <Col size={90} style={styleApp.center2}>
          {component}
        </Col>
      </Row>
    )
  }
  title(text) {
    return <Text style={styleApp.input}>{text}</Text>
  }
  rowText(text,colorText,fontFamily,val) {
    return <Row style={{height:35}}>
      <Col style={styleApp.center2} size={80}>
        <Text style={[styleApp.text,{fontSize:16,color:colorText,fontFamily:fontFamily}]}>{text}</Text>
      </Col>
      <Col style={styleApp.center3} size={20}>
        <Text style={[styleApp.text,{fontSize:16,color:colorText,fontFamily:fontFamily}]}>{val}</Text>
      </Col>
    </Row>
  }
  sport(sport) {
    return <Row>
      <Col size={75} style={styleApp.center2}>
        <Text style={styleApp.title}>{this.props.navigation.getParam('data').info.name}</Text>
      </Col>
      <Col size={25} style={styleApp.center3}>
      <View style={[styleApp.viewSport,{backgroundColor:sport.card.color.color,width:'100%'}]}>
        <Text style={[styleApp.textSport,{color:'white'}]}>{this.props.navigation.getParam('data').info.sport.charAt(0).toUpperCase() + this.props.navigation.getParam('data').info.sport.slice(1)}</Text>
      </View>
      </Col>
    </Row>
  }
  creditCard () {
    return <CardCreditCard navigate={(val,data) => this.props.navigation.navigate(val,data)}/>
  }
  checkout(data) {
    var sport = this.props.sports.filter(sport => sport.value == data.info.sport)[0]
    return (
      <View style={{marginLeft:0,width:width,marginTop:0}}>
        <View style={[styleApp.viewHome,{paddingTop:0}]}>
          <View style={styleApp.marginView}>
            {this.sport(sport)}
          </View>
        </View>

        <View style={[{paddingTop:5}]}>
          <View style={styleApp.marginView}>

            {this.rowIcon(this.dateTime(data.date.start,data.date.end),'calendar-alt')}
            {this.rowIcon(this.title(data.location.area),'map-marker-alt','AlertAddress',data.location)}
            {/* {data.info.instructions != ''?this.rowIcon(this.title(data.info.instructions),'parking'):null} */}
            {this.rowIcon(this.title(this.props.navigation.getParam('data').info.maxAttendance + ' people'),'user-check')}

          </View>
        </View>

        <View style={[styleApp.viewHome,{paddingTop:15}]}>
          <View style={styleApp.marginView}>

          {this.rowText(this.coach()?'Price per player':'Entry fee',colors.title,'OpenSans-SemiBold',Number(this.props.navigation.getParam('data').price.joiningFee)==0?'Free':'$' +this.props.navigation.getParam('data').price.joiningFee)}
          {this.coach()?this.rowText('Attendance',colors.title,'OpenSans-SemiBold',this.props.navigation.getParam('data').info.maxAttendance):null}
          {this.coach()?<View style={[styleApp.divider,{marginBottom:10,marginTop:10}]} />:null}
          {this.coach()?this.rowText('Get',colors.title,'OpenSans-SemiBold','$' + Number(this.props.navigation.getParam('data').price.joiningFee)*Number(this.props.navigation.getParam('data').info.maxAttendance)):null}
          {
            !this.coach() && this.props.userConnected && Number(this.props.navigation.getParam('data').price.joiningFee)!=0?
            this.rowText('Credits',colors.green,'OpenSans-SemiBold','$' +Number(this.props.totalWallet).toFixed(2))
            :null
          }

          {
            this.coach() || Number(this.props.navigation.getParam('data').price.joiningFee)==0?
            null
            :this.props.userConnected?
            <View>
              {this.rowText('Charge amount',colors.title,'OpenSans-SemiBold','$' +Math.max(0,Number(this.props.navigation.getParam('data').price.joiningFee)-Number(this.props.totalWallet)).toFixed(2))}
              <View style={[styleApp.divider2,{marginBottom:10}]} />
            </View>
            :
            <View>
              {this.rowText('Charge amount',colors.title,'OpenSans-SemiBold','$' +Number(this.props.navigation.getParam('data').price.joiningFee))}
              <View style={[styleApp.divider2,{marginBottom:10}]} />
            </View>
          }

          {
            !this.coach() && this.props.userConnected && Math.max(0,Number(this.props.navigation.getParam('data').price.joiningFee)-Number(this.props.totalWallet)) != 0?
            this.creditCard()
            :null
          }

          </View>
        </View>
        
        {
        this.coach() || Math.max(0,Number(this.props.navigation.getParam('data').price.joiningFee)-Number(this.props.totalWallet)) != 0?
        <View style={[styleApp.viewHome,{paddingTop:15}]}>
          <View style={styleApp.marginView}>

          {
          this.coach()?
          <Text style={[styleApp.title,{fontSize:13}]}>Reminder • <Text style={{fontFamily:'OpenSans-Regular'}}>Your payment for this session will be number of players entered multiplied by fee per player. You will be paid after the session takes place.</Text></Text>
          :Math.max(0,Number(this.props.navigation.getParam('data').price.joiningFee)-Number(this.props.totalWallet)) != 0?
          <Text style={[styleApp.title,{fontSize:13}]}>Reminder • <Text style={{fontFamily:'OpenSans-Regular'}}>We will charge the entry fee at the point of joining the event. No refunds unless your spot can be filled with an alternate player.</Text></Text>
          :null
          }

          </View>
        </View>
        :null
        }


      </View>
    )
  }
  textButtonConfirm() {
    if (this.coach()) return 'Confirm attendance'
    if (Math.max(0,Number(this.props.navigation.getParam('data').price.joiningFee)-Number(this.props.totalWallet)) == 0) return 'Confirm attendance'
    return 'Pay & Confirm attendance'
  }
  async checkAttendingEvent (userID,eventID) {
    var event = await firebase.database().ref('/usersEvents/' + userID + '/' + eventID).once('value')
    event = event.val()
    if (event == null) return true
    return false
  }
  coach() {
    return !this.props.navigation.getParam('coach').player
  }
  openAlert(organizer) {
    if (organizer == this.props.userID) {
      return this.props.navigation.navigate('Alert',{close:true,title:'You are the organizer of this event.',subtitle:'You cannot attend your own event.',textButton:'Got it!',onGoBack:() => this.props.navigation.navigate('Checkout')})
    }
    return this.props.navigation.navigate('Alert',{close:true,title:'You are already attending this event.',textButton:'Got it!',onGoBack:() => this.props.navigation.navigate('Checkout')})
  }
  async submit(data) {
    await this.setState({loader:true})
    // var check = await this.checkAttendingEvent(this.props.userID,data.eventID) 
    var check = true
    if (!check) {
      await this.setState({loader:false})
      return this.openAlert(data.info.organizer) 
    }
    var now = (new Date()).toString()
    var {message,response} = await this.payEntryFee(now,data)
    
    if (response == false) {
      await this.setState({loader:false})
      return this.props.navigation.navigate('Alert',{close:true,title:message,textButton:'Got it!',onGoBack:() => this.props.navigation.navigate('Checkout')})
    } else if (response == 'cancel') return true

    if (!data.info.public && this.coach()) {
      var newLevel = data.info.levelFilter
      if (data.info.levelOption == 'max' || newLevel == 0) {
        newLevel = 1
      }
      await firebase.database().ref('users/' + this.props.userID + '/level/').update({
        [data.info.sport]:newLevel
      })
    }
    var pushSection = 'attendees'
    if (this.coach()) pushSection = 'coaches'
    var user = {
      captainInfo:{
        phoneNumber:this.props.infoUser.countryCode + this.props.infoUser.phoneNumber,
        userID:this.props.userID,
        name:this.props.infoUser.firstname  + ' ' + this.props.infoUser.lastname,
        level:this.props.level == undefined?'':this.props.level[data.info.sport] == undefined?'':this.props.level[data.info.sport],
        picture:this.props.infoUser.picture == undefined?'':this.props.infoUser.picture,
      },
      coach:this.coach(),
      status:this.status(data),
      date:now,
    }
    const pushNewTeam = await firebase.database().ref('events/' + data.eventID + '/' + pushSection).push(user)
    await firebase.database().ref('events/' + data.eventID + '/'+pushSection+'/' + pushNewTeam.key).update({
      teamID:pushNewTeam.key
    })
    var event = {
      ...data,
      [pushSection]:{
        ...data[pushSection],
        [pushNewTeam.key]:{
          ...user,
          teamID:pushNewTeam.key
        }
      }
    }
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      await firebase.messaging().subscribeToTopic(this.props.userID)
      await firebase.messaging().subscribeToTopic('all')
      await firebase.messaging().subscribeToTopic(data.eventID)
    } catch (error) {
        // User has rejected permissions
    }
    var futureEvents = this.props.futureEvents.slice(0).reverse()
    futureEvents.push(event)
    futureEvents = futureEvents.reverse()
    await  this.props.eventsAction('setFutureUserEvents',futureEvents)
    this.props.navigation.navigate('Event',{data:event});
  }
  status(data) {
    if (this.coach()) return 'pending'
    if (!data.info.public) return 'confirmed'
    if (data.info.levelFilter == undefined) return 'confirmed'
    if (this.props.level == undefined) return 'pending'
    if (this.props.level[data.info.sport] == undefined) return 'pending'
    var levelOption = data.info.levelOption
    var levelFilter = data.info.levelFilter
    var userLevel = this.props.level[data.info.sport]
    if (levelOption == 'equal' && userLevel == levelFilter) return 'confirmed'
    else if (levelOption == 'min' && userLevel >= levelFilter) return 'confirmed'
    else if (levelOption == 'max' && userLevel <= levelFilter) return 'confirmed'
    return 'pending'
  }
  async payEntryFee(now,data) {  
    var cardID = ''

    if (this.coach()) return {response:true,message:''}
    if (Math.max(0,Number(data.price.joiningFee)-Number(this.props.totalWallet)) != 0) {
      cardID = this.props.defaultCard.id
    }
    if (Math.max(0,Number(data.price.joiningFee)-Number(this.props.totalWallet)) != 0 && cardID == 'applePay') {
      try {
        this.setState({loader:false})
        const items = [{
          label: 'GameFare',
          amount: Math.max(0,Number(data.price.joiningFee)-Number(this.props.totalWallet)).toFixed(2),
        }]
        const token = await stripe.paymentRequestWithApplePay(items,options)
        var tokenCard = token.tokenId
        
        var url = 'https://us-central1-getplayd.cloudfunctions.net/addUserCreditCard'
        const promiseAxios = await axios.get(url, {
          params: {
            tokenCard: tokenCard,
            userID: this.props.userID,
            tokenStripeCus: this.props.tokenCusStripe,
            name:this.props.infoUser.firstname  + ' ' + this.props.infoUser.lastname,
            email:this.props.infoUser.email == undefined?'':this.props.infoUser.email,
            brand: this.props.defaultCard.brand
          }
        })
        if (promiseAxios.data.response == false) {
          stripe.cancelApplePayRequest()
        } else {
          cardID =  promiseAxios.data.cardID
          await this.setState({loader:true})
          await stripe.completeApplePayRequest()
        }
      } catch (err) {
        console.log('error')
        console.log(err)
        // return  {response:false,message:err.toString()}
        await this.setState({loader:false})
        stripe.cancelApplePayRequest()
        return  {response:'cancel'}
      }
    }
    if (Number(this.props.navigation.getParam('data').price.joiningFee) != 0) {
      try {
        var url = 'https://us-central1-getplayd.cloudfunctions.net/payEntryFee'
        const promiseAxios = await axios.get(url, {
          params: {
            cardID: cardID,
            now:now,
            userID: this.props.userID,
            tokenCusStripe: this.props.tokenCusStripe,
            currentUserWallet:Number(this.props.totalWallet),
            amount:data.price.joiningFee,
            eventID:data.eventID
          }
        })

        if (promiseAxios.data.response == false) return {response:false,message:promiseAxios.data.message}
        return {response:true,message:''}
      }catch (err) {
        return {response:false,message:err.toString()}
      }
    }
    return {response:true,message:''}
  }
  conditionOn () {
    if (Math.max(0,Number(this.props.navigation.getParam('data').price.joiningFee)-Number(this.props.totalWallet)) != 0 && this.props.defaultCard == undefined) return false
    return true
  }
  render() {
    return (
      <View style={[styleApp.stylePage,{borderLeftWidth:1}]}>
        <HeaderBackButton 
            AnimatedHeaderValue={this.AnimatedHeaderValue}
            textHeader={''}
            inputRange={[5,10]}
            initialBorderColorIcon={'white'}
            initialBackgroundColor={'white'}

            icon1='arrow-left'
            initialTitleOpacity={1}
            icon2={null}
            clickButton1={() => this.props.navigation.goBack()} 
        />

        <ScrollView 
        AnimatedHeaderValue={this.AnimatedHeaderValue}
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.checkout(this.props.navigation.getParam('data'))}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={sizes.heightFooterBooking+90}
          showsVerticalScrollIndicator={false}
        />
        <View style={styleApp.footerBooking}>
        {
          this.props.userConnected?
          <Button
          icon={'next'} 
          backgroundColor='green'
          onPressColor={colors.greenClick}
          styleButton={{marginLeft:20,width:width-40}}
          enabled={true} 
          disabled={!this.conditionOn()}
          text={this.textButtonConfirm()}
          loader={this.state.loader} 
          click={() => this.submit(this.props.navigation.getParam('data'))}
         />
         :
         <Button
          icon={'next'} 
          backgroundColor='green'
          onPressColor={colors.greenClick}
          styleButton={{marginLeft:20,width:width-40}}
          enabled={true} 
          text='Sign in to proceed'
          loader={false} 
          click={() => this.props.navigation.navigate('SignIn',{pageFrom:'Checkout'})}
         />
        }
         </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
});

const  mapStateToProps = state => {
  return {
    userID:state.user.userID,
    userConnected:state.user.userConnected,
    infoUser:state.user.infoUser.userInfo,
    sports:state.globaleVariables.sports.list,
    level:state.user.infoUser.level,
    totalWallet:state.user.infoUser.wallet.totalWallet,
    defaultCard:state.user.infoUser.wallet.defaultCard,
    tokenCusStripe:state.user.infoUser.wallet.tokenCusStripe,
    futureEvents:state.events.futureUserEvents,
  };
};

export default connect(mapStateToProps,{userAction,eventsAction})(ProfilePage);
