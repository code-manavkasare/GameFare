import React from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
    ScrollView
} from 'react-native';
import {connect} from 'react-redux';

import firebase from 'react-native-firebase'
import ListEvents from './elementsHome/ListEvent'
import styleApp from '../style/style'
import colors from '../style/colors'
import Button from '../layout/buttons/Button'
import ScrollView2 from '../layout/scrollViews/ScrollView2'
import AllIcons from '../layout/icons/AllIcons'
const { height, width } = Dimensions.get('screen')
import StatusBar from '@react-native-community/status-bar';
import NewEventCard from './elementsHome/NewEventCard'
import NewGroupCard from './elementsHome/NewGroupCard'

import BackButton from '../layout/buttons/BackButton'
import ListSports from './elementsHome/ListSports'

class HomeScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        events:[],
        loader:false,
        location:{
          address:'Los Angeles, California',
          lat:34.052235,
          lng:-118.243683
        },
        search:{
          aroundLatLng: '34.052235'+','+'-118.243683',
          aroundRadius: 20*1000,
          // filters:'info.sport:' + 'tennis' + ' OR info.sport:' + 'soccer' + " ",
          query:'',
          // sports:[],
        }
      };
    }
    static navigationOptions = ({ navigation }) => {
      return {
        title: 'Organize your event',
        headerStyle: styleApp.styleHeader,
        headerTitleStyle: styleApp.textHeader,
        headerTitle: () => <Image
            source={require('../../img/logos/logoXSPrimary.png')}
            style={{ width: 30, height: 30,marginTop:-10 }}
          />,
        headerRight: () => (
          <BackButton name="add" type='mat' color={colors.primary} click={() =>  navigation.navigate('CreateEvent0',{'pageFrom':'Home'})}/>
        ),
      }
    };
    async componentDidMount() {
        console.log('lalalala')
        firebase.messaging().subscribeToTopic('allUsers');
    }
    navigate(val,data) {
      this.props.navigation.push(val,data)
    }
    homePageView () {
      return (
        <View >
          <ListSports key={0}/>



          <ListEvents
           location={this.state.location} 
           search={this.state.search} 
           key={2} 
           setState={(data) => this.setState(data)}
           loader={this.state.loader} 
           navigate={this.navigate.bind(this)} 
           navigate1={(val,data) => this.props.navigation.navigate(val,data)}
          />

          <NewEventCard pageFrom='Home' />
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
        
        <ScrollView2
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.homePageView()}
          marginBottomScrollView={0}
          marginTop={0}
          colorRefresh={colors.primary}
          stickyHeaderIndices={[3]}
          refreshControl={true}
          refresh={() => this.refresh()}
          offsetBottom={50}
          showsVerticalScrollIndicator={false}
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
    }
});

const  mapStateToProps = state => {
  return {
    globaleVariables:state.globaleVariables
  };
};

export default connect(mapStateToProps,{})(HomeScreen);
