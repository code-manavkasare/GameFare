import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import {Grid,Row,Col} from 'react-native-easy-grid';

import colors from '../../style/colors'
import {timing,native} from '../../animations/animations'
import styleApp from '../../style/style'
import ButtonColor from '../Views/Button'

const { height, width } = Dimensions.get('screen')

export default class Switch extends Component {
    constructor(props) {
        super(props);
        this.state = {
          colorAnim1: new Animated.Value(this.props.state?1:0),
          colorAnim0: new Animated.Value(!this.props.state?1:0)
        };
        this.componentWillMount = this.componentWillMount.bind(this);
        this.translateXBorder = new Animated.Value(this.props.state?this.props.translateXTo:0)
        this.colorAnim1 = new Animated.Value(this.props.state?1:0)
        this.colorAnim0 = new Animated.Value(!this.props.state?1:0)
      }
    componentWillMount(){
    }
    styleTickFreeText(free,color) {
      if (free) return {
        ...styles.text,
        color:color,
        fontFamily:'OpenSans-SemiBold',
        // textDecorationLine: 'underline',

      }
      return {...styles.text,color:'#eaeaea'}
    }
    async changeValue(newVal) {
      var check = await this.props.setState(newVal)
      if (!check) return true
      if (newVal) {
        if (this.props.translateXComponent0 != undefined) {
          return Animated.parallel([
            Animated.spring(this.translateXBorder, native(newVal?this.props.translateXTo:0)),
            Animated.spring(this.state.colorAnim1, timing(1)),
            Animated.spring(this.state.colorAnim0, timing(0)),
            Animated.spring(this.props.translateXComponent0, native(-width)),
            Animated.spring(this.props.translateXComponent1, native(0)),
          ]).start()
        }
        return Animated.parallel([
          Animated.spring(this.translateXBorder, native(newVal?this.props.translateXTo:0)),
          Animated.spring(this.state.colorAnim1, timing(1)),
          Animated.spring(this.state.colorAnim0, timing(0)),
        ]).start()
        
      } else {
        if (this.props.translateXComponent0 != undefined) {
          return Animated.parallel([
            Animated.spring(this.translateXBorder, native(newVal?this.props.translateXTo:0)),
            Animated.spring(this.state.colorAnim1, timing(0)),
            Animated.spring(this.state.colorAnim0, timing(1)),
            Animated.spring(this.props.translateXComponent0, native(0)),
            Animated.spring(this.props.translateXComponent1, native(width)),
          ]).start()
        }

        return Animated.parallel([
          Animated.spring(this.translateXBorder, native(newVal?this.props.translateXTo:0)),
          Animated.spring(this.state.colorAnim1, timing(0)),
          Animated.spring(this.state.colorAnim0, timing(1)),
        ]).start()
      }
      
    }
    componentWillReceiveProps(nextProps) {
      if (nextProps.state != this.props.state) this.changeValue(nextProps.state)
    }
    styleButton(){
      if (this.props.color != undefined) return {...styles.button,backgroundColor:colors.green}
      return styles.button
    }
    borderStyle(state) {
      if (!state) return {borderTopLeftRadius:7,borderBottomLeftRadius:7,}
      return {borderTopRightRadius:7,borderBottomRightRadius:7,}
    }
  render() {
    var colorText1 = this.state.colorAnim1.interpolate({
      inputRange: [0, 1],
      outputRange: [this.props.color != undefined?colors.off:'#C7C7CC', this.props.color != undefined?'white':colors.green],
      extrapolate: 'clamp'
    });
    var colorText0 = this.state.colorAnim0.interpolate({
      inputRange: [0, 1],
      outputRange: [this.props.color != undefined?colors.off:'#C7C7CC', this.props.color != undefined?'white':colors.green],
      extrapolate: 'clamp'
    });
    return (
      <View style={{height:this.props.height,width:'100%',}}>
      <Row style={{borderRadius:7}}>
      <Col style={styles.center} >
          <ButtonColor view={() => {
                return <Animated.Text style={[styles.text,{color:colorText0}]}>{this.props.textOn}</Animated.Text>
              }}
              click={() => this.changeValue(false)}
              color={colors.white}
              style={[this.styleButton(),this.borderStyle(false)]}
              onPressColor={colors.off}
          />
      </Col>
        <Col style={styleApp.center}>
          <ButtonColor view={() => {
                return <Animated.Text style={[styles.text,{color:colorText1}]}>{this.props.textOff}</Animated.Text>
              }}
              click={() => this.changeValue(true)}
              color={colors.white}
              style={[this.styleButton(),this.borderStyle(true)]}
              onPressColor={colors.off}
          />
        </Col>
      </Row>

      <Animated.View style={[styleApp.center,{height:'100%',position:'absolute',borderWidth:1,bottom:0,width:'50%',backgroundColor:colors.green,borderColor:this.props.color != undefined?'white':colors.green,},{transform:[{translateX:this.translateXBorder}]},this.borderStyle(this.props.state)]}>
        <Animated.Text style={[styles.text,{color:'white'}]}>
        {
          !this.props.state?
          this.props.textOn
          :
          this.props.textOff
        }
          </Animated.Text>
      </Animated.View>
      
      </View>

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
  title:{
    fontSize:24,
    fontFamily: 'OpenSans-SemiBold',
    color:colors.title,
  },
  button:{
    alignItems: 'center',
    justifyContent: 'center',
    height:50,
    width:'100%',
    overflow:'hidden',
    borderWidth:1,borderColor:colors.grey,
    // borderRadius:7,
    // borderColor:colors.primary,
    //backgroundColor:'yellow',
   // borderWidth:0,
  },
  text:{
    //color:colors.title,
    fontSize:15,
    fontFamily: 'OpenSans-SemiBold',
  },
});

