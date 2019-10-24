import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Animated,
  TouchableOpacity,

  Dimensions,
  Image,
} from 'react-native';
import {Grid,Row,Col} from 'react-native-easy-grid';


import styleApp from '../../style/style'
import Loader from '../loaders/Loader'
import FontIcon from 'react-native-vector-icons/FontAwesome5';
const AnimatedIcon = Animated.createAnimatedComponent(FontIcon)
const { height, width } = Dimensions.get('screen')


export default class HeaderButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
      }
    async close () {      
      console.log('close en cour')
      this.props.close()
    }

  render() {
    return ( 
      <Animated.View style={styleApp.headerBooking}>
        <Row style={{height:50,borderBottomWidth:0,borderColor:this.props.borderColor}}>
          <Col size={15} style={[styles.center2,{paddingLeft:10,}]} activeOpacity={0.4} onPress={() => this.close()} >
            {
              this.props.icon!= ''?
              <FontIcon size={23} name={this.props.icon} color={'#092642'} /> 
              :null
            }
              
          </Col>
          <Col size={70} style={styles.center}>
            <Text style={styles.text}>{this.props.title}</Text>
          </Col>      
          <Col size={15} style={[styles.center2,{alignItems: 'flex-end',paddingRight:20,}]}>
            {
              this.props.loader?
              <Loader size={20} color='primary'/>
              :null
            }
          </Col>  
        </Row>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  center:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2:{
    justifyContent: 'center',
  },
  text:{
    fontSize:15,
    fontFamily:'OpenSans-Bold',
    color:'#092642'
  },
  lineOff:{
    height:1,
    width:'80%',
    backgroundColor:'#eaeaea'
  },
});


