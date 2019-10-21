import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Animated,
  TouchableOpacity,

  Dimensions,
  Image,
} from 'react-native';
import {Grid,Row,Col} from 'react-native-easy-grid';


import styleApp from '../../style/style'
// import LoaderGreen from '../../layout/loaders/LoaderGreen'
import FontIcon from 'react-native-vector-icons/FontAwesome';
const AnimatedIcon = Animated.createAnimatedComponent(FontIcon)
const { height, width } = Dimensions.get('screen')


export default class HeaderButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
      }
    async close () {      
      console.log('close en cour')
      this.props.close()
    }

  render() {
    return ( 
      <Animated.View style={styleApp.headerBooking}>
        <Row style={{height:50,borderBottomWidth:0,borderColor:this.props.borderColor}}>
          <Col size={15} style={[styles.center2,{paddingLeft:10,}]} activeOpacity={0.4} onPress={() => this.close()} >
            <FontIcon size={26} name={this.props.icon} color={colors.title} />   
          </Col>
          <Col size={70} style={styles.center}>
            <Text style={styles.text}>{this.props.title}</Text>
          </Col>      
          <Col size={15} style={[styles.center2,{alignItems: 'flex-end',paddingRight:20,}]}>

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
  text:{
    fontSize:14,
    fontFamily:'OpenSans-Bold',
    color:colors.title
  },
  lineOff:{
    height:1,
    width:'80%',
    backgroundColor:'#eaeaea'
  },
});


