
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
import {connect} from 'react-redux';

import { Col, Row, Grid } from "react-native-easy-grid";
import colors from '../../style/colors'
import ButtonColor from '../../layout/Views/Button'
import Icon from '../../layout/icons/icons'
import AllIcons from '../../layout/icons/AllIcons'
import PlacelHolder from '../../placeHolders/CardEvent.js'
import styleApp from '../../style/style'
import {indexEvents} from '../../database/algolia'
import {timing,native} from '../../animations/animations'

var  { height, width } = Dimensions.get('screen')

export default class ButtonAdd extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        open:false
      };
      this.rotateButton = new Animated.Value(0);
      this.opacityButton1 = new Animated.Value(0);
      this.translateYButton1 = new Animated.Value(0);
      this.opacityButton2 = new Animated.Value(0);
      this.translateYButton2 = new Animated.Value(0);
    }
    async componentDidMount() {

    }
    async open(val,to) {
      if (val) {
        await this.props.translateXVoile.setValue(0)
        await this.opacityButton2.setValue(1)
        await this.opacityButton1.setValue(1)
        return Animated.parallel([
          Animated.timing(this.rotateButton,native(1,200)),
          Animated.timing(this.translateYButton1,native(-60,200)),
          Animated.timing(this.translateYButton2,native(-120,200)),
          Animated.timing(this.props.opacityVoile,native(0.4,200)),
        ]).start(() => this.setState({open:true}))
      }
      return Animated.parallel([
        Animated.timing(this.rotateButton,native(0,200)),
        Animated.timing(this.translateYButton1,native(0,200)),
        Animated.timing(this.translateYButton2,native(0,200)),
        Animated.timing(this.props.opacityVoile,native(0,200)),
      ]).start(() => {
        this.props.translateXVoile.setValue(width)
        this.opacityButton1.setValue(0)
        this.opacityButton2.setValue(0)
        this.setState({open:false})
        if (to != undefined) {
          this.props.new(to)
        }
      })
    }

  render() {
    const spin = this.rotateButton.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '45deg']
    })
    return (
      <View>

        <Animated.View style={[styles.viewButton,{opacity:this.opacityButton2,transform: [{translateY: this.translateYButton2}]}]}>
          <View style={{position:'absolute',left:-54,}}>
            <Text style={[styleApp.title,{color:'white',fontSize:16}]}>Group</Text>
          </View>

          <ButtonColor view={() => {
                return <AllIcons name='user-friends' color={colors.blue} size={18} type='font' />
              }}
              click={() => this.open(!this.state.open,'group')}
              color={'white'}
              style={[styleApp.center,styleApp.shade2,{borderColor:colors.off,height:55,width:55,borderRadius:27.5,borderWidth:1}]}
              onPressColor={colors.off}
          />
        </Animated.View>

        <Animated.View style={[styles.viewButton,{opacity:this.opacityButton1,transform: [{translateY: this.translateYButton1}]}]}>
          <View style={{position:'absolute',left:-50,}}>
            <Text style={[styleApp.title,{color:'white',fontSize:16}]}>Event</Text>
          </View>
          
          <ButtonColor view={() => {
                return <AllIcons name='calendar-day' color={colors.blue} size={18} type='font' />
              }}
              click={() => this.open(!this.state.open,'event')}
              color={'white'}
              style={[styleApp.center,styleApp.shade2,{borderColor:colors.off,height:55,width:55,borderRadius:27.5,borderWidth:1}]}
              onPressColor={colors.off}
          />
        </Animated.View>
        
        <Animated.View style={[styles.viewButton,{transform: [{rotate: spin}]}]}>
          <ButtonColor view={() => {
                return <AllIcons name='plus' color={'white'} size={18} type='font' />
              }}
              click={() => this.open(!this.state.open)}
              color={colors.blue}
              style={[styleApp.center,styleApp.shade2,{borderColor:colors.off,height:55,width:55,borderRadius:27.5}]}
              onPressColor={colors.blueLight}
          />
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewButton:{
    ...styleApp.center,
    borderColor:colors.off,
    height:55,width:55,position:'absolute',zIndex:40,bottom:50,right:20
  },
  
});




