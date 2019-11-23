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
import FontIcon from 'react-native-vector-icons/FontAwesome5';
const AnimatedIcon = Animated.createAnimatedComponent(FontIcon)

import sizes from '../../style/sizes'
import Loader from '../loaders/Loader'
import colors from '../../style/colors';
import ButtonColor from '../Views/Button'
import AllIcons from '../icons/AllIcons'
import styleApp from '../../style/style'
import AllIcon from '../icons/AllIcons';
import {native,timing} from '../../animations/animations'
import AsyncImage from '../image/AsyncImage'
const { height, width } = Dimensions.get('screen')


export default class HeaderFlow extends Component {
    constructor(props) {
        super(props);
        this.state = {
          enableClickButton:true,
          heightButtonSport:new Animated.Value(45),
          openSport:false
        };
        this.componentWillMount = this.componentWillMount.bind(this);
        this.handleBackPress = this.handleBackPress.bind(this)
        this.heightButtonSport = new Animated.Value(45)
        this.rotateIcon = new Animated.Value(0);
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
    openSport (val,sport){
      if (val) {
        return Animated.parallel([
          Animated.timing(this.state.heightButtonSport,timing(Object.values(this.props.sports).length*45,200)),
          Animated.timing(this.rotateIcon,timing(1,200)),
        ]).start(() => {
          this.setState({openSport:true})
        })
      }
      this.props.setSport(sport)
      return Animated.parallel([
        Animated.timing(this.state.heightButtonSport,timing(45,200)),
        Animated.timing(this.rotateIcon,timing(0,200)),
      ]).start(() => {
        this.setState({openSport:false})
      })
    }
    buttonSport (sport,i) {
      const spin = this.rotateIcon.interpolate({
        inputRange: [0,1],
        outputRange: ['0deg','180deg']
      })
      return (
        <ButtonColor view={() => {
          return <Row style={{}}>
            <Col size={35} style={[styleApp.center2,{paddingLeft:5}]}>
              <AsyncImage style={{height:35,width:35,borderRadius:20,borderWidth:1,overFlow:'hidden',borderColor:colors.off}} mainImage={sport.card.img.imgSM} imgInitial={sport.card.img.imgXS} />
            </Col>
            <Col size={15} style={[styleApp.center]}>
              {
                i==0?
                <AnimatedIcon name='caret-down' color={colors.title} style={{transform: [{rotate: spin}]}} size={15} />
                :null
              } 
            </Col>
            <Col size={65} style={[styleApp.center2,{paddingLeft:10}]}>
              <Text style={[{fontFamily:'OpenSans-Bold',fontSize:15,color:colors.title}]}>{sport.text.charAt(0).toUpperCase() + sport.text.slice(1)}</Text>
            </Col>
          </Row>
        }}
        click={() => this.openSport(!this.state.openSport,sport.value)}
        color={'white'}
        style={[styleApp.center,{height:45,width:150,borderRadius:0,borderWidth:0,overFlow:'hidden'}]}
        onPressColor={colors.off}
        />
      )
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
          inputRange: [0,100],
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
          outputRange: [ 0, -10],
          extrapolate: 'clamp'
    });
    const heightHeaderFilter = this.props.AnimatedHeaderValue.interpolate(
      {
          inputRange: this.props.inputRange,
          outputRange: [ sizes.heightHeaderFilter, sizes.heightHeaderFilter-20],
          extrapolate: 'clamp'
    });
    const scaleIcon = this.props.AnimatedHeaderValue.interpolate({
      inputRange: this.props.inputRange,
      outputRange: [35, 20],
    });
    var sport = Object.values(this.props.sports).filter(sport => sport.value == this.props.sportSelected)[0]
    return ( 
      <Animated.View style={[styles.header,{backgroundColor:AnimateBackgroundView,borderBottomWidth:borderWidth,height:heightHeaderFilter,borderColor:borderColorView}]}>
        <Row style={{width:width,paddingLeft:20,paddingRight:20}}>
          <Col size={50} style={{paddingTop:15}}>
              <Animated.View style={{height:this.state.heightButtonSport,overflow:'hidden',borderWidth:1,borderRadius:10,width:150,backgroundColor:'white',borderColor:colors.off,transform:[{translateY:translateYHeader}]}}>
                {this.buttonSport(sport,0)}

                {Object.values(this.props.sports).filter(item => item.value != sport.value).map((sport,i) => (
                  this.buttonSport(sport,i+1)
                ))}
              </Animated.View>
          </Col>
          <Col size={16}></Col>
          <Col size={17} style={[{paddingTop:15,alignItems:'flex-end'}]}>
            <ButtonColor view={() => {
                        return <AllIcons name={'sliders-h'} color={colors.title} size={15} type={this.props.typeIcon2} />
                      }}
                      click={() => this.props.clickButton2()}
                      color={'white'}
                      style={[styleApp.center,{height:45,width:45,borderRadius:22.5,borderWidth:1,overFlow:'hidden',borderColor:colors.off,transform:[{translateY:translateYHeader}]}]}
                      onPressColor={colors.off}
                      />
          </Col>
          <Col size={17} style={[{paddingTop:15,alignItems:'flex-end'}]}>
            <ButtonColor view={() => {
                        return <AllIcons name={this.props.icon2} color={colors.title} size={20} type={this.props.typeIcon2} />
                      }}
                      click={() => this.props.clickButton2()}
                      color={'white'}
                      style={[styleApp.center,{height:45,width:45,borderRadius:22.5,borderWidth:1,overFlow:'hidden',borderColor:colors.off,transform:[{translateY:translateYHeader}]}]}
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
    height:sizes.heightHeaderFilter,
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


