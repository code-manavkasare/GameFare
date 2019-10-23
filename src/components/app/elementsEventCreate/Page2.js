import React,{Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions
} from 'react-native';

const { height, width } = Dimensions.get('screen')
import Header from '../../layout/headers/HeaderButton'
import ScrollView from '../../layout/scrollViews/ScrollView'
import sizes from '../../style/sizes'

export default class LoadingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      
    };
  }
  componentDidMount() {
    console.log('le mount step 2')
    console.log(this.props.navigation.getParam('data'))
  }
  click() {
      console.log('clck loading')
      this.props.navigation.close()
  }
  page1() {
      return (
          <View style={{height:2*height}}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('Home')}>
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
        title={'Advanced settings'}
        icon={'angle-left'}
        close={() => this.props.navigation.goBack()}
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
