import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Animated,
  BackHandler,
  TouchableOpacity,
  View,
  Easing,
  Dimensions,
  Image,
} from 'react-native';
import {Grid,Row,Col} from 'react-native-easy-grid';


import sizes from '../../style/style'
import colors from '../../style/colors';
// import FontIcon from 'react-native-vector-icons/FontAwesome';
// const AnimatedIcon = Animated.createAnimatedComponent(FontIcon)
const { height, width } = Dimensions.get('screen')


export default class HeaderFlow extends Component {
    constructor(props) {
        super(props);
        this.state = {
          enableClickButton:true,
          step:1,
        };
        this.componentWillMount = this.componentWillMount.bind(this);
      }
    componentWillMount(){
      // this.props.onRef(this)
    }
    SetState(state,val) {
      this.setState({[state]:val})
    }
    async back () {      
      console.log('close en cour')
      this.setState({enableClickButton:false})
      if (this.state.enableClickButton) {
        this.props.back(this.state.step-1,this.state.step)
        var that = this
        setTimeout(function(){
          that.setState({enableClickButton:true})
        }, 400);   
      }
    }
  render() {
    return ( 
      <Animated.View style={[styles.header,{borderColor:'#eaeaea'}]}>
        <Row style={{width:width,}}>
          <Col size={15} style={[styles.center2,{paddingLeft:10,}]} activeOpacity={0.4} onPress={() => this.back()} >
            {/* <FontIcon size={26} name='angle-left' style={colors.title}/>  */}
          </Col>
          <Col size={70} style={styles.center}>
            <Row>
                <Col style={styles.center} size={20}>
                  <Animated.View style={[styles.roundStep,{backgroundColor:colors.primary}]}>
                    <Animated.Text style={[styles.textButton,{color:'white'}]}>1</Animated.Text>
                  </Animated.View>
                </Col>
                <Col style={styles.center} size={10}>
                  <Animated.View style={[styles.line,{backgroundColor:this.props.backgroundColorLine1}]}/>
                </Col>
                <Col style={styles.center} size={20}>
                  <Animated.View style={[styles.roundStep,{backgroundColor:this.props.backgroundColor2,borderColor:this.props.borderColor2}]}>
                    <Animated.Text style={[styles.textButton,{color:this.props.textColor2}]}>2</Animated.Text>
                  </Animated.View>
                </Col>
                <Col style={styles.center} size={10}>
                <Animated.View style={[styles.line,{backgroundColor:this.props.backgroundColorLine2}]}/>
                </Col>
                <Col style={styles.center} size={20}>
                  <Animated.View style={[styles.roundStep,{backgroundColor:this.props.backgroundColor3,borderColor:this.props.borderColor3}]}>
                    <Animated.Text style={[styles.textButton,{color:this.props.textColor3}]}>3</Animated.Text>
                  </Animated.View>
                </Col>
              </Row>
          </Col>
          <Col size={15}></Col>
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
  header:{
    height:50+sizes.marginTopHeader,
    paddingTop:sizes.marginTopHeader-5,
    borderBottomWidth:1,
    backgroundColor:'white',
  },
  roundStep:{
      height:30,
      width:30,
      // backgroundColor:'white',
      borderWidth:1,
      borderRadius:15,
      //borderColor:colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
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
      fontFamily: 'OpenSans-SemiBold',
  },
  line:{
    height:1,
    width:'80%',
    // backgroundColor:'#eaeaea'
  },
  textButton:{
    fontSize:13,
    fontFamily: 'OpenSans-SemiBold',
  },
  textTitleHeader:{
    color:colors.title,
    fontSize:17,
    fontFamily: 'OpenSans-SemiBold',
  },
});


