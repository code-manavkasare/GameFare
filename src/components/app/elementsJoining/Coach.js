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
import { Col, Row, Grid } from "react-native-easy-grid";
import FontIcon from 'react-native-vector-icons/FontAwesome';
import StatusBar from '@react-native-community/status-bar';
import BackButton from '../../layout/buttons/BackButton'
import Button from '../../layout/buttons/Button'
import ButtonOff from '../../layout/buttons/ButtonOff'

import Header from '../../layout/headers/HeaderButton'
import ButtonRound from '../../layout/buttons/ButtonRound'
import ScrollView from '../../layout/scrollViews/ScrollView'
import ExpandableCard from '../../layout/cards/ExpandableCard'
import Switch from '../../layout/switch/Switch'
import AllIcons from '../../layout/icons/AllIcons'
import {date} from '../../layout/date/date'

import sizes from '../../style/sizes'
import styleApp from '../../style/style'

export default class Page0 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      player:false,
    };
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Coach/Player',
      headerStyle:styleApp.styleHeader,
      headerTitleStyle: styleApp.textHeader,
      headerLeft: () => (
        <BackButton color={colors.title} name='keyboard-arrow-left' type='mat' click={() => navigation.goBack()} />
      ),
    }
  };
  componentDidMount() {
    console.log('pagecoach mount')
    console.log(this.props.navigation.getParam())
  }
  page0() {
      return (
        <View style={{marginTop:-15}}>
          
          <Text style={[styleApp.title,{fontSize:19,marginTop:20}]}>I am a...</Text>

          <View style={{height:20}} />
          {
            this.state.player?
            <ButtonOff text="Coach" click={() => this.setState({player:false})} backgroundColor={'white'} onPressColor={'white'} textButton={{color:colors.primary}}/>
            :
            <Button text="Coach" click={() => this.setState({player:false})} backgroundColor={'primary'} onPressColor={colors.primary2}/>
          }
          
          <View style={{height:10}} />
          {
            !this.state.player?
            <ButtonOff text="Player" click={() => this.setState({player:true})} backgroundColor={'white'} onPressColor={'white'} textButton={{color:colors.primary}}/>
            :
            <Button text="Player" click={() => this.setState({player:true})} backgroundColor={'primary'} onPressColor={colors.primary2}/>
          }

        </View>
      )
  }
  render() {
    return (
      <View style={[styleApp.stylePage,{borderLeftWidth:1,}]}>
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.page0.bind(this)}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={0}
          showsVerticalScrollIndicator={true}
        />

        <View style={styleApp.footerBooking}>
        <Button
          icon={'next'} 
          backgroundColor='green'
          onPressColor={colors.greenClick}
          styleButton={{marginLeft:20,width:width-40}}
          enabled={true} 
          disabled={false}
          text={'Next'}
          loader={this.state.loader} 
          click={() => this.props.navigation.navigate('Checkout',{pageFrom:this.props.navigation.getParam('pageFrom'),data:this.props.navigation.getParam('data'),coach:this.state})}
         />
        </View>
        

      </View>
    );
  }
}

const styles = StyleSheet.create({

});
0

