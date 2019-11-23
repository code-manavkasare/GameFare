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
import isEqual from 'lodash.isequal'
import firebase from 'react-native-firebase'

const { height, width } = Dimensions.get('screen')
import { Col, Row, Grid } from "react-native-easy-grid";
import StatusBar from '@react-native-community/status-bar';
import FadeInView from 'react-native-fade-in-view';

import {timing,native} from '../../animations/animations'
import Loader from '../../layout/loaders/Loader'
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
  async componentDidMount() {
    var variables = await firebase.database().ref('variables').once('value')
    variables = variables.val()
    if (!isEqual(variables,this.props.variables)) {
      await this.props.globaleVariablesAction(variables)
    }
    console.log('sdfdfkjhgdfjkhgfdg')
    console.log(this.props.sportSelected)
    if (this.props.sportSelected != '') {
      return this.props.navigation.navigate('TabsApp')
    }
    return this.props.navigation.navigate('SportSelect') 
  }
  loader() {
      return (
        <FadeInView duration={200} style={[styleApp.center,{height:height}]}>

          <View style={[styleApp.center,{height:70,width:width,marginBottom:0}]}>
          <Animated.Image style={{width:35,height:35,position:'absolute'}} source={require('../../../img/logos/logoWhite.png')} />
            {/* <Animated.Text style={[styleApp.title,{color:'white',transform:[{translateX:this.translateXText}]}]}>GameFare</Animated.Text> */}
           
          </View>
          <View style={{position:'absolute'}}>
            <Loader color='white' size={60} />
          </View>
          

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
    variables:state.globaleVariables,
    sportSelected:state.historicSearch.sport
  };
};

export default connect(mapStateToProps,{globaleVariablesAction})(InitialPage);
