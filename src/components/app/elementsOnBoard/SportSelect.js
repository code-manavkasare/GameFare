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
  async selectLeague (sport,league) {
    // write sport to redux
    console.log('on set league')
    console.log(league)
    await this.props.historicSearchAction('setLeague',league)
    this.props.navigation.navigate('LocationSelect')
  }
  isOdd(num) { return (num) % 2;}
  button(league,i,sport) {
    console.log(league)
    console.log('sport.value')
    console.log(this.props.leagueSelected)
    return (
      <ButtonColor key={i} view={() => {
        return (
            <View style={[{borderWidth:3,borderColor:league.value == this.props.leagueSelected?colors.primary:'white',borderRadius:15,width:160,height:160,overflow:'hidden',backgroundColor:colors.off}]}>

               <AsyncImage style={{position:'absolute',height:'100%',width:'100%'}} mainImage={league.img.imgSM} imgInitial={league.img.imgXS} />
               {league.img.icon!=undefined?
               <AsyncImage style={{position:'absolute',height:23,width:league.value=='usta'?26:23,right:5,top:5}} mainImage={league.img.icon} imgInitial={league.img.icon} />
               :null
                }
               <Text style={[styleApp.title,styleApp.textShade,{color:'white',fontSize:15,fontFamily:'OpenSans-SemiBold',position:'absolute',bottom:15,left:15,right:15}]}>{league.name}</Text>
            </View>
        )
      }} 
      click={() => {
        this.selectLeague(sport,league.value)
      }}
      color={'white'}
      style={{height:170,width:width/2}}
      onPressColor={colors.off2}

      />
      
    )
  }
  rowTopSport(sport) {
    return (
      <ButtonColor  view={() => {
        return (
            <Row>
              <Col size={15} style={styleApp.center}>
                <AsyncImage style={{height:45,borderRadius:22.5,width:45}} mainImage={sport.card.img.imgSM} imgInitial={sport.card.img.imgXS} />
              </Col>
              <Col size={85} style={[styleApp.center2,{paddingLeft:20}]}>
                <Text style={styleApp.input}>{sport.card.name}</Text>
              </Col>
            </Row>
        )
      }} 
      click={() => {
        // this.selectSport(sport.value)
        // this.setState({sport:sport.value})
      }}
      color={'white'}
      style={{height:55,paddingLeft:20,paddingRight:20}}
      onPressColor={colors.off}

      />
    )
  }
  sportPage (sport) {
    return (
      <FadeInView duration={200} style={{height:height}}>
        {this.rowTopSport(sport)}

        
        <View style={[styleApp.marginView]}>
          <Text style={[styleApp.input,{marginTop:20,fontSize:24}]}>Welcome to GameFare!</Text>
          <Text style={[styleApp.smallText,{color:colors.title,marginBottom:20,marginTop:10,fontSize:16}]}>Pick your league, join groups and find events. </Text>
        </View>
        

        {/* <View style={styleApp.divider2}/> */}
        
        <View style={{flexDirection:'row',flexWrap: 'wrap',paddingLeft:0,paddingRight:0,width:width}}>
        {sport.typeEvent.map((league,i) => (
            <View style={{height:170,borderColor:colors.title,width:width/2,flexDirection:'column'}}>
            {this.button(league,i+1,sport.value)}
            </View>
          ))}
          {this.button(this.props.leagueAll,8,sport.value)}
        </View>
      </FadeInView>
    )
  }
  render() {
    if (this.props.sportSelected == '') return null
    var sport = Object.values(this.props.sports).filter(sport => sport.value == this.props.sportSelected)[0]
    console.log('sport ici')
    console.log(sport)
    console.log(this.props.leagueAll)
    return (
      <View style={[{borderLeftWidth:0,backgroundColor:'white',flex:1}]}>


        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.sportPage(sport)}
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
    sportSelected:state.historicSearch.sport,
    leagueSelected:state.historicSearch.league,
    leagueAll:state.globaleVariables.leagueAll
  };
};

export default connect(mapStateToProps,{historicSearchAction})(InitialPage);

