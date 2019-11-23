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
import {historicSearchAction} from '../../../actions/historicSearchActions'

const { height, width } = Dimensions.get('screen')
import { Col, Row, Grid } from "react-native-easy-grid";
import StatusBar from '@react-native-community/status-bar';
import FadeInView from 'react-native-fade-in-view';
import LinearGradient from 'react-native-linear-gradient';
import ButtonColor from '../../layout/Views/Button'

import ScrollView from '../../layout/scrollViews/ScrollView2'
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
 
  }
  async selectSport (sport) {
    // write sport to redux
    await this.props.historicSearchAction('setSport',sport)
    this.props.navigation.navigate('LocationSelect',{sport:sport})
  }
  button(sport,i) {
    console.log(sport.value)
    console.log('sport.value')
    return (
      <ButtonColor key={i} view={() => {
        return (
            <View style={[{borderWidth:5,borderColor:sport.value == this.state.sport?colors.green:'white',borderRadius:16,height:'100%',width:'100%',overflow:'hidden',backgroundColor:colors.off}]}>
              <AsyncImage style={[styles.imgBackground]} mainImage={sport.card.img.imgSM} imgInitial={sport.card.img.imgXS} />
              {/* <View style={[styleApp.voile,{backgroundColor:colors.title,opacity:0.25}]}/> */}
              <Text style={[styleApp.title,{color:'white',fontSize:15,fontFamily:'OpenSans-SemiBold',position:'absolute',bottom:10,left:10}]}>{sport.card.name}</Text>
            </View>
        )
      }} 
      click={() => {
        this.selectSport(sport.value)
        this.setState({sport:sport.value})
      }}
      color={'transparent'}
      style={[styles.cardSports,styleApp.center,{height:155,borderWidth:0,borderColor:colors.title,marginTop:10,borderRadius:0,marginLeft:0,width:'50%',flexDirection:'column',paddingLeft:5,paddingRight:5}]}
      onPressColor={'transparent'}

      />
      
    )
  }
  sport () {
    return (
      <FadeInView duration={200} style={{height:height}}>
        
        <View style={[styleApp.marginView,{width:width-110}]}>
          <Text style={[styleApp.title,{color:colors.title,marginBottom:10,fontSize:35,marginTop:20,fontSize:26}]}>Welcome to GameFare!</Text>
          <Text style={[styleApp.smallText,{color:colors.title,marginBottom:20,marginTop:10,fontSize:16}]}>Pick your sport, join groups and find events.</Text>
        </View>
        

        {/* <View style={styleApp.divider2}/> */}
        
        <View style={{flexDirection:'row',flexWrap: 'wrap',paddingLeft:20,paddingRight:20}}>
        {this.props.sports.map((sport,i) => (
            this.button(sport,i+1)
          ))}
        </View>
      </FadeInView>
    )
  }
  render() {
    return (
      <View style={[{borderLeftWidth:0,backgroundColor:'white',flex:1}]}>


        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.sport.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.marginTopApp}
          offsetBottom={0}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  imgBackground:{
    height:155,
    width:width/2-30,
    // position:'absolute',
    zIndex:30,
    // borderRadius:24,
    borderColor:colors.off,
    borderWidth:0,
    // borderRadius:20
  },
  cardSport:{
    marginRight:0,
    height:60,
    width:width,
    borderColor:colors.off,borderWidth:1,
    borderRadius:10,
  }
});


const  mapStateToProps = state => {
  return {
    sports:state.globaleVariables.sports.list,
  };
};

export default connect(mapStateToProps,{historicSearchAction})(InitialPage);

