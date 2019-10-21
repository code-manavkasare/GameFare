import React from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';


export default class EventPage extends React.Component {
  state={check:false}
  static getDerivedStateFromProps(props, state) {
    return state
  }
  click() {
      console.log('clck loading')
      this.props.navigation.navigate('Home')
  }
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center',backgroundColor:'white' }}>
        <Text>Event page</Text>
        <Text>{this.props.navigation.getParam('eventID')}</Text>
        <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={() => this.props.navigation.goBack()}>
            <Text style={{color:'white',fontSize:15}}>back</Text>
        </TouchableOpacity>

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
    marginTop:10
    }
  });
