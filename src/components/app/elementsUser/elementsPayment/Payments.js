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

import sizes from '../../../style/sizes'
import styleApp from '../../../style/style'
import colors from '../../../style/colors';
import BackButton from '../../../layout/buttons/BackButton'
import {cardIcon} from './iconCard'

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
      title: 'Payments',
      headerStyle:styleApp.styleHeader,
      headerTitleStyle: styleApp.textHeader,
      headerLeft: () => (
        <BackButton name='close' color={colors.title} size={19} type='mat' click={() => navigation.navigate(navigation.getParam('pageFrom'))} />
      ),
    }
  };
  async componentDidMount() {
    console.log('payments mount')
    console.log(this.props.navigation.getParam())
  }
  row(icon,text,data){
    console.log('cest ici meme')
    console.log(data)
    console.log(this.props.defaultCard)
    return (
      <TouchableOpacity activeOpacity={0.7} style={{height:50,borderBottomWidth:0.3,borderColor:colors.borderColor,marginLeft:-20,width:width,backgroundColor:'white',}} onPress={() => this.openPage(data)}>
        <Row style={{marginLeft:20,width:width-40}}>
          <Col size={15} style={styleApp.center2}>
            {icon}
          </Col>
          <Col size={65} style={styleApp.center2}>
            <Text style={[styleApp.text,{fontFamily:'OpenSans-Regular',fontSize:14}]}>{text}</Text>
          </Col>
          {
            data!= 'new'?
            <Col size={10} style={styleApp.center3}>
            { 
              this.props.defaultCard == undefined?null
              :this.props.defaultCard.id == data.id?
              <View style={styles.defaultView}>
                <Text style={styles.textDefault}>D</Text>
              </View>
              :null
            }
          </Col>
          :
          <Col size={10} ></Col>
          }
          
          <Col size={10} style={styleApp.center3}>
          <AllIcons type='mat' size={20} name={'keyboard-arrow-right'} color={colors.title} /> 
          </Col>
        </Row>
      </TouchableOpacity>
    )
  } 
  openPage(data) {
    console.log('openpage')
    console.log(data)
    if (data == 'new') {
      return this.props.navigation.navigate('NewMethod',{pageFrom:this.props.navigation.getParam('pageFrom')})
    } else if (data == 'bank') {
      return this.props.navigation.navigate('Alert',{textButton:'Close',title:'Coming soon!',close:true,onGoBack:() => this.props.navigation.navigate('Payments')})
    }
    return this.props.navigation.navigate('DetailCard',{pageFrom:this.props.navigation.getParam('pageFrom'),data:data})
  }
  listCard() {
    console.log('this.props.cards')
    console.log(this.props.cards)
    if (this.props.cards == undefined) return null
    return Object.values(this.props.cards).map((card,i) => (
      this.row(cardIcon(card.brand),card.brand == 'applePay'?'Apple Pay':'•••• ' + card.last4,card)
    ))
    
  }
  payments() {
    return (
      <View style={{marginTop:0}}>
        <Text style={[styleApp.title,{marginBottom:20,fontSize:19}]}>Payment methods</Text>

        <View style={{height:0.3,backgroundColor:colors.borderColor,marginLeft:-20,width:width}} />
        {this.listCard()}
        {this.row(cardIcon('default'),'New payment method','new')}

        <Text style={[styleApp.title,{marginBottom:20,fontSize:19,marginTop:30}]}>Bank Accounts</Text>

        <View style={{height:0.3,backgroundColor:colors.borderColor,marginLeft:-20,width:width}} />
        {this.row(cardIcon('bank'),'Link bank account','bank')}
      </View>
    )      
  }
  render() {
    return (
      <View style={[styleApp.stylePage,{backgroundColor:colors.off2}]}>
        <ScrollView 
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
  defaultView:{
    backgroundColor:colors.greenLight,
    borderRadius:12.5,
    height:25,
    width:25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textDefault:{
    color:colors.greenStrong,
    fontSize:12,
    fontFamily: 'OpenSans-Bold',
  },
});

const  mapStateToProps = state => {
  return {
    userID:state.user.userID,
    defaultCard:state.user.infoUser.wallet.defaultCard,
    cards:state.user.infoUser.wallet.cards
  };
};

export default connect(mapStateToProps,{})(ListEvent);

