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

import ListEvents from './elementsHome/ListEvent'
import HeaderHome from '../layout/headers/HeaderHome'
import EventFromGroups from './elementsHome/EventsFromGroups'
import styleApp from '../style/style'
import colors from '../style/colors'

import ScrollView2 from '../layout/scrollViews/ScrollView2'
const { height, width } = Dimensions.get('screen')
import StatusBar from '@react-native-community/status-bar';
import NewGroupCard from './elementsHome/NewGroupCard'
import ButtonAdd from './elementsHome/ButtonAdd'

import sizes from '../style/sizes';
import isEqual from 'lodash.isequal'

export default class HomeScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        events:[],
        loader:false,
      };
      this.translateXVoile = new Animated.Value(width)
      this.AnimatedHeaderValue = new Animated.Value(0);
      this.opacityVoile = new Animated.Value(0.3)
    }
    async componentDidMount() {
      StatusBar.setHidden(false, "slide")
      StatusBar.setBarStyle('dark-content',true)
    }
    navigate(val,data) {
      this.props.navigation.push(val,data)
    }
    async componentWillReceiveProps(nextProps) {
      if (!isEqual(this.props.sports,nextProps.sports)) {
        await this.setState({loader:true})
        this.setState({loader:false})
      }
    }
    async changeSport (val) {
      await this.setState({loader:true})
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
        <View style={{paddingTop:10}}>

          <EventFromGroups 
            navigate={this.navigate.bind(this)} 
            navigate1={(val,data) => this.props.navigation.navigate(val,data)}
            loader={this.state.loader}
            onRef={ref => (this.eventGroupsRef = ref)} 
          />

          <ListEvents
           location={this.state.location} 
           search={this.state.search} 
           key={2} 
           onRef={ref => (this.listEventsRef = ref)}
           setState={(data) => this.setState(data)}
           loader={this.state.loader} 
           navigate={this.navigate.bind(this)} 
           navigate1={(val,data) => this.props.navigation.navigate(val,data)}
          />
          
          
          {/* <View style={[styleApp.divider2,{marginLeft:20,width:width-40}]} /> */}


          <NewGroupCard pageFrom='Home' />

        </View>
      )
    }
    async refresh () {
      this.eventGroupsRef.reload()
      this.listEventsRef.reload()
      return true
    }
    async setLocation(data) {
      this.listEventsRef.setLocation(data)
    }
  render() {
    return (
      <View style={styleApp.stylePage}>

        <HeaderHome
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        close={() => this.props.navigation.navigate(this.props.navigation.getParam('pageFrom'))}
      
        textHeader={'Organize your event'}
        inputRange={[0,sizes.heightHeaderHome+0]}
        initialBorderColorIcon={colors.off}
        initialBackgroundColor={'white'}
        initialTitleOpacity={1}
        icon1='arrow-left'
        league={true}
        sports={this.props.sports}

        icon2={'map-marker-alt'}
        sizeIcon2={20}
        typeIcon2={'font'}
        clickButton2={() =>  this.props.navigation.navigate('Location',{'pageFrom':'Home',onGoBack: (data) => this.setLocation(data)})}

        clickButton1={() => this.props.navigation.navigate(this.props.navigation.getParam('pageFrom'))} 
        />
        
        <ScrollView2
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.homePageView()}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderFilter-30}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottom={0}
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
          
          offsetBottom={100}
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

