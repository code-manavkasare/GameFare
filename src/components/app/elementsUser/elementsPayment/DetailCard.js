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
  async componentDidMount() {

  }
  rowCB(){
    return (
      <TouchableOpacity activeOpacity={0.7} style={{height:50,marginBottom:20}} onPress={() => this.action(data)}>
        <Row>
          <Col size={15} style={styleApp.center2}>
            {cardIcon(this.props.navigation.getParam('data').brand)}
          </Col>
          <Col size={75} style={styleApp.center2}>
            <Text style={styleApp.text}>{'•••• ' + this.props.navigation.getParam('data').last4}</Text>
          </Col>
        </Row>
      </TouchableOpacity>
    )
  }
  row(icon,text,data){
    return (
      <TouchableOpacity activeOpacity={0.7} style={{height:50,borderBottomWidth:1,borderColor:colors.off}} onPress={() => this.action(data)}>
        <Row>
          <Col size={15} style={styleApp.center2}>
            <AllIcons name={icon} color={colors.title} size={18} type='font' />
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
  action(data) {
    if (data == 'delete') {
      this.props.navigation.navigate('Alert',{title:'Do you want to delete this payment method?',subtitle:'•••• ' +this.props.navigation.getParam('data').last4,textButton:'Delete',onGoBack:() => this.confirmDelete()})
    }
  }
  confirmDelete() {
    // delete card
    this.props.navigation.navigate('DetailCard')
  }
  payments() {
    return (
      <View style={{marginTop:0}}>

        {this.rowCB()}

        {this.row('check','Set as default','set')}
        {this.row('trash-alt','Delete payment method','delete')}
      </View>
    )      
  }
  render() {
    return (
      <View style={{backgroundColor:'white',height:height }}>
        <Header
        onRef={ref => (this.headerRef = ref)}
        title={this.props.navigation.getParam('data').brand}
        icon={'angle-left'}
        iconRight={''}
        typeIconRight='font'
        clickIconRight={() => this.props.navigation.goBack()}
        close={() => this.props.navigation.goBack()}
        />
        <ScrollView 
          // style={{marginTop:sizes.heightHeaderHome}}
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.payments.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
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

