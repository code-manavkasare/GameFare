import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,TextInput,
    Animated
} from 'react-native';
import {connect} from 'react-redux';
const { height, width } = Dimensions.get('screen')
import { Col, Row, Grid } from "react-native-easy-grid";

import Header from '../../layout/headers/HeaderButton'
import ButtonRound from '../../layout/buttons/ButtonRound'
import ScrollView from '../../layout/scrollViews/ScrollView'
import Contacts from './elementsContacts/Contacts'

import sizes from '../../style/sizes'
import styleApp from '../../style/style'

class Page4 extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
    this.translateYFooter = new Animated.Value(0)
    this.translateXFooter = new Animated.Value(0)
  }
  componentDidMount() {
    console.log('page 4 mount')

  }
  page4() {
      return (
        <View>
          <Contacts onRef={ref => (this.contactRef = ref)}/>
        </View>
      )
  }
  
  render() {
    return (
      <View style={{backgroundColor:'white',height:height }}>
        <Header
        onRef={ref => (this.headerRef = ref)}
        title={'Invite your friends'}
        icon={'angle-left'}
        close={() => this.props.navigation.goBack()}
        />
        <ScrollView 
          // style={{marginTop:sizes.heightHeaderHome}}
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.page4.bind(this)}
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
          click={() => this.props.navigation.navigate('Events',{})}
         />

      </View>
    );
  }
}

const styles = StyleSheet.create({

});

const  mapStateToProps = state => {
  return {
    sports:state.globaleVariables.sports.list,
  };
};

export default connect(mapStateToProps,{})(Page4);

