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

import AllIcons from '../../../layout/icons/AllIcons'
import BackButton from '../../../layout/buttons/BackButton'
import Button from '../../../layout/buttons/Button'
import CardEvent from './CardEvent'
import SwiperLogout from '../elementsProfile/SwiperLogout'
import Swiper from 'react-native-swiper'
import FadeInView from 'react-native-fade-in-view';
import NewEventCard from '../../elementsHome/NewEventCard'

import sizes from '../../../style/sizes'
import styleApp from '../../../style/style'
import colors from '../../../style/colors';

class ListEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader:true,
      events:[],
      organizer:false,
      index:0
    };
    this.events = this.events.bind(this)
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Events',
      headerStyle:styleApp.styleHeader,
      headerTitleStyle: styleApp.textHeader,
      // headerLeft: () => <BackButton name='home' type='mat' size={20} click={() => navigation.navigate('Home')} />,
      headerRight: () => <BackButton color={colors.primary} name='add' type='mat' click={() => navigation.navigate('CreateEvent0',{'pageFrom':'ListEvents'})}/>,
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
  async loadEvents(userID) {
    var that = this
    firebase.database().ref('usersEvents/' + userID).on('value', function(snapshot) {
      console.log('on charge les match !!!!!!!')
      that.setState({loader:true})
      var events = []
      snapshot.forEach(function(childSnapshot) {
        var event = childSnapshot.val()
        event.objectID = childSnapshot.key
        events.push(event)
      });
      that.setState({events:events,loader:false})
    })
  }
  events () {
    return (
      <View style={{flex:1,marginLeft:-20,width:width}}>
        {this.listEvent()}
      </View>
    )
  }
  listEvent() {
    return (
      <View>
        <View style={[styleApp.viewHome]}>
          <View style={styleApp.marginView}>
            <Text style={[styleApp.title,{marginBottom:15,marginLeft:0}]}>My events</Text>
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
              Object.values(this.state.events).length == 0?
              this.eventsLogout()
              :
              Object.values(this.state.events).reverse().map((event,i) => (
                <CardEvent userID={this.props.userID} key={i} homePage={true} marginTop={25} navigate={(val,data) => this.props.navigation.navigate(val,data)} clickEvent={(event) => this.props.navigation.push('Event',{data:event,pageFrom:'ListEvents',loader:true})} item={event}/>
              ))
            }
          </FadeInView>
        }
        </View>

        <NewEventCard pageFrom='ListEvents' />
      </View>
    )
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
      <View style={[styleApp.marginView,{paddingTop:20}]}>
      <SwiperLogout type={'events'}/>

      <View style={{height:20}} />
      <Button text='Create your event' click={() => this.props.navigation.navigate('CreateEvent0',{pageFrom:'ListEvents'})} backgroundColor={'blue'} onPressColor={colors.blueLight}/>
      <View style={{height:10}} />
      <Button text='Join sessions' click={() => this.props.navigation.navigate('Home',{pageFrom:'ListEvents'})} backgroundColor={'secondary'} onPressColor={colors.secondary}/>
      <View style={{height:10}} />
      {
      !this.props.userConnected?
      <Button text='Sign in' click={() => this.props.navigation.navigate('Phone',{pageFrom:'ListEvents'})} backgroundColor={'green'} onPressColor={colors.greenClick}/>
      :null
      }
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
  render() {
    return (
      <View style={{flex:1,paddingTop:0 }}>
        <ScrollView
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.listEvent()}
          marginBottomScrollView={0}
          marginTop={0}
          colorRefresh={colors.primary}
          refreshControl={true}
          refresh={() => this.refresh()}
          offsetBottom={60}
          showsVerticalScrollIndicator={true}
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

