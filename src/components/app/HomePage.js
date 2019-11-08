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
import AllIcons from '../layout/icons/AllIcons'
const { height, width } = Dimensions.get('screen')
import StatusBar from '@react-native-community/status-bar';

import BackButton from '../layout/buttons/BackButton'
import ListSports from './elementsHome/ListSports'
import ListGroups from './elementsHome/ListGroups'

class HomeScreen extends React.Component {
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
  render() {
    return (
      <ScrollView style={{ flex:1,backgroundColor:colors.off2}}>
        

        
        <ListSports />

        <ListEvents navigate={this.navigate.bind(this)} navigate1={(val,data) => this.props.navigation.navigate(val,data)}/>

        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>
            <Text style={styleApp.title}>Want to organize an event?</Text>
            <Text style={[styleApp.subtitle,{marginBottom:20,marginRight:30,marginTop:10}]}>Pick your sport and join the GameFare community now!</Text>
            <Button backgroundColor={'green'} onPressColor={colors.greenLight2} click={() => this.props.navigation.navigate('CreateEvent0',{'pageFrom':'Home'})} text={'Organize an event'} styleButton={{marginBottom:15,marginTop:10}} loader={false}/>
          </View>
        </View>

        <ListGroups />

        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>
            <Text style={styleApp.title}>Want to create your own community?</Text>
            <Text style={[styleApp.subtitle,{marginBottom:20,marginRight:30,marginTop:10}]}>Pick your sport, create your group and start growing your community</Text>
            <Button backgroundColor={'primary'} onPressColor={colors.primaryLight} click={() => this.props.navigation.navigate('CreateEvent0',{'pageFrom':'Home'})} text={'Create a group'} styleButton={{marginBottom:15,marginTop:10}} loader={false}/>
          </View>
        </View>

        <View style={{height:50}} />

      </ScrollView>
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
