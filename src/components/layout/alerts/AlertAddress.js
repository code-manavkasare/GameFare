import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Easing,
  Animated,
  View,
  Clipboard,
  Image
} from 'react-native';

import { Col, Row, Grid } from "react-native-easy-grid";
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import Button from '../buttons/Button'
import colors from '../../style/colors';
import AllIcons from '../../layout/icons/AllIcons'
import styleApp from '../../style/style';
import openMap from 'react-native-open-maps';

const { height, width } = Dimensions.get('screen')
var bottomAlert = -20
var marginBottomSubmit=10
if (Platform.OS == 'ios') {
  bottomAlert = 0
  marginBottomSubmit=10
  if (height == 812) {
    bottomAlert = -20
    marginBottomSubmit=35
  } else if (height == 896) {
    bottomAlert = -20
    marginBottomSubmit=35
  }
  
}

export default class Alert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step:1,
      loader: false
    };
    this.componentWillMount = this.componentWillMount.bind(this);
  }
  componentWillMount(){    
  }
  title() {
    return <Text style={[styleApp.title,{fontSize:18,fontFamily:'OpenSans-SemiBold'}]}>{this.props.navigation.getParam('data').address}</Text>
  }
  clickCar2(val) {
    var address = this.props.navigation.getParam('data').address
    console.log('address')
    console.log(address)
    console.log(this.props.navigation.getParam('data'))
    const linkProps = { 
      //latitude: this.props.navigation.getParam('data').lat,
      //longitude: this.props.navigation.getParam('data').lng,
      query: address,
      travelType:'drive',
      navigate_mode:'navigate'
    }
    console.log(linkProps)
    if (val == 'google') {
      linkProps.provider = 'google'
      openMap(linkProps);
      this.props.navigation.goBack()
    } else if (val == 'apple') {
      linkProps.provider = 'apple'
      openMap(linkProps);
      this.props.navigation.goBack()
    }else if (val == 'copy') {
      Clipboard.setString(this.props.navigation.getParam('data').address)
      this.props.navigation.goBack()
    }
  }
  render() {  
    return (
      <View style={styles.viewModal}>
          <TouchableOpacity style={styles.buttonClose} activeOpacity={0.5} onPress={() => {this.props.navigation.goBack()}}>
            <MatIcon name="close" color={'#4a4a4a'} size={24} />
          </TouchableOpacity>



         <Row style={{flex:1,marginBottom:0,marginLeft:20,width:width-110,marginBottom:9,marginTop:20}}>
          <Col>
            {this.title()}
          </Col>
         </Row>

         <View style={styleApp.marginView}>
         {
             Platform.OS == 'ios'?
            <TouchableOpacity style={styleApp.cardSelect} activeOpacity={0.7} onPress={() => {this.clickCar2('apple')}}>
            <Row >
              <Col style={styles.center} size={20}> 
              <Image style={{width:23,height:23,}} source={require('../../../img/map/appleMap.png')} />
              </Col>  
              <Col style={styleApp.center2} size={80}> 
                <Text style={styles.text}>Open with Apple Maps</Text>
              </Col>  
            </Row>
          </TouchableOpacity >
            :null
           }
          <TouchableOpacity style={styleApp.cardSelect} activeOpacity={0.7} onPress={() => {this.clickCar2('google')}}>
            <Row >
              <Col style={styles.center} size={20}> 
              <Image style={{width:23,height:23,}} source={require('../../../img/map/googleMap.png')} />
              </Col>  
              <Col style={styleApp.center2} size={80}> 
                <Text style={styles.text}>Open with Google Maps</Text>
              </Col>  
            </Row>
          </TouchableOpacity >

          <TouchableOpacity style={styleApp.cardSelect} activeOpacity={0.7} onPress={() => {this.clickCar2('copy')}}>
            <Row >
              <Col style={styles.center} size={20}> 
              <Image style={{width:23,height:23,}} source={require('../../../img/map/document.png')} />
              </Col>  
              <Col style={styleApp.center2} size={80}> 
                <Text style={styles.text}>Copy the address</Text>
              </Col>  
            </Row>
          </TouchableOpacity >

        </View>

          <View style={styles.viewButton}>
            <Button backgroundColor={'green'} disabled={false} onPressColor={colors.greenClick}  text={'Close'} click={() => this.props.navigation.goBack()} loader={this.state.loader}/>
          </View>
      </View>  
    );
  }
}

const styles = StyleSheet.create({
  viewModal:{
    bottom:0,
    position:'absolute',
    flex:1,
    backgroundColor:'white',
    borderTopWidth:0.3,
    borderColor:colors.borderColor,
    width:width,
    shadowColor: colors.off,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    shadowOpacity: 0.5,
  },
  buttonClose:{
    position:'absolute',
    width:26,
    height:26,
    right:15,
    top:20,
    zIndex:30,

    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor:'#f6f6f6',
    borderRadius:13
  },
  viewIcon:{
    position:'absolute',
    width:26,
    height:26,
    right:55,
    top:20,
    zIndex:30,

    alignItems: 'center',
    justifyContent: 'center',
    //backgroundColor:'#f6f6f6',
    borderRadius:13
  },
  viewButton:{
    marginTop:25,
    marginLeft:20,
    marginBottom:marginBottomSubmit,
    alignItems: 'center',
    justifyContent: 'center',
    width:width-40,
    height:50,
  },
  text:{
    ...styleApp.text,
    fontFamily:'OpenSans-Regular'
  },
  center:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2:{
    // alignItems: 'center',
    justifyContent: 'center',
  },
});

