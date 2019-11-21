import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Animated,
  BackHandler,
  Easing,
  Dimensions,
  View
} from 'react-native';
import {Grid,Row,Col} from 'react-native-easy-grid';


import sizes from '../../style/sizes'
import Loader from '../loaders/Loader'
import colors from '../../style/colors';
import ButtonColor from '../Views/Button'
import AllIcons from '../icons/AllIcons'
import styleApp from '../../style/style'
import FontIcon from 'react-native-vector-icons/FontAwesome5';
import AllIcon from '../icons/AllIcons';
import AsyncImage from '../image/AsyncImage'
const AnimatedIcon = Animated.createAnimatedComponent(FontIcon)
const { height, width } = Dimensions.get('screen')


export default class HeaderFlow extends Component {
    constructor(props) {
        super(props);
        this.state = {
          enableClickButton:true
        };
        this.componentWillMount = this.componentWillMount.bind(this);
        this.handleBackPress = this.handleBackPress.bind(this)
      }
    componentWillMount(){
      this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
      if (this.props.loaderOn == true) {
        this.props.onRef(this)
      }
    }
    shouldComponentUpdate (nextProps,nextState) {
      return (this.props.loader !== nextProps.loader || this.state !== nextState || this.props.enableClickButton !== nextProps.enableClickButton)
    }
    handleBackPress = () => {
      if (this.props.enableClickButton && this.state.enableClickButton) {
        this.close()
      }
    }
    componentWillUnmount() {
      this.backHandler.remove()
    }
    async close () {      
      console.log('close en cour')
      // this.props.layoutAction('setEnableClickButton',{value:false})
      this.setState({enableClickButton:false})
      if (this.props.enableClickButton && this.state.enableClickButton) {
        this.props.close()
        var that = this
        setTimeout(function(){
          that.setState({enableClickButton:true})
        }, 1500);   
      }
    }
    sizeColTitle() {
      if (this.props.headerType) return 25
      return 70
    }
  render() {
    const AnimateOpacityTitle = this.props.AnimatedHeaderValue.interpolate(
      {
          inputRange: [this.props.inputRange[1]+20,this.props.inputRange[1]+30],
          outputRange: [ this.props.initialTitleOpacity, 1 ],
          extrapolate: 'clamp'
    });
    const AnimateBackgroundView = this.props.AnimatedHeaderValue.interpolate(
      {
          inputRange: [this.props.inputRange[1]-0.42,this.props.inputRange[1]-0.1],
          outputRange: [ this.props.initialBackgroundColor, 'white' ],
          extrapolate: 'clamp'
    });
    const borderWidth = this.props.AnimatedHeaderValue.interpolate(
      {
          inputRange: [0,10],
          outputRange: [ 0, 1 ],
          extrapolate: 'clamp'
    });
    const AnimateColorIcon = this.props.AnimatedHeaderValue.interpolate(
      {
          inputRange: this.props.inputRange,
          outputRange: [ colors.title, colors.title ],
          extrapolate: 'clamp'
    });
    const borderColorIcon = this.props.AnimatedHeaderValue.interpolate(
      {
          inputRange: this.props.inputRange,
          outputRange: [ this.props.initialBorderColorIcon, 'white' ],
          extrapolate: 'clamp'
    });
    const borderColorView = this.props.AnimatedHeaderValue.interpolate(
      {
          inputRange: this.props.inputRange,
          outputRange: [ 'white', colors.off ],
          extrapolate: 'clamp'
    });
    const translateYHeader = this.props.AnimatedHeaderValue.interpolate(
      {
          inputRange: this.props.inputRange,
          outputRange: [ 0, -11],
          extrapolate: 'clamp'
    });
    const scaleIcon = this.props.AnimatedHeaderValue.interpolate({
      inputRange: this.props.inputRange,
      outputRange: [35, 20],
    });
    var sport = Object.values(this.props.sports).filter(sport => sport.value == this.props.filterSports)[0]
    return ( 
      <Animated.View style={[styles.header,{backgroundColor:AnimateBackgroundView,borderBottomWidth:borderWidth,borderColor:borderColorView,transform:[{translateY:translateYHeader}]}]}>
        <Row style={{width:width,paddingLeft:20,paddingRight:20}}>
          <Col size={50} style={styleApp.center2}>
              <ButtonColor view={() => {
                        return <AsyncImage style={{height:40,width:40,borderRadius:20,borderWidth:0,overFlow:'hidden'}} mainImage={sport.card.img.imgSM} imgInitial={sport.card.img.imgXS} />
                      }}
                      click={() => this.props.clickButton1()}
                      color={'white'}
                      style={[styleApp.center,{height:40,width:40,borderRadius:20,borderWidth:0,overFlow:'hidden'}]}
                      onPressColor={colors.off}
                      />
            {/* <Text style={[styles.text,{marginTop:5}]}>{this.props.filterSports.charAt(0).toUpperCase() + this.props.filterSports.slice(1)}</Text> */}
          </Col>
          <Col size={50} style={[styleApp.center3]}>
            <ButtonColor view={() => {
                        return <AllIcons name={this.props.icon2} color={colors.title} size={20} type={this.props.typeIcon2} />
                      }}
                      click={() => this.props.clickButton2()}
                      color={'white'}
                      style={[styleApp.center,{height:40,width:40,borderRadius:20,borderWidth:1,overFlow:'hidden',borderColor:colors.off}]}
                      onPressColor={colors.off}
                      />
          </Col>
        </Row>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  center:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2:{
    justifyContent: 'center',
  },
  icon:{
    height:48,width:48,borderRadius:23.8,borderWidth:1,backgroundColor:'white',
    // overFlow:'hidden',
    
  },
  header:{
    height:50+sizes.marginTopHeader,
    paddingTop:sizes.marginTopHeader-5,
    borderBottomWidth:1,
    position:'absolute',
    zIndex:10
  },
  imgBackground:{
    height:'100%',
    width:'100%',
    overflow:'hidden'
  },
  viewTitleHeader:{
    position:'absolute',
    height:'100%',
    width:width,
    // backgroundColor:'red',
    zIndex:-1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title:{
      fontSize:15,paddingLeft:7,color:'#4B4B4B',
  },
  textTitleHeader:{
    color:colors.title,
    fontSize:17,
  },
});


