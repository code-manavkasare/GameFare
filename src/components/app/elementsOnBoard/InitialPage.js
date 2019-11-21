import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,TextInput,
    Animated,
    Image
} from 'react-native';
import {connect} from 'react-redux';
import {globaleVariablesAction} from '../../../actions/globaleVariablesActions'

const { height, width } = Dimensions.get('screen')
import { Col, Row, Grid } from "react-native-easy-grid";
import StatusBar from '@react-native-community/status-bar';
import FadeInView from 'react-native-fade-in-view';
import LinearGradient from 'react-native-linear-gradient';
import ButtonColor from '../../layout/Views/Button'

import ScrollView from '../../layout/scrollViews/ScrollView'
import AllIcons from '../../layout/icons/AllIcons'

import {timing,native} from '../../animations/animations'
import Loader from '../../layout/loaders/Loader'
import AsyncImage from '../../layout/image/AsyncImage'

import sizes from '../../style/sizes'
import styleApp from '../../style/style'

class InitialPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader:true,
      widthText:new Animated.Value(40),
      sport:'',
      page:'sport',
    };
    this.translateXText = new Animated.Value(90)
  }
  componentDidMount() {
    console.log('pagecoach mount')
    var that = this
      setTimeout(function(){
        StatusBar.setBarStyle('dark-content',true)
        // that.setState({loader:false})
        that.props.navigation.navigate('SportSelect')
      }, 2000);   
  }
  loader() {
      return (
        <FadeInView duration={200} style={[styleApp.center,{height:height}]}>

          <View style={[styleApp.center,{height:70,width:width,marginBottom:30}]}>
          <Animated.Image style={{width:70,height:70,position:'absolute'}} source={require('../../../img/logos/logoWhite.png')} />
            {/* <Animated.Text style={[styleApp.title,{color:'white',transform:[{translateX:this.translateXText}]}]}>GameFare</Animated.Text> */}
           
          </View>
          
          <Loader color='white' size={30} />

        </FadeInView>
      )
  }
  render() {
    return (
      <View style={[{borderLeftWidth:0,backgroundColor:colors.blue,height:height}]}>
        {this.loader()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  imgBackground:{
    height:40,
    width:40,
    // borderRadius:24,
    borderColor:colors.off,
    borderWidth:0,
    borderRadius:20
  },
  cardSport:{
    // backgroundColor:'red',
    marginRight:0,
    height:60,
    width:width,
    borderColor:colors.off,borderWidth:1,
    // marginRight:10,
    borderRadius:10,
  }
});


const  mapStateToProps = state => {
  return {
    userID:state.user.userIDSaved,
    phoneNumber:state.user.phoneNumber,
    countryCode:state.user.countryCode,
    sports:state.globaleVariables.sports.list,
  };
};

export default connect(mapStateToProps,{globaleVariablesAction})(InitialPage);

