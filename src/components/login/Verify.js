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
import VerifyFields from './elementsLogin/VerifyFields'
import {connect} from 'react-redux';

const { height, width } = Dimensions.get('screen')

export default class Verify extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.componentDidMount = this.componentDidMount.bind(this);
  }
  componentDidMount() {
  }
  render() {
    return (
      <View style={{ flex: 1,backgroundColor:'white',borderTopWidth:1,borderColor:'#eaeaea' }}>
        <Header
        onRef={ref => (this.headerRef = ref)}
        title={''}
        icon={'angle-left'}
        close={() => this.props.navigation.navigate('Phone')}
        />
        <ScrollView 
          // style={{marginTop:sizes.heightHeaderHome}}
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => <VerifyFields pageFrom={this.props.navigation.getParam('pageFrom')} navigate={(val,data) => this.props.navigation.navigate(val,data)}  params={this.props.navigation.getParam('data')}/>}
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

