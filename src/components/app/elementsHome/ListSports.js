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

const { height, width } = Dimensions.get('screen')
import colors from '../../style/colors'
import sizes from '../../style/sizes'
import styleApp from '../../style/style'
import { Col, Row, Grid } from "react-native-easy-grid";
import indexEvents from '../../database/algolia'
import FadeInView from 'react-native-fade-in-view';
import PlaceHolder from '../../placeHolders/ListEvents'
import CardEvent from './CardEvent'
import Button from '../../layout/buttons/Button'
import AsyncImage from '../../layout/image/AsyncImage'
import AllIcons from '../../layout/icons/AllIcons'

class ListEvents extends React.Component {
  state={
    events:[],
    loader:true
  }
  async componentDidMount() {
    this.loadEvent()
  }
  async loadEvent() {

  }
  sports () {
    return (
      <View duration={350} style={styleApp.viewHome}>
        <View style={styleApp.marginView}>
        <Text style={[styleApp.title,{marginBottom:0}]}>Our sports</Text>

        <View style={styleApp.divider2} />
        <ScrollView horizontal={true}>
          {this.props.sports.map((sport,i) => (
            <TouchableOpacity activeOpacity={1} style={[styleApp.center,styles.cardSport]}>
              <AsyncImage style={styles.imgBackground} mainImage={sport.card.img.imgSM} imgInitial={sport.card.img.imgXS} />
              <Text style={[styleApp.smallText,{fontFamily:'OpenSans-SemiBold',marginTop:10}]}>{sport.card.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>   
        </View>       
      </View>
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
    height:80,
    width:80,
    borderRadius:40,
    
  },
  cardSport:{
    // backgroundColor:'red',
    marginRight:10,
    height:110,
    width:90
  }
});

const  mapStateToProps = state => {
  return {
    sports:state.globaleVariables.sports.list
  };
};

export default connect(mapStateToProps,{})(ListEvents);
