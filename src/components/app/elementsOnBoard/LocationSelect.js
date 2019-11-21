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
import HeaderBackButton from '../../layout/headers/HeaderBackButton'
import ButtonColor from '../../layout/Views/Button'

import ScrollView from '../../layout/scrollViews/ScrollView2'
import AllIcons from '../../layout/icons/AllIcons'

import {timing,native} from '../../animations/animations'
import Loader from '../../layout/loaders/Loader'
import AsyncImage from '../../layout/image/AsyncImage'

import sizes from '../../style/sizes'
import styleApp from '../../style/style'
import AllIcon from '../../layout/icons/AllIcons';

class InitialPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader:false,
    };
    this.translateXText = new Animated.Value(90)
    this.AnimatedHeaderValue = new Animated.Value(0)
  }
  componentDidMount() {

  }
  location() {
    return (
      <FadeInView duration={200} style={{height:height/2}}>
        <View style={styleApp.marginView}>
         <Text style={[styleApp.title,{color:colors.title,marginBottom:30}]}>Where do you plan to practice?</Text>
        </View>

        <ButtonColor view={() => {
        return (
            <Row >
              <Col size={15} style={styleApp.center2}>
                <AllIcon name='search' size={17} type={'font'} color={colors.title} />
              </Col>
              <Col size={60} style={[styleApp.center2,{paddingLeft:0}]}>
              <Text style={[styleApp.title,{color:colors.title,fontSize:15,fontFamily:'OpenSans-SemiBold'}]}>Search for an address</Text>
              </Col>
              <Col size={15} style={styleApp.center3}>
                <AllIcon name='arrow-right' size={14} type={'font'} color={colors.title} />
              </Col>
            </Row>
        )
      }} 
      click={() => {
        StatusBar.setBarStyle('dark-content',true)
        this.props.navigation.navigate('TabsApp')
      }}
      color={'white'}
      style={[styles.cardSports,{height:60,borderBottomWidth:0.3,borderColor:colors.grey,paddingRight:20,paddingLeft:20,width:width}]}
      onPressColor={colors.off}

      />


        <ButtonColor view={() => {
        return (
            <Row >
              <Col size={15} style={styleApp.center2}>
                <AllIcon name='location-arrow' size={17} type={'font'} color={colors.title} />
              </Col>
              <Col size={60} style={[styleApp.center2,{paddingLeft:0}]}>
              <Text style={[styleApp.title,{color:colors.title,fontSize:15,fontFamily:'OpenSans-SemiBold'}]}>Use current location</Text>
              </Col>
              <Col size={15} style={styleApp.center3}>
                <AllIcon name='arrow-right' size={14} type={'font'} color={colors.title} />
              </Col>
            </Row>
        )
      }} 
      click={() => {
        StatusBar.setBarStyle('dark-content',true)
        this.props.navigation.navigate('TabsApp')
      }}
      color={'white'}
      style={[styles.cardSports,{height:60,borderBottomWidth:0.3,borderColor:colors.grey,paddingRight:20,paddingLeft:20,width:width}]}
      onPressColor={colors.off}

      />

        <ButtonColor view={() => {
        return (
            <Row >
              <Col size={75} style={[styleApp.center2,{paddingLeft:0}]}>
              <Text style={[styleApp.title,{color:colors.title,fontSize:15,fontFamily:'OpenSans-SemiBold'}]}>Skip</Text>
              </Col>
              <Col size={15}>
                
              </Col>
            </Row>
        )
      }} 
      click={() => {
        StatusBar.setBarStyle('dark-content',true)
        this.props.navigation.navigate('TabsApp')
      }}
      color={'white'}
      style={[styles.cardSports,{height:60,borderWidth:0.3,borderColor:colors.grey,paddingRight:20,paddingLeft:20,width:width}]}
      onPressColor={colors.off}

      />
      </FadeInView>
    )
  }
  render() {
    return (
      <View style={[{borderLeftWidth:0,backgroundColor:'white',flex:1}]}>
        <HeaderBackButton 
            AnimatedHeaderValue={this.AnimatedHeaderValue}
            textHeader={''}
            inputRange={[5,10]}
            initialBorderColorIcon={'white'}
            initialBackgroundColor={'white'}
            initialTitleOpacity={1}
            icon1='arrow-left'
            icon2={null}
            clickButton1={() => this.props.navigation.goBack()} 
        />
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.location.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          offsetBottom={0}
          showsVerticalScrollIndicator={false}
        />
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

