import React from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
    Image,
    TextInput,
    ScrollView,
} from 'react-native';

import firebase from 'react-native-firebase'
import {connect} from 'react-redux';

const { height, width } = Dimensions.get('screen')
import colors from '../../style/colors'
import sizes from '../../style/sizes'
import styleApp from '../../style/style'
import { Col, Row, Grid } from "react-native-easy-grid";
import indexEvents from '../../database/algolia'
import FadeInView from 'react-native-fade-in-view';
import PlaceHolder from '../../placeHolders/ListEvents'
import CardEvent from './CardEvent'
import Button from '../../layout/buttons/Button'
import AsyncImage from '../../layout/image/AsyncImage'
import AllIcons from '../../layout/icons/AllIcons'
import NavigationService from '../../../../NavigationService'

export default class NewEventCard extends React.Component {
  card () {
    return (
      <View key={4} style={styleApp.viewHome}>
        <View style={styleApp.marginView}>
          <View style={styleApp.center}>
            <Image source={require('../../../img/images/users.png')} style={{width:100,height:100,marginBottom:25}} />
          </View>
          
          <Text style={[styleApp.title,{fontSize:18}]}>Grow a community.</Text>
          
          <Text style={[styleApp.subtitle,{marginBottom:20,marginRight:30,marginTop:10}]}>Pick your sport, create your group and start growing your community</Text>

          <Button backgroundColor={'blue'} onPressColor={colors.blueLight} click={() => NavigationService.navigate('CreateGroup0',{'pageFrom':this.props.pageFrom})} text={'Create a group'} styleButton={{marginBottom:15,marginTop:10}} loader={false}/>


          <Text style={[styleApp.title,{fontSize:18,marginTop:20}]}>Become a host</Text>
          <Text style={[styleApp.subtitle,{marginBottom:20,marginRight:30,marginTop:10}]}>Pick your sport, your location and create a personalized the experience for your sport venue. </Text>
          <Button backgroundColor={'green'} onPressColor={colors.greenLight} click={() => NavigationService.navigate('CreateEvent0',{'pageFrom':this.props.pageFrom})} text={'Organize an event'} styleButton={{marginBottom:15,marginTop:10}} loader={false}/>
        </View>
      </View>
    )
  }
  render() {
    return this.card()
  }
}
