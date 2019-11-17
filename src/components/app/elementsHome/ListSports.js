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
import Button from '../../layout/Views/Button'
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
        <View style={[styleApp.marginView,{width:width-40}]}>
        <Text style={[styleApp.title,{marginBottom:0}]}>Our sports</Text>

        <View style={styleApp.divider2} />
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {this.props.sports.map((sport,i) => (
            <Button view={() => {
              return (
                <View style={styleApp.center4}>
                  <AsyncImage style={styles.imgBackground} mainImage={sport.card.img.imgSM} imgInitial={sport.card.img.imgXS} />
                  <View style={[styleApp.viewSport,{marginTop:10,backgroundColor:sport.card.color.backgroundColor}]}>
                    <Text style={[styleApp.textSport,{color:sport.card.color.color}]}>{sport.card.name}</Text>
                  </View>
                </View>
              )
            }} 
            click={() => console.log('')}
            color='white'
            style={[styleApp.center,styles.cardSport]}
            onPressColor={colors.off}
            />
            
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
    height:70,
    width:70,
    borderRadius:40,
    borderColor:colors.off,
    borderWidth:1,
  },
  cardSport:{
    // backgroundColor:'red',
    marginRight:10,
    height:130,
    borderRadius:5,
    width:80
  }
});

const  mapStateToProps = state => {
  return {
    sports:state.globaleVariables.sports.list
  };
};

export default connect(mapStateToProps,{})(ListEvents);
