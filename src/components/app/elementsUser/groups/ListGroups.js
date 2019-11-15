import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,TextInput,
    Animated,
    //ScrollView,
    Image
} from 'react-native';
import {connect} from 'react-redux';
const { height, width } = Dimensions.get('screen')
import firebase from 'react-native-firebase'
import { Col, Row, Grid } from "react-native-easy-grid";
import FontIcon from 'react-native-vector-icons/FontAwesome';
import PlaceHolder from '../../../placeHolders/CardEvent'
import Header from '../../../layout/headers/HeaderButton'
import ScrollView from '../../../layout/scrollViews/ScrollView2'
import Switch from '../../../layout/switch/Switch'
import FadeInView from 'react-native-fade-in-view';
import NewGroupCard from '../../elementsHome/NewGroupCard'

import AllIcons from '../../../layout/icons/AllIcons'
import BackButton from '../../../layout/buttons/BackButton'
import Button from '../../../layout/buttons/Button'
import CardGroup from './CardGroup'
import SwiperLogout from '../elementsProfile/SwiperLogout'

import sizes from '../../../style/sizes'
import styleApp from '../../../style/style'
import colors from '../../../style/colors';

import ListGroupsSearch from './SearchGroups/ListGroups' 

class ListEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader:true,
      groups:[],
      organizer:false,
      index:0,
    };
    this.events = this.events.bind(this)
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Groups',
      headerStyle:styleApp.styleHeader,
      headerTitleStyle: styleApp.textHeader,
      // headerLeft: () => <BackButton name='home' type='mat' size={20} click={() => navigation.navigate('Home')} />,
      headerRight: () => <BackButton color={colors.primary} name='add' type='mat' click={() => navigation.navigate('CreateGroup0',{'pageFrom':'ListGroups'})}/>,
    }
  };
  async componentDidMount() {
    if (this.props.userConnected) this.loadEvents(this.props.userID)
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.userConnected == true && this.props.userConnected == false) {
      console.log('list events now connected')
      this.loadEvents(nextProps.userID)
    }
  }
  loadEvents(userID) {
    var that = this
    firebase.database().ref('usersGroups/' + userID).on('value', function(snapshot) {
      console.log('on charge les match !!!!!!!')
      that.setState({loader:true})
      var groups = []
      snapshot.forEach(function(childSnapshot) {
        var group = childSnapshot.val()
        group.objectID = childSnapshot.key
        groups.push(group)
      });
      that.setState({groups:groups,loader:false})
    })
  }
  events () {
    return (
      <View style={{flex:1}}>
        {this.listEvent('join')}
      </View>
    )
  }
  listEvent() {
    return (
      <View>
        <View style={[styleApp.viewHome]}>
          <View style={styleApp.marginView}>
            <Text style={[styleApp.text,{marginBottom:15,marginLeft:0}]}>My groups</Text>
          </View>
          { 
          !this.props.userConnected?
          this.eventsLogout()
          :this.state.loader?
          <View>
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
          </View>
          :
          <FadeInView duration={350}>
            {
              Object.values(this.state.groups).length == 0?
              this.eventsLogout()
              :
              Object.values(this.state.groups).reverse().map((event,i) => (
                <CardGroup userID={this.props.userID} key={i} homePage={true} marginTop={25} navigate={(val,data) => this.props.navigation.navigate(val,data)} clickGroup={(event) => this.props.navigation.push('Group',{data:event,pageFrom:'ListGroups',loader:true})} item={event}/>
              ))
            }
          </FadeInView>
        }
        </View>
      </View>
    )
  }
  async close () {
    await firebase.database().ref('usersEvents/' + this.props.userID).off()
    this.props.navigation.navigate('Home')
  }
  rowCheck (text) {
    return (
      <Row style={{height:30}}>
        <Col size={10} style={styleApp.center2}>
          <AllIcons name='check' type='mat' size={17} color={colors.grey} />
        </Col>
        <Col size={90}  style={styleApp.center2}>
          <Text style={[styleApp.text,{fontSize:14,fontFamily:'OpenSans-Regular'}]}>{text}</Text>
        </Col>
      </Row>
    )
  }
  eventsLogout() {
    return (
      <View style={styleApp.marginView}>
      <SwiperLogout type={'groups'}/>

      <View style={{height:20}} />
      <Button text='Create your group' click={() => this.props.navigation.navigate('CreateGroup0',{pageFrom:'ListGroups'})} backgroundColor={'primary'} onPressColor={colors.primary2}/>
      <View style={{height:10}} />
      {
      !this.props.userConnected?
      <Button text='Sign in' click={() => this.props.navigation.navigate('Phone',{pageFrom:'ListGroups'})} backgroundColor={'green'} onPressColor={colors.greenClick}/>
      :null
      }
      <View style={{height:20}} />
      </View>
    )
  }
  async refresh() {
    await this.setState({loader:true})
    var that = this
    setTimeout(function(){
      that.setState({loader:false})
    }, 150)
  }
  listGroups() {
    //this.props.userConnected || (Object.values(this.state.groups).length != 0 && !this.state.loader)?this.events():this.eventsLogout()
    return (
      <View>
      {this.listEvent()}

        <ListGroupsSearch 
            location={this.state.location} 
            search={this.state.search} 
            setState={(data) => this.setState(data)}
            loader={this.state.loader}
        />

        <NewGroupCard pageFrom='ListGroups' />
      </View>
    )
  }
  render() {
    return (
      <View style={{flex:1,paddingTop:10 }}>
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.listGroups()}
          marginBottomScrollView={0}
          marginTop={-10}
          refreshControl={true}
          colorRefresh={colors.title}
          refresh={() => this.refresh()}
          offsetBottom={90}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({

});

const  mapStateToProps = state => {
  return {
    userID:state.user.userID,
    userConnected:state.user.userConnected
  };
};

export default connect(mapStateToProps,{})(ListEvent);

