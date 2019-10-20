import React from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';


export default class LoadingScreen extends React.Component {
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
        <Text>LoadingScreen Screen</Text>
        <Text>{this.props.navigation.getParam('message')}</Text>
        <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={() => this.click()}>
            <Text style={{color:'white',fontSize:15}}>Click me</Text>
        </TouchableOpacity>
        <TouchableOpacity
        style={styles.button}
          title="Go to Details... again"
          onPress={() =>
            this.props.navigation.push('Loading', {
              message: Math.floor(Math.random() * 100),
            })
          }
        >
          <Text style={{color:'white',fontSize:15}}>Click me 222</Text>
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
