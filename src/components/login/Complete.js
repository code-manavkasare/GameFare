import React, {Component} from 'react';
import { 
    View,
    Dimensions,
    TouchableOpacity,
    Animated
} from 'react-native';
import Header from '../layout/headers/HeaderButton'
import ScrollView from '../layout/scrollViews/ScrollView2'
import sizes from '../style/sizes'
import CompleteFields from './elementsLogin/CompleteFields'
const { height, width } = Dimensions.get('screen')
import AllIcons from '../layout/icons/AllIcons'
import BackButton from '../layout/buttons/BackButton'
import colors from '../style/colors';
import styleApp from '../style/style'
import HeaderBackButton from '../layout/headers/HeaderBackButton'

export default class Complete extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.AnimatedHeaderValue = new Animated.Value(0)
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: '',
      headerStyle:[styleApp.styleHeader,{borderBottomWidth:0}],
      headerTitleStyle: styleApp.textHeader,
      gesturesEnabled:false,
      headerLeft: () => (
        <BackButton name='keyboard-arrow-left' color={colors.title} type='mat' click={() => navigation.navigate('Phone')} />
      ),
    }
  };
  componentDidMount() {
  }
  render() {
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton 
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        textHeader={''}
        inputRange={[5,10]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        initialTitleOpacity={1}
        icon1='arrow-left'
        icon2={null}
        clickButton1={() => this.props.navigation.navigate('Phone')} 
        />
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => <CompleteFields pageFrom={this.props.navigation.getParam('pageFrom')} navigate={(val,data) => this.props.navigation.navigate(val,data)}  params={this.props.navigation.getParam('data')}/>}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={0}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}
