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
import ButtonColor from '../Views/Button'
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
      loader: false,

    };
    this.componentWillMount = this.componentWillMount.bind(this);
  }
  componentWillMount(){    
  }
  title() {
    return <Text style={[styleApp.title,{fontSize:16,fontFamily:'OpenSans-SemiBold'}]}>{this.props.navigation.getParam('title')}</Text>
  }
  async clickButton(val) {
    this.props.navigation.state.params.onGoBack(val)
    return this.props.navigation.goBack()
  }
  button(valClick,text,icon) {
    return (
      <ButtonColor view={() => {
        return <Row >
              <Col style={styles.center2} size={13}> 
                <AllIcons name={icon} type='font' color={colors.title} size={20} />
              </Col>  
              <Col style={styleApp.center2} size={77}> 
                <Text style={styles.text}>{text}</Text>
              </Col> 
              <Col size={10} style={styleApp.center3}>
                <AllIcons type='mat' name='keyboard-arrow-right' size={20} color={colors.title} />
              </Col>   
        </Row>
        }} 
        click={() => this.clickButton(valClick)}
        color='white'
        style={[{height:55,width:width,marginLeft:0,paddingLeft:20,paddingRight:20,borderTopWidth:0,borderColor:colors.off}]}
        onPressColor={colors.off}
    />
    )
  }
  render() {  
    // this.button('copy','Copy the address',<Image style={{width:23,height:23,}} source={require('../../../img/map/document.png')} />)
    return (
      <View style={styles.viewModal}>
          <TouchableOpacity style={styles.buttonClose} activeOpacity={0.5} onPress={() => {this.props.navigation.goBack()}}>
            <MatIcon name="close" color={'#4a4a4a'} size={24} />
          </TouchableOpacity>



         <Row style={{flex:1,marginBottom:0,marginLeft:20,width:width-110,marginBottom:29,marginTop:20}}>
          <Col>
            {this.title()}
          </Col>
         </Row>



         {this.button('take','Take Photo','camera')}

          {this.button('pick','Choose from Library','image')}



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
    fontFamily:'OpenSans-SemiBold',
    fontSize:13
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

