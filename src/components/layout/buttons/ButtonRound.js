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
  View
} from 'react-native';
import colors from '../../style/colors'
import styleApp from '../../style/style'
import LoaderWhite from '../loaders/Loader'
import FontIcon from 'react-native-vector-icons/FontAwesome5';
import MatIcon from 'react-native-vector-icons/MaterialIcons';

const { height, width } = Dimensions.get('screen')

export default class ButtonRound extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.componentWillMount = this.componentWillMount.bind(this);
  }
  componentWillMount(){    
    console.log('button round mounted!')
    console.log(this.props)
  }
  click() {
    this.props.click()
  }
  stylesButton() {
    if (this.props.styleButton != undefined) return {...styleApp.buttonRound,...this.props.styleButton}
    return styleApp.buttonRound
  }
  styleButton() {
    if (!this.props.enabled) return {...this.stylesButton(),backgroundColor:'white'}
    return this.stylesButton()
  }
  onPressColor() {
    if (!this.props.enabled) return 'white'
    else if (this.props.onPressColor != undefined) return this.props.onPressColor
    return colors.green
  }
  colorIcon() {
    if (!this.props.enabled) return '#eaeaea'
    return 'white'
  }
  render() {  
    return (
      <TouchableHighlight 
        activeOpacity={1} 
        disabled={this.props.loader}
        underlayColor={this.onPressColor()}
        style={this.styleButton()}
        onPress={() => this.props.click()} 
      >
           {
             this.props.loader?
             <LoaderWhite color='white' size={20} />
             :this.props.icon=='next'?
             <FontIcon name='arrow-right' size={22} color={this.colorIcon()} />
             :this.props.icon=='invite'?
             <FontIcon name='share' size={20} color={this.colorIcon()} />
             :this.props.icon=='send'?
             <FontIcon name='comments' size={20} color={this.colorIcon()} />
             :this.props.icon=='sign'?
             <FontIcon name='user-circle' size={25} color={'white'} />
             :this.props.icon=='check'?
             <FontIcon name='check' size={25} color={'white'} />
             :this.props.icon=='event'?
             <FontIcon name='calendar-alt' size={21} color={'white'} />
             :this.props.icon=='create'?
             <FontIcon name='arrow-right' size={20} color={this.colorIcon()} />
             :null
           }
      </TouchableHighlight> 
    );
  }
}

const styles = StyleSheet.create({
  center:{
    alignItems: 'center',
    justifyContent: 'center',
  }
});


