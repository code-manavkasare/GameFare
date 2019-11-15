
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
        item:{}
      };
    }
    async componentDidMount() {
      indexGroups.clearCache()
      var group = await indexGroups.getObject(this.props.item.groupID)
      console.log('event!!!!!!@wqadjksfslf')
      console.log(group)
      this.setState({loader:false,item:group})
    }
    async clickProduct () {
      console.log('this.props.category')
      console.log(this.props.item)
      this.props.clickGroup(this.state.item)
    }
    closeAlert() {
      console.log('close alert!')
      this.props.navigate('ListEvents',{})
    }
    onPress(val) {
      if (val) return Animated.parallel([
        Animated.timing(this.state.backgroundColorAnimation,timing(300,100)),
      ]).start()
      return Animated.parallel([
        Animated.timing(this.state.backgroundColorAnimation,timing(0,100)),
      ]).start()
    }
    card (color) {
      if (this.state.loader)return <PlacelHolder />
      return <FadeInView duration={250}>{this.displayCard(color)}</FadeInView>
    }
    displayCard(color) {
      var sport = Object.values(this.props.sports).filter(sport => sport.value == this.state.item.info.sport)[0]
      return (
        <Animated.View style={[styles.cardList,{backgroundColor:color}]}>
        
        <TouchableOpacity 
          onPress={() => {this.clickProduct()}} 
          onPressIn={() => this.onPress(true)}
          onPressOut={() => this.onPress(false)}
          style={{height:'100%',width:'100%',paddingLeft:20,paddingRight:20,paddingTop:30,paddingBottom:20}} 
          activeOpacity={1} 
        >
          <Row style={{marginBottom:5}}>
            <Col size={25} style={styleApp.center2}>
              {
                this.state.item.pictures!=undefined?
                <AsyncImage style={{width:'100%',height:70,borderRadius:6}} mainImage={this.state.item.pictures[0]} imgInitial={this.state.item.pictures[0]} />
                :null
              } 
            </Col>
            <Col size={85} style={[styleApp.center2,{paddingLeft:15}]}>
              
              <Row>
                <Col size={65} style={[styleApp.center2,{paddingRight:10}]}>
                  <Text style={[styleApp.title,{fontSize:19}]}>{this.state.item.info.name}</Text>
                </Col>
                <Col size={10} style={styleApp.center2} >
                  {
                  this.props.item.organizer?
                  <AllIcons name='bullhorn' type='font' color={colors.blue} size={15} />
                  :!this.props.item.organizer && (this.props.item.status == 'confirmed' || !this.state.item.info.public)?
                  <AllIcons name='check' type='mat' color={colors.green} size={15} />
                  :!this.props.item.organizer && this.props.item.status == 'rejected'?
                  <AllIcons name='close' type='mat' color={colors.primary} size={15} />
                  :!this.props.item.organizer?
                  <AllIcons name='clock' type='font' color={colors.secondary} size={15} />
                  :null
                  }
                </Col>
                <Col size={25} style={styleApp.center2}>
                  <View style={[styles.viewSport,{backgroundColor:sport.card.color.backgroundColor}]}>
                    <Text style={[styles.textSport,{color:sport.card.color.color}]}>{this.state.item.info.sport.charAt(0).toUpperCase() + this.state.item.info.sport.slice(1)}</Text>
                  </View>
                </Col>
              </Row>
              {/* <Text style={[styles.subtitle,{fontSize:12}]}>{this.state.item.location.address}</Text> */}
              <Text style={[styles.subtitle,{fontSize:12,marginBottom:10,marginTop:5}]}>Created by {this.state.item.organizer.name}</Text>
            </Col>

          </Row>

        </TouchableOpacity>

      </Animated.View>
      )
    }
  render() {
    var color = this.state.backgroundColorAnimation.interpolate({
      inputRange: [0, 300],
      outputRange: ['white', colors.off]
    });
    return (
      this.card(color)
    );
  }
}

const styles = StyleSheet.create({
  cardList:{
    flex:1,
    marginTop:0,
    //width: '48%',
    width:'100%',
    borderTopWidth:0.3,
    borderRightWidth:0.3,
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



