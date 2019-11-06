import React, {Component} from 'react';
import { 
    View,
    Dimensions,
    TouchableOpacity
} from 'react-native';
import Header from '../layout/headers/HeaderButton'
import ScrollView from '../layout/scrollViews/ScrollView'
import sizes from '../style/sizes'
import CompleteFields from './elementsLogin/CompleteFields'
const { height, width } = Dimensions.get('screen')
import AllIcons from '../layout/icons/AllIcons'
import BackButton from '../layout/buttons/BackButton'
import colors from '../style/colors';
import styleApp from '../style/style'

export default class Complete extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.componentDidMount = this.componentDidMount.bind(this);
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: '',
      headerStyle:styleApp.styleHeader,
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
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => <CompleteFields pageFrom={this.props.navigation.getParam('pageFrom')} navigate={(val,data) => this.props.navigation.navigate(val,data)}  params={this.props.navigation.getParam('data')}/>}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={0}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}
