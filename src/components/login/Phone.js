import React from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated
} from 'react-native';
import Header from '../layout/headers/HeaderButton'
import ScrollView from '../layout/scrollViews/ScrollView'
import PhoneFields from './elementsLogin/PhoneFields'
import sizes from '../style/sizes'
import BackButton from '../layout/buttons/BackButton'
import AllIcons from '../layout/icons/AllIcons'
import styleApp from '../style/style'
import HeaderBackButton from '../layout/headers/HeaderBackButton'
import colors from '../style/colors';

export default class LoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.AnimatedHeaderValue = new Animated.Value(0)
  }
  phone () {
    return (
    <View style={styleApp.marginView}>
      <Text style={[styleApp.title,{marginBottom:20,fontSize:21}]}>We will text your verification code.</Text>
      <PhoneFields pageFrom={this.props.navigation.getParam('pageFrom')} country={this.props.navigation.getParam('country') == undefined?{"name": "United States",
        "callingCode": "1",
        "code": "US"}:this.props.navigation.getParam('country')} navigate={this.navigate.bind(this)}/>
    </View>
    )
  }
  navigate (page,data) {
    this.props.navigation.navigate(page,data)
  }
  render() {
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton 
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        textHeader={'Sign in'}
        inputRange={[5,10]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        initialTitleOpacity={1}
        icon1='times'
        icon2={null}
        clickButton1={() => this.props.navigation.navigate(this.props.navigation.getParam('pageFrom'))} 
        />

        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={this.phone.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={0}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({

});
