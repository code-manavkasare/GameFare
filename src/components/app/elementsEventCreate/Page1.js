import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated
} from 'react-native';

const { height, width } = Dimensions.get('screen')
import Header from '../../layout/headers/HeaderButton'
import ButtonRound from '../../layout/buttons/ButtonRound'
import ScrollView from '../../layout/scrollViews/ScrollView'
import sizes from '../../style/sizes'
import StatusBar from '@react-native-community/status-bar';
// import Animated from 'react-native-reanimated';

export default class LoadingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.translateYFooter = new Animated.Value(0)
    this.translateXFooter = new Animated.Value(0)
  }
  close() {
      StatusBar.setBarStyle('light-content',true)
      this.props.navigation.goBack()
  }
  page1() {
      return (
          <View style={{height:2*height}}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('CreateEvent2')}>
                  <Text>Next</Text>
              </TouchableOpacity>
          </View>
      )
  }
  render() {
    return (
      <View style={{backgroundColor:'white',height:height }}>
        <Header
        onRef={ref => (this.headerRef = ref)}
        title={'Create your event'}
        icon={'angle-left'}
        close={() => this.close()}
        />
        <ScrollView 
          // style={{marginTop:sizes.heightHeaderHome}}
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.page1.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90+60}
          showsVerticalScrollIndicator={true}
        />

        <ButtonRound
          icon={'next'} 
          enabled={true} 
          loader={false} 
          translateYFooter={this.translateYFooter}
          translateXFooter={this.translateXFooter} 
          click={() => this.props.navigation.navigate('CreateEvent2')}
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
    marginTop:10
    }
  });
