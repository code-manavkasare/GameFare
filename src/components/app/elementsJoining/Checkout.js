import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Linking
} from 'react-native';
import {connect} from 'react-redux';
const { height, width } = Dimensions.get('screen')

import Header from '../../layout/headers/HeaderButton'
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

import InAppBrowser from 'react-native-inappbrowser-reborn'
import Communications from 'react-native-communications';

class ProfilePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader:false,
    };
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Join ' +navigation.getParam('data').info.name,
      headerStyle: {
          backgroundColor: colors.primary,
          borderBottomWidth:0
      },
      headerTitleStyle: {
          color:'white',
          fontFamily:'OpenSans-Bold',
          fontSize:14,
      },
      headerLeft: () => (
        <TouchableOpacity style={{paddingLeft:15}} onPress={() => navigation.goBack()}>
          <AllIcons name='angle-left' color={'white'} size={23} type='font' />
        </TouchableOpacity>
      ),
    }
  };
  componentDidMount() {
    console.log('checkout mount')
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
          <AllIcons name={icon} color={colors.grey} size={20} type='font' />
        </Col>
        <Col size={90} style={styleApp.center2}>
          {component}
        </Col>
      </Row>
    )
  }
  title(text) {
    return <Text style={[styleApp.title,{fontSize:16,fontFamily:'OpenSans-Regular'}]}>{text}</Text>
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
  sport() {
    return <Row>
      <Col size={80} style={styleApp.center2}>
        <Text style={styleApp.title}>{this.props.navigation.getParam('data').info.name}</Text>
      </Col>
      <Col size={20} style={styleApp.center3}>
      <View style={styles.viewSport}>
        <Text style={styles.textSport}>{this.props.navigation.getParam('data').info.sport.charAt(0).toUpperCase() + this.props.navigation.getParam('data').info.sport.slice(1)}</Text>
      </View>
      </Col>
    </Row>
  }
  creditCard () {
    return (
      <View>
        <CardCreditCard navigate={(val,data) => this.props.navigation.navigate(val,data)}/>
        <View style={[styleApp.divider,{marginBottom:20}]} />
      </View>
    )
  }
  profile() {
    return (
      <View>
        {this.sport()}
        
        {this.rowIcon(this.dateTime(this.props.navigation.getParam('data').date.start,this.props.navigation.getParam('data').date.end),'calendar-alt')}
        {this.rowIcon(this.title(this.props.navigation.getParam('data').location.area),'map-marker-alt')}
        {this.rowIcon(this.title(this.props.navigation.getParam('data').info.maxAttendance + ' people'),'user-check')}
        
        <View style={[styleApp.divider,{marginBottom:10,marginTop:20}]} />

        {this.rowText('Entry fee',colors.title,'OpenSans-SemiBold',Number(this.props.navigation.getParam('data').price.joiningFee)==0?'Free':'$' +this.props.navigation.getParam('data').price.joiningFee)}

        {
          this.props.userConnected?
          this.rowText('Credits',colors.green,'OpenSans-SemiBold','$' +this.props.totalWallet)
          :null
        }

        <View style={[styleApp.divider,{marginBottom:10,marginTop:10}]} />

        {
          this.props.userConnected?
          this.rowText('Charge amount',colors.title,'OpenSans-Bold','$' +Math.max(0,Number(this.props.navigation.getParam('data').price.joiningFee)-Number(this.props.totalWallet)))
          :
          this.rowText('Estimated charge',colors.title,'OpenSans-Bold','$' +Number(this.props.navigation.getParam('data').price.joiningFee))
        }

        <View style={[styleApp.divider,{marginBottom:10,marginTop:10}]} />

        {
          this.props.userConnected?
          this.creditCard()
          :null
        }

        <Text style={[styleApp.title,{fontSize:13}]}>Reminder • <Text style={{fontFamily:'OpenSans-Regular'}}>We will charge $ your attendees once they join the event. You will receive your pay after the event once you checkout.</Text></Text>
      </View>
    )
  }
  textButtonConfirm() {
    if (Number(this.props.navigation.getParam('data').price.joiningFee)==0) return 'Confirm attendance'
    return 'Pay & Confirm attendance'
  }
  async submit(data) {
    await this.setState({loader:true})
  }
  conditionOn () {
    if (this.props.defaultCard == undefined) return false
    return true
  }
  render() {
    return (
      <View style={{ flex: 1,backgroundColor:'white' }}>
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.profile()}
          marginBottomScrollView={0}
          marginTop={0}
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
  viewSport:{
    backgroundColor:colors.greenLight,
    borderRadius:3,
    paddingLeft:10,
    paddingRight:10,
    height:25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSport:{
    color:colors.greenStrong,
    fontSize:13,
    fontFamily: 'OpenSans-SemiBold',
  },
});

const  mapStateToProps = state => {
  return {
    userID:state.user.userID,
    userConnected:state.user.userConnected,
    totalWallet:state.user.infoUser.wallet.totalWallet,
    defaultCard:state.user.infoUser.wallet.defaultCard
  };
};

export default connect(mapStateToProps,{userAction})(ProfilePage);
