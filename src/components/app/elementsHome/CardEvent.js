
import React, { Component,PureComponent } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Image,
  ScrollView,
  View
} from 'react-native';

import { Col, Row, Grid } from "react-native-easy-grid";
// import {Fonts} from '../../../../utils/Font'
import colors from '../../style/colors'
import Icon from '../../layout/icons/icons'
import AllIcons from '../../layout/icons/AllIcons'
import styleApp from '../../style/style'

var  { height, width } = Dimensions.get('screen')
import {date,time,timeZone} from '../../layout/date/date'

export default class CardEvent extends React.Component {
    async clickProduct () {
      console.log('this.props.category')
      console.log(this.props.item)
      this.props.navigate('Event',{eventID:this.props.item.objectID})
    }
    entreeFee(entreeFee) {
      if (entreeFee == 0) return 'Free'
      return '$' + entreeFee 
    }
  render() {
    return (
      <Animated.View style={[styles.cardList]}>
        
        <TouchableOpacity 
          onPress={() => {this.clickProduct()}} 
          style={{height:'100%',width:width-40,marginLeft:20,paddingTop:15}} 
          activeOpacity={1} 
        >
          <View style={styles.viewSport}>
            <Text style={styles.textSport}>{this.props.item.info.sport.charAt(0).toUpperCase() + this.props.item.info.sport.slice(1)}</Text>
          </View>
          <Text style={styles.title}>{this.props.item.info.name}</Text>
          <Row style={{marginTop:5,marginBottom:15}}>
            <Col style={[styles.center2,{paddingTop:10,paddingBottom:10}]} size={80}>
              <Row style={{marginBottom:5}}>
                <Col size={10} style={styles.center2}>
                  <AllIcons name="map-marker-alt" size={15} color={colors.grey} type='font' />
                </Col> 
                <Col size={90} style={styles.center2}>
                  <Text style={styles.subtitle}>{this.props.item.location.area}</Text>
                </Col> 
              </Row>

              <Row style={{paddingBottom:5}}>
                <Col size={10} style={styles.center2}>
                  <AllIcons name="calendar-alt" size={15} color={colors.grey} type='font' />
                </Col> 
                <Col size={90} style={styles.center2}>
                  <Text style={styles.subtitle}>{date(this.props.item.date.start,'ddd, Do MMM')}</Text>
                </Col> 
              </Row>

              <Row>
                <Col size={10} style={styles.center2}>
                  <AllIcons name="user-check" size={15} color={colors.grey} type='font' />
                </Col> 
                <Col size={90} style={styles.center2}>
                  <Text style={styles.subtitle}>{this.props.item.info.maxAttendance} people</Text>
                </Col> 
              </Row>
            </Col>
            <Col style={styleApp.center3} size={20}>
              <Text style={styles.textPrice}>{this.entreeFee(this.props.item.price.joiningFee)}</Text>
            </Col>
          </Row>

        </TouchableOpacity>

      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  cardList:{
    flex:1,
    marginTop:0,
    //width: '48%',
    width:width,
    marginLeft:-20,
    // aspectRatio: 1,
    backgroundColor:'white',  
    borderTopWidth: 1,
    //transform:[{scaleX:1,scaleY:1}],
    borderColor:'#eaeaea',
  },
  center:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2:{
    //alignItems: 'center',
    justifyContent: 'center',
  },
  viewSport:{
    position:'absolute',
    backgroundColor:colors.greenLight,
    borderRadius:3,
    paddingLeft:10,
    paddingRight:10,
    top:15,
    right:0,
    height:25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSport:{
    color:colors.greenStrong,
    fontSize:13,
    fontFamily: 'OpenSans-SemiBold',
  },
  textPrice:{
    color:colors.primary,
    fontSize:18,
    fontFamily: 'OpenSans-Bold',
  },
  title:{
    color:colors.title,
    fontSize:17,
    fontFamily: 'OpenSans-SemiBold',
  },
  subtitle:{
    color:colors.title,
    fontSize:13,
    fontFamily: 'OpenSans-Light',
  },
});



