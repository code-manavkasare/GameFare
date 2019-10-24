import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Animated,
  Easing,
  Dimensions,
  Image,
  TextInput,
  TouchableOpacity
} from 'react-native';
import {Grid,Row,Col} from 'react-native-easy-grid';

import colors from '../../style/colors'
import styleApp from '../../style/style'
var  { height, width } = Dimensions.get('screen')
import FastImage from 'react-native-fast-image'
import AllIcons from '../icons/AllIcons'

export default class TextField extends Component {
    constructor(props) {
        super(props);
        this.state = {
          icon:''
        };
        this.componentWillMount = this.componentWillMount.bind(this);
      }
    componentWillMount(){
    }
  render() {
    return ( 
      <Row style={[styleApp.inputForm,{height:this.props.heightField}]}>
          <Col style={[styleApp.center4,{paddingTop:14}]} size={15}>
            <AllIcons name={this.props.icon} color={colors.title} size={18} type={this.props.typeIcon} />
          </Col>
          <Col style={[styleApp.center2,{paddingLeft:15}]} size={85}>
            <TextInput
              style={[styleApp.input,{height:this.props.heightField,paddingTop:this.props.multiline?10:0}]}
              placeholder={this.props.placeHolder}
              returnKeyType={'done'}
              multiline={this.props.multiline}
              editable={this.props.editable!=undefined?this.props.editable:true}
              keyboardType={this.props.keyboardType}
              blurOnSubmit={true}
              underlineColorAndroid='rgba(0,0,0,0)'
              autoCorrect={true}
              onChangeText={text => this.props.setState(text)}
              value={this.props.state}
            />
          </Col>
        </Row>
    );
  }
}

const styles = StyleSheet.create({

});

