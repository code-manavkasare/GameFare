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
import firebase from 'react-native-firebase'

import ButtonColor from '../../layout/Views/Button'
import AllIcons from '../../layout/icons/AllIcons'
import Communications from 'react-native-communications';
import FadeInView from 'react-native-fade-in-view';
import LinearGradient from 'react-native-linear-gradient';

import sizes from '../../style/sizes'
import styleApp from '../../style/style'

export default class Description extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader:true,
      description:''
    };
  }
  componentDidMount() {
    this.load()
  }
  async load() {
    var description = await firebase.database().ref('groups/' + this.props.objectID + '/info/description/').once('value')
    description = description.val()
    this.setState({loader:false,description:description})
  }
  async componentWillReceiveProps(nextProps) {
    if (nextProps.loader) {
      await this.setState({loader:true})
      this.load()
    }
  }
  descriptionView() {
      return (
        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>
          <Text style={[styleApp.text,{marginBottom:0}]}>Description</Text>
          
          

          <View style={[styleApp.divider2,{marginBottom:10}]} />
          {
            this.state.loader?
            <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}   colors={[colors.placeHolder1, colors.placeHolder2]} style={{height:20,borderRadius:7,marginRight:80,marginTop:10,marginLeft:0}} />
            :
            <FadeInView duration={300} style={{marginTop:5}}>
              <Text style={styleApp.smallText}>{this.state.description}</Text>
            </FadeInView>
          }

          </View>
        </View>
      )
  }
  render() {
    return (this.descriptionView());
  }
}

const styles = StyleSheet.create({

});


