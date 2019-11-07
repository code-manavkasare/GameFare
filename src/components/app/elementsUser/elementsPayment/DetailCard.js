import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,TextInput,
    Animated
} from 'react-native';
import {connect} from 'react-redux';
const { height, width } = Dimensions.get('screen')
import firebase from 'react-native-firebase'
import { Col, Row, Grid } from "react-native-easy-grid";
import AllIcons from '../../../layout/icons/AllIcons'
import Header from '../../../layout/headers/HeaderButton'
import ScrollView from '../../../layout/scrollViews/ScrollView'
import BackButton from '../../../layout/buttons/BackButton'

import sizes from '../../../style/sizes'
import styleApp from '../../../style/style'
import colors from '../../../style/colors';
import {cardIcon} from './iconCard'
import axios from 'axios'

class ListEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialLoader:true,
      events:[]
    };
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('data').brand == 'applePay'?'Apple Pay':navigation.getParam('data').brand ,
      headerStyle:styleApp.styleHeader,
      headerTitleStyle: styleApp.textHeader,
      headerLeft: () => (
        <BackButton color={colors.title} name='keyboard-arrow-left' type='mat' click={() => navigation.goBack()} />
      ),
    }
  };
  async componentDidMount() {
    console.log('lalalalalalaa')
    console.log(this.props.navigation.getParam('data'))
  }
  rowCB(){
    return (
      <TouchableOpacity activeOpacity={0.7} style={{height:50,marginBottom:20}} onPress={() => this.action(data)}>
        <Row>
          <Col size={15} style={styleApp.center2}>
            {cardIcon(this.props.navigation.getParam('data').brand)}
          </Col>
          <Col size={60} style={styleApp.center2}>
            <Text style={styleApp.text}>{this.props.navigation.getParam('data').brand == 'applePay'?'Apple Pay':'•••• ' + this.props.navigation.getParam('data').last4 + '    ' + this.props.navigation.getParam('data').exp_month+'/'+ this.props.navigation.getParam('data').exp_year}</Text>
          </Col>
          <Col size={25} style={styleApp.center3}>
            {
            this.props.defaultCard == undefined?null
            :this.props.navigation.getParam('data').id == this.props.defaultCard.id?
            <View style={styleApp.viewSport}>
              <Text style={[styleApp.textSport,{fontSize:12}]}>Default</Text>
            </View>
            :null
            }
          </Col>
        </Row>
      </TouchableOpacity>
    )
  }
  row(icon,text,data){
    return (
      <TouchableOpacity activeOpacity={0.7} style={{height:50,borderBottomWidth:0.3,borderColor:colors.borderColor,marginLeft:-20,width:width,backgroundColor:'white'}} onPress={() => this.action(data)}>
        <Row style={{width:width-40,marginLeft:20}}>
          <Col size={15} style={styleApp.center2}>
            <AllIcons name={icon} color={colors.title} size={18} type='font' />
          </Col>
          <Col size={75} style={styleApp.center2}>
            <Text style={[styleApp.text,{fontFamily:'OpenSans-Regular',fontSize:14}]}>{text}</Text>
          </Col>
          <Col size={10} style={styleApp.center}>
          <AllIcons type='mat' size={20} name={'keyboard-arrow-right'} color={colors.title} /> 
          </Col>
        </Row>
      </TouchableOpacity>
    )
  }
  async action(data) {
    if (data == 'delete') {
      this.props.navigation.navigate('Alert',{title:'Do you want to delete this payment method?',subtitle:this.props.navigation.getParam('data').brand == 'applePay'?'Apple Pay':'•••• ' + this.props.navigation.getParam('data').last4 + '    ' + this.props.navigation.getParam('data').exp_month+'/'+ this.props.navigation.getParam('data').exp_year,textButton:'Delete',onGoBack:() => this.confirmDelete()})
    } else {
      if (this.props.navigation.getParam('data').id == this.props.defaultCard.id) {
        return this.props.navigation.goBack()
      } else {
        await firebase.database().ref('users/' + this.props.userID + '/wallet/defaultCard/').update(this.props.navigation.getParam('data'))
        return this.props.navigation.goBack()
      }
    }
  }
  async confirmDelete() {
    // delete card
    this.setState({loader:true})
    console.log(this.props.navigation.getParam('data').id)
    var url = 'https://us-central1-getplayd.cloudfunctions.net/deleteUserCreditCard'
    const results = await axios.get(url, {
      params: {
        CardID: this.props.navigation.getParam('data').id,
        userID: this.props.userID,
        tokenStripeCus: this.props.tokenCusStripe,
      }
    })
    if (results.data.response == true) {
      console.log('lllllllll')
      console.log(this.props.cards)
      console.log(Object.values(this.props.cards)[0])
      console.log(this.props.defaultCard.id)
      console.log(this.props.navigation.getParam('data').id)
      if (this.props.cards == undefined) {
        await firebase.database().ref('users/' + this.props.userID + '/wallet/defaultCard/').remove()
      } else if (this.props.navigation.getParam('data').id == this.props.defaultCard.id && Object.values(this.props.cards).length > 0) {
        await firebase.database().ref('users/' + this.props.userID + '/wallet/defaultCard/').update(Object.values(this.props.cards)[0])
      } else if (this.props.navigation.getParam('data').id == this.props.defaultCard.id) {
        await firebase.database().ref('users/' + this.props.userID + '/wallet/defaultCard/').remove()
      }
      this.props.navigation.navigate('Payments')
    } else {
      this.props.navigation.navigate('Payments')
    }
  }
  payments() {
    return (
      <View style={{marginTop:0}}>

        {this.rowCB()}

        <View style={{height:0.3,backgroundColor:colors.borderColor,marginLeft:-20,width:width}} />
        {this.row('check','Set as default','set')}
        {this.row('trash-alt','Delete payment method','delete')}
      </View>
    )      
  }
  render() {
    return (
      <View style={[styleApp.stylePage,{backgroundColor:colors.off2,borderLeftWidth:1}]}>
        <ScrollView 
          // style={{marginTop:sizes.heightHeaderHome}}
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.payments.bind(this)}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={90+60}
          showsVerticalScrollIndicator={true}
        />

      </View>
    );
  }
}

const styles = StyleSheet.create({

});

const  mapStateToProps = state => {
  return {
    userID:state.user.userID,
    defaultCard:state.user.infoUser.wallet.defaultCard,
    cards:state.user.infoUser.wallet.cards,
    tokenCusStripe:state.user.infoUser.wallet.tokenCusStripe
  };
};

export default connect(mapStateToProps,{})(ListEvent);

