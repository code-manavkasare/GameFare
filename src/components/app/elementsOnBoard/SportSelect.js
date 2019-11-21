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
  selectSport (sport) {
    // write sport to redux
    this.props.navigation.navigate('LocationSelect')
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
              <Text style={[styleApp.title,{color:colors.title,fontSize:15,fontFamily:'OpenSans-SemiBold'}]}>{sport.card.name}</Text>
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
      color={'white'}
      style={[styles.cardSports,{height:60,borderBottomWidth:0.3,borderColor:colors.grey,marginTop:0,borderRadius:0,marginLeft:0,width:width}]}
      onPressColor={colors.off}

      />
    )
  }
  sport () {
    return (
      <FadeInView duration={200} style={[{height:height,paddingTop:sizes.marginTopApp}]}>
        
        <View style={styleApp.marginView}>
          <Text style={[styleApp.title,{color:colors.darkGrey,marginBottom:10,fontSize:35,marginTop:20}]}>Welcome to GameFare!</Text>
          {/* <View style={styleApp.center}>
          <Image source={require('../../../img/images/shoes.png')} style={{height:90,width:90}} />
         </View> */}
          <Text style={[styleApp.smallText,{color:colors.title,marginBottom:20,marginTop:10,fontSize:16}]}>Which sport do you wish to practice?</Text>
        </View>
        

        {/* <View style={styleApp.divider2}/> */}

        {this.props.sports.map((sport,i) => (
            this.button(sport,i+1)
          ))}
        
      </FadeInView>
    )
  }
  render() {
    return (
      <View style={[{borderLeftWidth:0,backgroundColor:'white',height:height}]}>


        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.sport.bind(this)}
          marginBottomScrollView={0}
          marginTop={0}
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

export default connect(mapStateToProps,{globaleVariablesAction})(InitialPage);

