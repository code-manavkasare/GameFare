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
import {historicSearchAction} from '../../../actions/historicSearchActions'


import HeaderBackButton from '../../layout/headers/HeaderBackButton'
import styleApp from '../../style/style'
import colors from '../../style/colors'
import Button from '../../layout/buttons/Button'
import ButtonColor from '../../layout/Views/Button'

import ScrollView2 from '../../layout/scrollViews/ScrollView2'
import AllIcons from '../../layout/icons/AllIcons'
const { height, width } = Dimensions.get('screen')
import StatusBar from '@react-native-community/status-bar';
import ButtonAdd from '../../app/elementsHome/ButtonAdd'


import sizes from '../../style/sizes';
import isEqual from 'lodash.isequal'

class HomeScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        events:[],
        loader:false,
        unreadMessages:3,
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
        await this.setState({loader:true,filterSports:nextProps.sportSelected})
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
    messagePageView () {
      return (
        <View style={{paddingTop:0,flex:1}}>
                <View style={{minHeight:height-sizes.heightHeaderHome-70,backgroundColor:'white'}}>
                  <View style={styleApp.marginView}>
                    <Text style={[styleApp.input,{fontSize:20}]}>Inbox</Text>
                    <Text style={[styleApp.text,{fontSize:14,color:colors.greyDark,marginTop:5}]}>You have {this.state.unreadMessages} unread messages.</Text>

                  </View>
                  
                </View>
          {/* <EventFromGroups 
            navigate={this.navigate.bind(this)} 
            navigate1={(val,data) => this.props.navigation.navigate(val,data)}
            loader={this.state.loader}
            onRef={ref => (this.eventGroupsRef = ref)} 
          />

          <ListEvents
           location={this.state.location} 
           sportSelected={this.props.sportSelected}
           search={this.state.search} 
           key={2} 
           onRef={ref => (this.listEventsRef = ref)}
           setState={(data) => this.setState(data)}
           loader={this.state.loader} 
           navigate={this.navigate.bind(this)} 
           navigate1={(val,data) => this.props.navigation.navigate(val,data)}
          />
          
          
          <View style={[styleApp.divider2,{marginLeft:20,width:width-40}]} />

          <NewGroupCard pageFrom='Home' /> */}

        </View>
      )
    }
    async refresh () {
      // this.eventGroupsRef.reload()
      // this.listEventsRef.reload()
      return true
    }
    async setLocation(data) {
      this.listEventsRef.setLocation(data)
    }
  render() {
    return (
      <View style={styleApp.stylePage}>

        <HeaderBackButton 
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        close={() => this.props.navigation.navigate(this.props.navigation.getParam('pageFrom'))}
        textHeader={'Inbox (' + this.state.unreadMessages + ')'}
        inputRange={[50,80]}
        initialBorderColorIcon={colors.grey}
        initialBackgroundColor={'transparent'}
        typeIcon2={'font'}
        sizeIcon2={17}
        initialTitleOpacity={0}
        icon1={null}
        icon2='pen-alt'

        clickButton2={() => console.log('')}
        />
        
        <ScrollView2
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.messagePageView()}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
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
          showsVerticalScrollIndicator={true}
        />

        <Animated.View style={[styleApp.voile,{opacity:this.opacityVoile,transform:[{translateX:this.translateXVoile}]}]}/>
        {/* <ButtonAdd 
        translateXVoile={this.translateXVoile}
        opacityVoile={this.opacityVoile}
        new ={(val) => {
          if (val == 'event') return this.props.navigation.navigate('CreateEvent0',{'pageFrom':'Home'})
          return this.props.navigation.navigate('CreateGroup0',{'pageFrom':'Home'})
        }}
        /> */}


        
        

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
    sports:state.globaleVariables.sports.list,
    sportSelected:state.historicSearch.sport
  };
};

export default connect(mapStateToProps,{historicSearchAction})(HomeScreen);
