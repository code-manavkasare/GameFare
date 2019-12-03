import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Button,
    RefreshControl,
    Animated,
    Image
} from 'react-native';
import {connect} from 'react-redux';
import firebase from 'react-native-firebase'

const { height, width } = Dimensions.get('screen')
import colors from '../style/colors'
import styleApp from '../style/style'
import sizes from '../style/sizes'
import {Grid,Row,Col} from 'react-native-easy-grid';

import AsyncImage from '../layout/image/AsyncImage'
import AllIcons from '../layout/icons/AllIcons'
import HeaderBackButton from '../layout/headers/HeaderBackButton'

import {indexGroups} from '../database/algolia'
import PlaceHolder from '../placeHolders/ListAttendees'

import DescriptionView from './elementsGroupPage/DescriptionView'
import MembersView from './elementsGroupPage/MembersView'
import PostsView from './elementsGroupPage/PostsView'
import EventsView from './elementsGroupPage/EventsView'
import ParalaxScrollView from '../layout/scrollViews/ParalaxScrollView'

class GroupPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usersConfirmed:true,
      loader:false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    // this.loadEvent(this.props.navigation.getParam('data'))
  }
  async loadEvent(data,refresh) {
    if (refresh) {
      await this.props.navigation.setParams({loader:true})
    }
    indexGroups.clearCache()
    var event = await indexGroups.getObject(data.objectID)

    await this.props.navigation.setParams({data:event,loader:false})
    return true
  }
  rowIcon (component,icon,alert,dataAlert,image) {
    console.log('Alert')
    console.log(alert)
    console.log(dataAlert)
    return (
      <TouchableOpacity style={{marginTop:20}} activeOpacity={alert!=undefined?0.7:1} onPress={() => alert!=undefined?this.props.navigation.navigate('AlertAddress',{data:dataAlert}):null}>
        <Row>
          <Col size={15} style={styleApp.center2}>
            {
              image!=undefined?
              image
              :
              <AllIcons name={icon} color={colors.grey} size={18} type='font' />
            }
          </Col>
          <Col size={85} style={styleApp.center2}>
            {component}
          </Col>
        </Row>
      </TouchableOpacity>
    )
  }
  title(text) {
    return <Text style={[styleApp.title,{fontSize:15,fontFamily:'OpenSans-Regular'}]}>{text}</Text>
  }
  groupInfo(data,sport) {
    return (
      <View style={{marginTop:-10}}>


        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>

            <Row>
              <Col size={75} style={[styleApp.center2,{paddingRight:10}]}>
                <Text style={styleApp.title}>{data.info.name}</Text>
              </Col>
              <Col size={25} style={styleApp.center3}>
                <View style={[styles.viewSport,{marginTop:5,backgroundColor:sport.card.color.color}]}>
                  <Text style={[styles.textSport,{color:'white'}]}>{data.info.sport.charAt(0).toUpperCase() + data.info.sport.slice(1)}</Text>
                </View>
              </Col>
            </Row>

            <View style={[styleApp.divider2,{marginBottom:10}]} />
            {this.rowIcon(this.title(data.location.address),'map-marker-alt','AlertAddress',data.location,<View style={[styleApp.viewNumber,styleApp.center,{backgroundColor:'white',borderWidth:0}]}>
              <AllIcons name={'map-marker-alt'} color={colors.grey} size={18} type='font' />
            </View>)}
            {this.rowIcon(this.title(data.organizer.name),'user-alt',undefined,undefined,<View style={[styleApp.viewNumber,styleApp.center,{backgroundColor:colors.grey,}]}>
              <Text style={[styleApp.text,{fontSize:10,color:'white',fontFamily:'OpenSans-Bold'}]} >{data.organizer.name.split(' ')[0][0] + data.organizer.name.split(' ')[1][0]}</Text>
            </View>)}

          </View>
        </View>

                
      </View>
    )
  }
  group(data) {
    var sport = this.props.sports.filter(sport => sport.value == data.info.sport)[0]
    console.log('group page')
    console.log(sport)
    console.log(data)
    return (
      <View style={{width:width,marginTop:0}}>


        {this.groupInfo(data,sport)}

        <DescriptionView objectID={data.objectID} loader={this.state.loader}/>
        
        <MembersView 
          data={data} 
          objectID={data.objectID} 
          userID={this.props.userID}  
          loader={this.state.loader} 
          infoUser={this.props.infoUser}
          userConnected={this.props.userConnected}
        />

        {/* <EventsView 
          data={data} 
          objectID={data.objectID} 
          userID={this.props.userID} 
          loader={this.state.loader}
          userConnected={this.props.userConnected}
          sport={sport}
          navigate={(val,data) => this.props.navigation.navigate(val,data)} 
          push={(val,data) => this.props.navigation.push(val,data)}
        /> */}

        

        <PostsView 
          objectID={data.objectID} 
          loader={this.state.loader}
          infoUser={this.props.infoUser}
          userConnected={this.props.userConnected}
        />

        <View style={{height:100}} />

      </View>
    )
  }
  conditionAdmin() {
    if (this.props.navigation.getParam('pageFrom') != 'Home' && this.props.navigation.getParam('data').info.organizer == this.props.userID && this.props.navigation.getParam('data').info.public) return true
    return false
  }
  async refresh() {
    await this.setState({loader:true})
    return this.setState({loader:false})
  }
  refreshControl() {
    return (
      <RefreshControl
        refreshing={this.state.loader}
        colors={['white']}
        progressBackgroundColor={'white'}
        tintColor='white'
        onRefresh={()=>this.refresh()} size={'small'} />
    )
  }
  render() {
    var data= this.props.allGroups[this.props.navigation.getParam('objectID')]
    return (
      <View>
      <HeaderBackButton 
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        close={() => this.props.navigation.navigate(this.props.navigation.getParam('pageFrom'))}
        textHeader={data.info.name}
        inputRange={[20,50]}
        initialTitleOpacity={0}
        initialBackgroundColor={'transparent'}
        initialBorderColorIcon={colors.grey}
        typeIcon2={'moon'}
        sizeIcon2={17}

        icon1='arrow-left'
        icon2='share'

        clickButton1 = {() => this.props.navigation.navigate(this.props.navigation.getParam('pageFrom'))}
        clickButton2={() => this.props.navigation.navigate('Contacts',{openPageLink:'openGroupPage',pageFrom:'Group',data:{...data,eventID:data.objectID}})}
        />

        <ParalaxScrollView 
        setState={(val) => this.setState(val)} 
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        image={<AsyncImage style={{width:'100%',height:280,borderRadius:0}} mainImage={data.pictures[0]} imgInitial={data.pictures[0]} />}

        content={() => this.group(data)} 
        icon1='arrow-left'
        icon2='share'
        colorRefreshControl ={colors.title}
        initialColorIcon={'white'}

        
        
      />

      </View>
      
      )
  }
}

const styles = StyleSheet.create({
  viewSport:{
    backgroundColor:colors.greenLight,
    borderRadius:3,
    paddingLeft:10,
    paddingRight:10,
    height:25,
    width:70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSport:{
    color:colors.greenStrong,
    fontSize:13,
    fontFamily: 'OpenSans-SemiBold',
  },
});


const  mapStateToProps = state => {
  return {
    sports:state.globaleVariables.sports.list,
    userID:state.user.userID,
    infoUser:state.user.infoUser.userInfo,
    userConnected:state.user.userConnected,
    allGroups:state.groups.allGroups
  };
};

export default connect(mapStateToProps,{})(GroupPage);
