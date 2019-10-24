import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import FontIcon from 'react-native-vector-icons/FontAwesome5';

import { Col, Row, Grid } from "react-native-easy-grid";
import colors from '../../style/colors'
import styleApp from '../../style/style'
import FadeInView from 'react-native-fade-in-view';
import FastImage from 'react-native-fast-image';

const { height, width } = Dimensions.get('screen')
import Icon from '../icons/icons'
import AllIcons from '../icons/AllIcons'
const AnimatedIcon = Animated.createAnimatedComponent(FontIcon)

export default class ExpandableCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
          expanded:false,
          heightCard: new Animated.Value(this.initialHeight()),
          heightDropDown:new Animated.Value(50)
        };
        this.componentWillMount = this.componentWillMount.bind(this);
        this.heightCard = new Animated.Value(this.initialHeight());
        this.heightDropDown = new Animated.Value(50);
        this.rotateIcon = new Animated.Value(0);
        this.opacityExpand = new Animated.Value(0);
      }
      initialHeight () {
        if (this.props.option.alwaysExpanded) return this.getHeightExpand()
        return 50
      }
      initialList () {
        if (this.props.option.alwaysExpanded) return 1
        return 0
      }
    componentWillMount(){
    }
    valueOption(option) {
      if (option.value == this.props.providersPreference.type) return <Text style={[styles.title,{color:colors.title}]}>{this.props.providersPreference.text}</Text> 
      return <Text style={styles.title}>{option.text}</Text> 
    }
    getColorIcon(option,value){
      if (option.value == this.props.valueSelected) return colors.title
      return '#eaeaea'
    }
    getColorIcon2(option){
      // if (option.value == this.props.providersPreference.type) return colors.primary 
      return colors.subtitle
    }
    getHeightExpand() {
      //return this.props.option.listExpend.length*50 + 50
      return 50
    }
    async expand() {
      if (!this.state.expanded) {
        await this.setState({expanded:true})
        await Animated.parallel([
          Animated.timing(this.rotateIcon, {
            toValue: 1,
            duration: 120,
            easing: Easing.linear
          }),
          Animated.timing(this.state.heightDropDown, {
            toValue: this.props.option.listExpend.length*50,
            
            duration: 120,
            easing: Easing.linear
          }),
          Animated.timing(this.opacityExpand, {
            toValue: 1,
            duration: 85,
            delay:80,
            easing: Easing.linear
          }),
        ]).start()
      } else {
        await Animated.parallel([
          Animated.timing(this.rotateIcon, {
            toValue: 0,
            duration: 120,
            easing: Easing.linear
          }),
          Animated.timing(this.state.heightDropDown, {
            toValue: 50,
            duration: 120,
            delay:50,
            easing: Easing.linear
          }),
          Animated.timing(this.opacityExpand, {
            toValue: 0,
            duration: 70,
            easing: Easing.linear
          }),
        ]).start(() => this.setState({expanded:false}))
      }
      return true
    }
    colorCheck (option,value,colorOff) {
      if (option.expendable == true && option.valueSelected == value) return colors.title
      else if (option.expendable == false && option.selected == value) return colors.title
      return colorOff
    }
    borderColor () {
      // if (this.state.expanded) return colors.primary
      return '#eaeaea'
    }
    textValue() {
      var value = this.props.option.listExpend.filter(option => option.value == this.props.option.valueSelected)[0].text
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
    async expandClose (option){
      if (option.locked != true) {
        await this.expand()
        var that = this
        setTimeout(function(){
         that.props.tickFilter(option.value)
        }, 100)
      }
    }

  render() {
    const spin = this.rotateIcon.interpolate({
      inputRange: [0,1],
      outputRange: ['0deg','180deg']
    })
    return (  
      <Animated.View style={[styleApp.inputForm,{borderColor:this.borderColor(),height:this.state.heightDropDown}]}>

        <TouchableOpacity 
            activeOpacity={0.75} 
            onPress={() => {
            if (this.props.locked != true) {
              if (this.props.option.expendable == false) {
                return this.props.tickFilter(!this.props.option.selected)
              }
              return this.expand()
            }
          }} 
          style={{height:50,width:'100%'}}
        >
        <Row style={{height:50}}>
          
          <Col size={15} style={styles.center}>
            {
              this.props.option.listExpend.filter(option => option.value == this.props.option.valueSelected)[0].icon!=undefined?
              <AllIcons type={this.props.option.listExpend.filter(option => option.value == this.props.option.valueSelected)[0].typeIcon} name={this.props.option.listExpend.filter(option => option.value == this.props.option.valueSelected)[0].icon} color={colors.title} size={17} />
              :
              <FontIcon name="check" color={colors.title} size={17} />
            }
            
          </Col>
         
          <Col size={70} style={[styles.center2,{paddingLeft:15}]}>
            {
              this.props.option.expendable?
              <Text style={[styles.title2,{color:this.props.option.valueSelected == 'anyone'?'#C7C7CC':colors.title}]}>{this.textValue()}</Text>
              :
              <Text style={[styles.title2,{color:this.colorCheck(this.props.option,true,colors.title)}]}>{this.props.option.text}</Text> 
            }
          </Col>
          <Col size={15} style={styleApp.center}>
          {
          this.props.option.expendable == true?
          <AnimatedIcon name='angle-down' color={colors.title} style={{transform: [{rotate: spin}]}} size={16} />
          :
          <FontIcon name='check' color={this.colorCheck(this.props.option,true,'#eaeaea')} size={15} />
          }
          
          </Col>
        </Row>
        </TouchableOpacity>

          {
            this.state.expanded?
        <Animated.View style={{opacity:this.opacityExpand}}>
        {this.props.option.listExpend.filter(option => option.value!= this.props.option.valueSelected).map((option,i) => (
          <TouchableOpacity 
            key={i}
            activeOpacity={0.75} 
            onPress={() => this.expandClose(option)} 
            style={{height:50,width:'100%'}}
          >
            <Row style={{height:50}}>
              <Col size={15} style={styles.center}>
                {
                  option.icon != undefined?
                  <AllIcons type={option.typeIcon} name={option.icon} color={colors.title} size={17} />
                  :
                  <FontIcon name="check" color={'#eaeaea'} size={20} />
                  }
              
              </Col>
              <Col size={70} style={[styles.center2,{paddingLeft:15}]}>
                {
                  option.locked!=true?
                  <Text style={styleApp.inputOff}>{option.text}</Text> 
                  :
                  <Text style={[styleApp.inputOff,{color:colors.title}]}>{option.text}</Text> 
                }
              
              </Col>
              <Col size={15} style={styleApp.center}>
              </Col>
            </Row>
          </TouchableOpacity>
        ))}
        </Animated.View>
        :null
          }
        

      
  </Animated.View>


    );
  }
}

const styles = StyleSheet.create({
  card:{
    //height:150,
    marginTop:10,
    borderWidth:1,
    width:'100%',
    zIndex:200,
    position:'relative',
    backgroundColor:'white',
    borderRadius:5,
    shadowColor: '#46474B',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    borderColor:'#eaeaea',
    shadowOpacity: 0.05,
  },
  dropdown:{
    opacity:1,
    borderBottomWidth:1,
    borderLeftWidth:1,
    borderRightWidth:1,
    backgroundColor:'white',width:width-40,
    borderBottomLeftRadius:5,
    borderBottomRightRadius:5,
    overflow:'hidden',left:-1,position:'absolute',top:48,zIndex:999,

  },
  picture:{
    borderTopLeftRadius:6,
    borderBottomLeftRadius:6,
    height:'100%',
    width:'90%',
  },
  center:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2:{
    //alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOn:{
    alignItems: 'center',
    justifyContent: 'center',
    height:20,
    width:20,
    borderRadius:10,
    borderColor:'#C1DACE',
    backgroundColor:'#C1DACE',
    borderWidth:1.5
  },
  title:{
    color:'#C7C7CC',
    fontSize:15,
    fontFamily: 'OpenSans-Regular',
  },
  title2:{
    fontSize:15,
    fontFamily: 'OpenSans-Regular',
  },
});

