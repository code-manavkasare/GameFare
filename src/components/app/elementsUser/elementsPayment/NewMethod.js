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
      title: 'New method',
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
  async componentDidMount() {

  }
  row(icon,text,page,data){
    return (
      <TouchableOpacity activeOpacity={0.7} style={{height:50,borderBottomWidth:1,borderColor:colors.off}} onPress={() => this.props.navigation.navigate(page,data)}>
        <Row>
          <Col size={15} style={styleApp.center2}>
            {icon}
          </Col>
          <Col size={75} style={styleApp.center2}>
            <Text style={styleApp.text}>{text}</Text>
          </Col>
          <Col size={10} style={styleApp.center}>
            <AllIcons name='angle-right' color={colors.title} type="font" size={16}/>
          </Col>
        </Row>
      </TouchableOpacity>
    )
  } 
  payments() {
    return (
      <View style={{marginTop:0}}>
        <Text style={[styleApp.title,{marginBottom:20}]}>New payment method</Text>

        {this.row(cardIcon('default'),'Credit/Debit card','NewCard',{pageFrom:this.props.navigation.getParam('pageFrom')})}
        {this.row(cardIcon('applePay'),'Apple Pay','ApplePay',{pageFrom:this.props.navigation.getParam('pageFrom')})}
      </View>
    )      
  }
  render() {
    return (
      <View style={{backgroundColor:'white',flex:1 }}>

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
    cards:state.user.infoUser.wallet.cards
  };
};

export default connect(mapStateToProps,{})(ListEvent);

