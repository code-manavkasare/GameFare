
import React, { Component,PureComponent } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Image,
  ScrollView,
  View
} from 'react-native';
import {connect} from 'react-redux';

import { Col, Row, Grid } from "react-native-easy-grid";
// import {Fonts} from '../../../../utils/Font'
import colors from '../../../style/colors'
import {timing} from '../../../animations/animations'
import PlacelHolder from '../../../placeHolders/CardEvent'
import Icon from '../../../layout/icons/icons'
import AllIcons from '../../../layout/icons/AllIcons'
import styleApp from '../../../style/style'
import NavigationService from '../../../../../NavigationService'
import {indexGroups} from '../../../database/algolia'
import AsyncImage from '../../../layout/image/AsyncImage'
import FadeInView from 'react-native-fade-in-view';

var  { height, width } = Dimensions.get('screen')
import {date,time,timeZone} from '../../../layout/date/date'

class CardGroup extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        player:false,
        backgroundColorAnimation:new Animated.Value(0),
        loader:true,
        item:{
          info:{},
        }
      };
    }
    async componentDidMount() {
      console.log('la card group monrt')
      console.log(this.props.loadData)
      if (this.props.loadData) {
        indexGroups.clearCache()
        var group = await indexGroups.getObject(this.props.item.groupID)
        return this.setState({loader:false,item:group})
      }
      return this.setState({loader:false})
    }
    async clickProduct () {
      console.log('this.props.category')
      console.log(this.props.item)
      this.props.clickGroup(this.state.item)
    }
    onPress(val) {
      if (val) return Animated.parallel([
        Animated.timing(this.state.backgroundColorAnimation,timing(300,100)),
      ]).start()
      return Animated.parallel([
        Animated.timing(this.state.backgroundColorAnimation,timing(0,100)),
      ]).start()
    }
    card (color,data) {
      if (this.state.loader)return <PlacelHolder />
      return <FadeInView duration={250}>{this.displayCard(color,data)}</FadeInView>
    }
  
    numberMember(data) {
      if (data.members != undefined) return Object.values(data.members).length
      return 0
    }
    displayCard(color,data) {
      var sport = Object.values(this.props.sports).filter(sport => sport.value == data.info.sport)[0]
      return (
        <Animated.View style={[styles.cardList,{backgroundColor:color}]}>
        
        <TouchableOpacity 
          onPress={() => {this.clickProduct()}} 
          onPressIn={() => this.onPress(true)}
          onPressOut={() => this.onPress(false)}
          style={{height:'100%',width:'100%',paddingLeft:20,paddingRight:20,paddingTop:15,paddingBottom:15}} 
          activeOpacity={1} 
        >
          <Row style={{marginBottom:5}}>
            <Col size={25} >
              {
                data.pictures!=undefined?
                <AsyncImage style={{width:'100%',height:70,borderRadius:5,borderWidth:0.6,borderColor:colors.off}} mainImage={data.pictures[0]} imgInitial={data.pictures[0]} />
                :null
              } 
            </Col>
            <Col size={85} style={[{paddingLeft:15}]}>         
              <Row>
                <Col size={65} style={[{paddingRight:110}]}>
                  <Text style={[styleApp.title,{fontSize:14}]}>{data.info.name}</Text>
                </Col>
              </Row>
              <Row style={{borderTopWidth:1,borderColor:colors.off,marginTop:10,paddingTop:10}}>
                <Col size={12} style={[{paddingRight:10},styleApp.center2]}>
                  <View style={[styles.viewNumber,styleApp.center,{backgroundColor:colors.primaryLight,}]}>
                    <Text style={[styleApp.text,{fontSize:10,color:'white',fontFamily:'OpenSans-Bold'}]} >{this.numberMember(data)}</Text>
                  </View>
                </Col>

                {
                data.members != undefined?
                <Col size={20} style={[{paddingRight:10},styleApp.center2]}>
                    {Object.values(data.members).map((member,i) => (
                    <View style={[styles.viewNumber,styleApp.center,{position:'absolute',left:i*16}]}>
                      <Text style={[styleApp.text,{fontSize:10,fontFamily:'OpenSans-Bold'}]} >{member.info.name.split(' ')[0][0] + member.info.name.split(' ')[1][0]}</Text>
                    </View>
                    ))
                    }
                </Col>
                :null
                }
                <Col size={70} style={styleApp.center2}>
                  <Text style={[styleApp.smallText,{fontFamily:'OpenSans-SemiBold',fontSize:11}]}>Person coming</Text>
                </Col>
              </Row>              
            </Col>

          </Row>

          <View style={[styles.viewSport,{backgroundColor:sport.card.color.backgroundColor,position:'absolute',right:20,top:12}]}>
            <Text style={[styles.textSport,{color:sport.card.color.color}]}>{data.info.sport.charAt(0).toUpperCase() + data.info.sport.slice(1)}</Text>
          </View>

          <View style={[styleApp.center,{position:'absolute',top:12,right:80,height:25,width:35}]}>
            {
            this.props.item.organizer?
            <AllIcons name='bullhorn' type='font' color={colors.blue} size={15} />
            :!this.props.item.organizer && (this.props.item.status == 'confirmed' || !data.info.public)?
            null
            :!this.props.item.organizer && this.props.item.status == 'rejected'?
            <AllIcons name='close' type='mat' color={colors.primary} size={15} />
            :!this.props.item.organizer?
            <AllIcons name='clock' type='font' color={colors.secondary} size={15} />
            :null
            }
            </View>

        </TouchableOpacity>

      </Animated.View>
      )
    }
  render() {
    var color = this.state.backgroundColorAnimation.interpolate({
      inputRange: [0, 300],
      outputRange: ['white', colors.off]
    });
    console.log('render')
    console.log(this.state.item)
    console.log(this.props.data)
    console.log(this.props.loadData)
    return (
      this.card(color,this.props.loadData?this.state.item:this.props.data)
    );
  }
}

const styles = StyleSheet.create({
  cardList:{
    flex:1,
    marginTop:0,
    //width: '48%',
    width:'100%',
    //borderTopWidth:0.3,
    //borderRightWidth:0.3,
    borderColor:colors.borderColor,
  },
  center:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2:{
    //alignItems: 'center',
    justifyContent: 'center',
  },
  viewSport:{
    backgroundColor:colors.greenLight,
    borderRadius:3,
    paddingLeft:10,
    paddingRight:10,
    //top:15,
    //right:0,
    height:25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewNumber:{
    height:27,width:27,borderRadius:13.5,backgroundColor:colors.off2,borderColor:colors.off,borderWidth:0.7
  },
  textSport:{
    color:colors.greenStrong,
    fontSize:11,
    fontFamily: 'OpenSans-SemiBold',
  },
  textPrice:{
    color:colors.primary,
    fontSize:18,
    fontFamily: 'OpenSans-Bold',
  },
  title:{
    color:colors.title,
    fontSize:17,
    fontFamily: 'OpenSans-Bold',
  },
  subtitle:{
    color:colors.subtitle,
    fontSize:14,
    fontFamily: 'OpenSans-Regular',
  },
});

const  mapStateToProps = state => {
  return {
    sports:state.globaleVariables.sports.list,
  };
};

export default connect(mapStateToProps,{})(CardGroup);



