import React, {Component,createRef} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Dimensions
} from 'react-native';
import Header from '../layout/headers/HeaderButton'
import ScrollView from '../layout/scrollViews/ScrollView'
import sizes from '../style/sizes'
import styleApp from '../style/style'
import VerifyFields from './elementsLogin/VerifyFields'
import {connect} from 'react-redux';
import AllIcons from '../layout/icons/AllIcons'
import BackButton from '../layout/buttons/BackButton'

const { height, width } = Dimensions.get('screen')

export default class Verify extends Component {
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
          contentScrollView={() => <VerifyFields pageFrom={this.props.navigation.getParam('pageFrom')} navigate={(val,data) => this.props.navigation.navigate(val,data)}  params={this.props.navigation.getParam('data')}/>}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={0}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({

});

