import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
  Dimensions,
  Easing,
  Animated,
  Image,
  TouchableHighlight,
  ActivityIndicator,
  View
} from 'react-native';
import NavigationService from '../../../../NavigationService'
import colors from '../../style/colors'
import Loader from '../loaders/Loader'
import {timing} from '../../animations/animations'
import AllIcons from '../../layout/icons/AllIcons'
import styleApp from '../../style/style'
import { Col, Row, Grid } from "react-native-easy-grid";

import {takePicture,pickLibrary,resize} from '../../functions/pictures'
import FadeInView from 'react-native-fade-in-view';
import ButtonColor from '../Views/Button'
const { height, width } = Dimensions.get('screen')

export default class Button extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader:false,
    };
    this.AnimatedButton = new Animated.Value(1);
  }
  async click(val) {
    await this.setState({loader:true})
    console.log('loader set')
    if (val == 'take') {
      var uri = await takePicture()
    } else if (val == 'pick') {
      var uri = await pickLibrary()
    }
    if (!uri) return this.setState({loader:false})
    const uriResized = await resize(uri)
    if (!uriResized) return this.setState({loader:false})

    await this.props.setState(uriResized)
    this.setState({loader:false})
  }
  render() {  
    return (
      <ButtonColor  view={() => {
        return <View style={[styleApp.center,{paddingLeft:0,height:'100%',width:'100%',overflow:'hidden'}]}>

              {   
              this.state.loader?
              <ActivityIndicator size="small" color={colors.title} />
              :this.props.img==''?
              <View style={styleApp.center}>
                <AllIcons name={'image'} size={18} color={colors.grey} type='font'/>
                <Text style={[styleApp.input,{marginTop:8}]}>Add picture</Text>
              </View>
              :
              <FadeInView duration={200} style={{height:'100%',width:'100%'}}>
                <Image source={{uri:this.props.img}} style={{height:'100%',width:'100%'}} />
              </FadeInView>
            }
          </View>
      }}
      click={() => NavigationService.navigate('AlertAddImage',{title:'Add picture',onGoBack:(val) => {
        this.click(val)
      }})}
      color={'white'}
      style={[{height:190,width:width,paddingLeft:0,paddingRight:0,marginBottom:10,borderBottomWidth:0.5,borderTopWidth:0.5,borderColor:colors.grey}]}
      onPressColor={colors.off}
      />
    );
  }
}

const styles = StyleSheet.create({
  buttonSubmit:{
    height:56,
    backgroundColor:colors.primary,
    borderRadius:3,
    width:'100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,borderColor:colors.borderColor,
    shadowColor: '#46474B',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    shadowOpacity: 0,
  },
  textButtonOn:{
    color:'white',
    fontFamily: 'OpenSans-Bold',
    fontSize:16,
  },
});


