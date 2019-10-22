import React from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import Header from '../layout/headers/HeaderButton'
import ScrollView from '../layout/scrollViews/ScrollView'
import PhoneFields from './elementsLogin/PhoneFields'
import sizes from '../style/sizes'
import styleApp from '../style/style'

export default class LoadingScreen extends React.Component {
  state={check:false}
  static getDerivedStateFromProps(props, state) {
    console.log('oupaaaaaaaaaa')
    console.log(props)
    return state
  }
  phone () {
    return (
    <View>
      <Text style={[styleApp.title,{marginBottom:20,fontSize:21}]}>We will text your the verification code.</Text>
      <PhoneFields country={this.props.navigation.getParam('country') == undefined?{"name": "United States",
        "dial_code": "+1",
        "code": "US"}:this.props.navigation.getParam('country')} navigate={this.navigate.bind(this)}/>
    </View>
    )
  }
  navigate (page,data) {
    this.props.navigation.navigate(page,data)
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor:'white',borderTopWidth:1,borderColor:'#eaeaea' }}>
        <Header
        onRef={ref => (this.headerRef = ref)}
        title={''}
        icon={'angle-down'}
        close={() => this.props.navigation.navigate('Home')}
        />
        <ScrollView 
          // style={{marginTop:sizes.heightHeaderHome}}
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.phone.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90+60}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({

});
