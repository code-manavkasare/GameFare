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
import ButtonColor from '../../layout/Views/Button'

import ScrollView from '../../layout/scrollViews/ScrollView'
import AllIcons from '../../layout/icons/AllIcons'

import {timing,native} from '../../animations/animations'
import Loader from '../../layout/loaders/Loader'
import AsyncImage from '../../layout/image/AsyncImage'

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
  componentDidMount() {
    console.log('pagecoach mount')
    var that = this
      setTimeout(function(){
        // StatusBar.setBarStyle('dark-content',true)
        that.setState({loader:false})
        //that.props.navigation.navigate('TabsApp')
      }, 2000);   
  }
  loader() {
      return (
        <FadeInView duration={200} style={[styleApp.center,{height:height}]}>

          <View style={[styleApp.center,{height:70,width:width,marginBottom:30}]}>
          <Animated.Image style={{width:70,height:70,position:'absolute'}} source={require('../../../img/logos/logoWhite.png')} />
            {/* <Animated.Text style={[styleApp.title,{color:'white',transform:[{translateX:this.translateXText}]}]}>GameFare</Animated.Text> */}
           
          </View>
          
          <Loader color='white' size={30} />

        </FadeInView>
      )
  }
  selectSport (sport) {
    this.setState({sport:sport,page:'location'})
  }
  button(sport,i) {
    console.log(sport.value)
    console.log('sport.value')
    return (
      
      <ButtonColor key={i} view={() => {
        return (
            <Row >
              <Col size={20} style={styleApp.center}>
              <AsyncImage style={styles.imgBackground} mainImage={sport.card.img.imgSM} imgInitial={sport.card.img.imgXS} />
              </Col>
              <Col size={75} style={styleApp.center2}>
              <Text style={[styleApp.title,{color:'white',fontSize:15,fontFamily:'OpenSans-Bold'}]}>{sport.card.name}</Text>
              </Col>
              <Col size={15}>
                
              </Col>
            </Row>
        )
      }} 
      click={() => {
        this.selectSport(sport.value)
        this.setState({sport:sport})
      }}
      color={colors.blue}
      style={[styles.cardSports,{height:60,borderWidth:1,borderColor:'white',marginTop:10,borderRadius:10}]}
      onPressColor={colors.primaryLight}

      />
    )
  }
  sport () {
    return (
      <FadeInView duration={200} style={[{height:height,paddingTop:sizes.marginTopApp}]}>

          
        <Text style={[styleApp.title,{color:'white',marginBottom:30}]}>Which sport do you practice?</Text>

        {/* <View style={styleApp.divider2}/> */}

        {this.props.sports.map((sport,i) => (
            this.button(sport,i+1)
          ))}
      </FadeInView>
    )
  }
  location() {
    return (
      <FadeInView duration={200} style={[{height:height,paddingTop:sizes.marginTopApp}]}>

          
        <Text style={[styleApp.title,{color:'white',marginBottom:30}]}>Location</Text>

        <ButtonColor view={() => {
        return (
            <Row >
              <Col size={75} style={[styleApp.center2,{paddingLeft:20}]}>
              <Text style={[styleApp.title,{color:'white',fontSize:15,fontFamily:'OpenSans-Bold'}]}>Skip</Text>
              </Col>
              <Col size={15}>
                
              </Col>
            </Row>
        )
      }} 
      click={() => this.props.navigation.navigate('TabsApp')}
      color={colors.blue}
      style={[styles.cardSports,{height:60,borderWidth:1,borderColor:'white',marginTop:10,borderRadius:10}]}
      onPressColor={colors.primaryLight}

      />
      </FadeInView>
    )
  }
  render() {
    return (
      <View style={[{borderLeftWidth:0,backgroundColor:colors.blue,height:height}]}>
        {
          this.state.loader?
          this.loader()
          :this.state.page== 'sport'?
          <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.sport.bind(this)}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={0}
          showsVerticalScrollIndicator={false}
        />
        :
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.location.bind(this)}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={0}
          showsVerticalScrollIndicator={false}
        />
        }
        

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

