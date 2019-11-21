import React from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
    Image,
    TextInput,
    ScrollView,
} from 'react-native';

import firebase from 'react-native-firebase'
import {connect} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

const { height, width } = Dimensions.get('screen')
import colors from '../../style/colors'
import sizes from '../../style/sizes'
import styleApp from '../../style/style'
import { Col, Row, Grid } from "react-native-easy-grid";
import indexEvents from '../../database/algolia'
import FadeInView from 'react-native-fade-in-view';
import PlaceHolder from '../../placeHolders/ListEvents'
import CardEvent from './CardEvent'
import Button from '../../layout/Views/Button'
import AsyncImage from '../../layout/image/AsyncImage'
import AllIcons from '../../layout/icons/AllIcons'

class ListEvents extends React.Component {
  state={
    events:[],
    loader:true,
    sport:this.props.sports[0],
    heightView:new Animated.Value(210)
  }
  async componentDidMount() {
    this.loadEvent()
  }
  async loadEvent() {

  }
  borderCard(sport) {
    if (this.props.filterSports == sport.value) return {
      borderWidth:4,borderColor:sport.card.color.color
    }
    return {}
  }
  imageAll() {
    // 
    return <View style={{height:30,width:30,backgroundColor:'red'}}></View>
  }
  button(sport,i) {
    console.log(sport.value)
    console.log('sport.value')
    return (
      
      <Button key={i} view={() => {
        return (
          <Animated.View style={[styles.cardSport,styleApp.center,{height:140}]}>
             {
               sport.value ==''?
               <Image style={[styles.imgBackground,{height:80,width:80}]} source={require('../../../img/images/allSport.png')} />
               :
               <AsyncImage style={styles.imgBackground} mainImage={sport.card.img.imgSM} imgInitial={sport.card.img.imgXS} />
             }
            
            
            <LinearGradient start={{ x: 0.4, y: 0 }} end={{ x: 0, y: 1 }}   colors={['transparent', colors.grey]} style={{position:'absolute',height:180,zIndex:30,width:110}} /> 

            <View style={{position:'absolute',bottom:10,width:'100%',zIndex:40,left:20}} >
              <Text style={[styleApp.title,{color:'white',fontSize:12,fontFamily:'OpenSans-Bold'}]}>{sport.card.name}</Text>
            </View>

          </Animated.View>
        )
      }} 
      click={() => {
        this.props.changeSport(sport.value)
        this.setState({sport:sport})
      }}
      color='white'
      style={[styleApp.center,styles.cardSport,this.borderCard(sport),{marginRight:10,height:140}]}
      onPressColor={'white'}
      />
    )
  }
  sports () {
    const AnimateHeight = this.props.AnimatedHeaderValue.interpolate(
      {
          inputRange: [ -50, 0 ],
          outputRange: [ 160, 140 ],
          extrapolate: 'clamp'
    });
    return (
        <Animated.View style={[styleApp.marginView,{width:width-40}]}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{marginLeft:-20,width:width,paddingLeft:20,paddingRight:20}}>
      
          
          {this.button({
            value:'',
            card:{
              name:'All',
              value:'',
              color:{
                color:colors.grey
              },
              img:{
                imgSM:'',
                imgXS:'',
              }
            }
          },0)}
          
      
          {this.props.sports.map((sport,i) => (
            this.button(sport,i+1)
          ))}
          <View style={{width:30}}/>
        </ScrollView>   
        </Animated.View>       
    )
  }
  render() {
    
    return this.sports()
  }
}

const styles = StyleSheet.create({
  text:{
    fontFamily:'OpenSans-SemiBold',
    color:colors.title
  },
  imgBackground:{
    height:140,
    width:110,
    // borderRadius:24,
    borderColor:colors.off,
    borderWidth:0,
  },
  cardSport:{
    // backgroundColor:'red',
    marginRight:0,
    shadowColor: '#46474B',
      shadowOffset: { width: 2, height: 0 },
      shadowRadius: 20,
      shadowOpacity: 0.3,
    overflow:'hidden',
    height:130,
    // marginRight:10,
    borderRadius:10,
    width:110
  }
});

const  mapStateToProps = state => {
  return {
    sports:state.globaleVariables.sports.list
  };
};

export default connect(mapStateToProps,{})(ListEvents);
