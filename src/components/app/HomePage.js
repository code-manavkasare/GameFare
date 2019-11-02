import React from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image
} from 'react-native';

import firebase from 'react-native-firebase'
import HeaderHome from './elementsHome/HeaderHome'
import FooterHome from './elementsHome/FooterHome'
import FooterHomeProfile from './elementsHome/FooterHomeProfile'
import ListEvents from './elementsHome/ListEvent'
import styleApp from '../style/style'
import colors from '../style/colors'
import ButtonRound from '../layout/buttons/ButtonRound'
import AllIcons from '../layout/icons/AllIcons'
const { height, width } = Dimensions.get('screen')
import StatusBar from '@react-native-community/status-bar';

import BackButton from '../layout/buttons/BackButton'

export default class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Organize your event',
      headerStyle: {
          backgroundColor: colors.primary,
          borderBottomWidth:0
      },
      headerTitleStyle: {
          color:'white',
          fontFamily:'OpenSans-Bold',
          fontSize:14,
      },
      headerTitle: () => <Image
          source={require('../../img/logos/logoXS.png')}
          style={{ width: 30, height: 30,marginTop:-10 }}
        />,
      headerRight: () => (
        <BackButton name="add" type='mat' click={() =>  navigation.navigate('CreateEvent1',{'pageFrom':'Home'})}/>
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
      <View style={{ flex:1}}>
        <ListEvents navigate={this.navigate.bind(this)} navigate1={(val,data) => this.props.navigation.navigate(val,data)}/>
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
