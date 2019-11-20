import React from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
    ScrollView,
    Animated
} from 'react-native';
import {connect} from 'react-redux';

import firebase from 'react-native-firebase'
import ListEvents from './elementsHome/ListEvent'
import EventFromGroups from './elementsHome/EventsFromGroups'
import styleApp from '../style/style'
import colors from '../style/colors'
import Button from '../layout/buttons/Button'
import ButtonColor from '../layout/Views/Button'
import ScrollView2 from '../layout/scrollViews/ScrollView2'
import AllIcons from '../layout/icons/AllIcons'
const { height, width } = Dimensions.get('screen')
import StatusBar from '@react-native-community/status-bar';
import NewEventCard from './elementsHome/NewEventCard'
import NewGroupCard from './elementsHome/NewGroupCard'
import ButtonAdd from './elementsHome/ButtonAdd'

import BackButton from '../layout/buttons/BackButton'
import ListSports from './elementsHome/ListSports'
import sizes from '../style/sizes';
import isEqual from 'lodash.isequal'

class HomeScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        events:[],
        loader:false,
        filterSports:this.props.sports[0].value
      };
      this.translateXVoile = new Animated.Value(width)
      this.AnimatedHeaderValue = new Animated.Value(0);
      this.opacityVoile = new Animated.Value(0.3)
    }
    async componentDidMount() {
    }
    navigate(val,data) {
      this.props.navigation.push(val,data)
    }
    async componentWillReceiveProps(nextProps) {
      if (!isEqual(this.props.sports,nextProps.sports)) {
        await this.setState({loader:true,filterSports:nextProps.sports[0].value})
        this.setState({loader:false})
      }
    }
    async changeSport (val) {

      await this.setState({loader:true,filterSports:val})
      var that = this
      setTimeout(function(){
        that.setState({loader:false})
      }, 400);   
    }
    getAnimateHeader() {
      return this.scrollViewRef.getAnimateHeader()
    }
    homePageView () {
      return (
        <View style={{paddingTop:20}}>
          <ListSports 
          changeSport={this.changeSport.bind(this)}
          loader={this.state.loader} 
          filterSports={this.state.filterSports}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          />

          <EventFromGroups 
            navigate={this.navigate.bind(this)} 
            navigate1={(val,data) => this.props.navigation.navigate(val,data)}
            loader={this.state.loader} 
          />

          <ListEvents
           location={this.state.location} 
           filterSports={this.state.filterSports}
           search={this.state.search} 
           key={2} 
           setState={(data) => this.setState(data)}
           loader={this.state.loader} 
           navigate={this.navigate.bind(this)} 
           navigate1={(val,data) => this.props.navigation.navigate(val,data)}
          />
          
          
          <View style={[styleApp.divider2,{marginLeft:20,width:width-40}]} />

          <NewEventCard pageFrom='Home' />
          <View style={[styleApp.divider2,{marginLeft:20,width:width-40}]} />
          <NewGroupCard pageFrom='Home' />

        </View>
      )
    }
    async refresh () {
      await this.setState({loader:true})
      var that = this
      setTimeout(function(){
        that.setState({loader:false})
      }, 400);   
    }
    
  render() {
    return (
      <View style={{ flex:1,backgroundColor:'white'}}>

        

        <View style={{height:sizes.marginTopApp}} />
        
        <ScrollView2
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.homePageView()}
          marginBottomScrollView={sizes.marginTopApp}
          marginTop={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottom={sizes.marginTopApp}
          colorRefresh={colors.title}
          stickyHeaderIndices={[3]}
          refreshControl={true}
          refresh={() => this.refresh()}

          initialColorIcon={colors.title}
          // header={{
          //   on:false,
            
          // }}
          icon1={'plus'}
          clickButton1={() =>  this.props.navigation.navigate('CreateEvent0',{'pageFrom':'Home'})}

          offsetBottom={70}
          showsVerticalScrollIndicator={false}
        />

        <Animated.View style={[styleApp.voile,{opacity:this.opacityVoile,transform:[{translateX:this.translateXVoile}]}]}/>
        <ButtonAdd 
        translateXVoile={this.translateXVoile}
        opacityVoile={this.opacityVoile}
        new ={(val) => {
          if (val == 'event') return this.props.navigation.navigate('CreateEvent0',{'pageFrom':'Home'})
          return this.props.navigation.navigate('CreateGroup0',{'pageFrom':'Home'})
        }}
        />


        
        

      </View>
    );
  }
}

const styles = StyleSheet.create({
    button:{
        height:40,width:120,
        backgroundColor:'blue',
        alignItems: 'center',
        justifyContent: 'center',
    },
    voile:{
      position:'absolute',height:height,backgroundColor:colors.title,width:width,opacity:0.4,
      // zIndex:220,
    }
    
});

const  mapStateToProps = state => {
  return {
    sports:state.globaleVariables.sports.list
  };
};

export default connect(mapStateToProps,{})(HomeScreen);
