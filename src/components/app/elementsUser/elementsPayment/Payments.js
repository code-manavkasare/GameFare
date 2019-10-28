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
        <TouchableOpacity style={{paddingLeft:15}} onPress={() => navigation.navigate(navigation.getParam('pageFrom'))}>
          <AllIcons name='angle-down' color={'white'} size={23} type='font' />
        </TouchableOpacity>
      ),
    }
  };
  async componentDidMount() {
    console.log('payments mount')
    console.log(this.props.navigation.getParam())
  }
  row(icon,text,data){
    console.log('cest ici meme')
    return (
      <TouchableOpacity activeOpacity={0.7} style={{height:50,borderBottomWidth:1,borderColor:colors.off}} onPress={() => this.openPage(data)}>
        <Row>
          <Col size={15} style={styleApp.center2}>
            {icon}
          </Col>
          <Col size={65} style={styleApp.center2}>
            <Text style={styleApp.text}>{text}</Text>
          </Col>
          {
            data!= 'new'?
            <Col size={10} style={styleApp.center3}>
            { 
              this.props.defaultCard.id == data.id?
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
            <AllIcons name='angle-right' color={colors.title} type="font" size={16}/>
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

        {this.listCard()}

        {this.row(cardIcon('default'),'New payment method','new')}
      </View>
    )      
  }
  render() {
    return (
      <View style={{backgroundColor:'white',flex:1 }}>
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

