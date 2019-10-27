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
import AllIcons from '../layout/icons/AllIcons'
import styleApp from '../style/style'

export default class LoadingScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: '',
      headerStyle: {
          backgroundColor: colors.primary,
          borderBottomWidth:0
      },
      headerTitleStyle: {
          color:'white',
          fontFamily:'OpenSans-Bold',
          fontSize:14,
      },
      headerLeft: () => (
        <TouchableOpacity style={{paddingLeft:15}} onPress={() => navigation.navigate(navigation.getParam('pageFrom'))}>
          <AllIcons name='angle-down' color={'white'} size={23} type='font' />
        </TouchableOpacity>
      ),
    }
  };
  phone () {
    return (
    <View>
      <Text style={[styleApp.title,{marginBottom:20,fontSize:21}]}>We will text your the verification code.</Text>
      <PhoneFields pageFrom={this.props.navigation.getParam('pageFrom')} country={this.props.navigation.getParam('country') == undefined?{"name": "United States",
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
      <View style={{ flex: 1, backgroundColor:'white',borderTopWidth:0,borderColor:'#eaeaea' }}>
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.phone.bind(this)}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={90+60}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({

});
