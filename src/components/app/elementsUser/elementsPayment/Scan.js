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
import firebase from 'react-native-firebase'
import { Col, Row, Grid } from "react-native-easy-grid";
import AllIcons from '../../../layout/icons/AllIcons'
import Header from '../../../layout/headers/HeaderButton'
import ScrollView from '../../../layout/scrollViews/ScrollView'

import colors from '../../../style/colors';
import { CardIOView, CardIOUtilities } from 'react-native-awesome-card-io';

class ListEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialLoader:true,
      events:[]
    };
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Scan',
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
        <TouchableOpacity style={{paddingLeft:15}} onPress={() => navigation.goBack()}>
          <AllIcons name='angle-left' color={'white'} size={23} type='font' />
        </TouchableOpacity>
      ),
    }
  };
  async componentDidMount() {
    CardIOUtilities.preload();
  }
  didScanCard = (card) => {
    this.props.navigation.state.params.onGoBack(card)
  }
  scan() {
    return (
      <CardIOView
          hideCardIOLogo={true}
          didScanCard={this.didScanCard}
          style={styles.scanView}
          scanExpiry={true}
        /> 
    )      
  }
  render() {
    return (
      <View style={{backgroundColor:'white',flex:1 }}>
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.scan.bind(this)}
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
  scanView:{
    width:width,
    marginLeft:-20,
    marginTop:15,
    height:height-100,
    // backgroundColor:'red'
  },
});

const  mapStateToProps = state => {
  return {
    userID:state.user.userID,
    defaultCard:state.user.infoUser.wallet.defaultCard,
    cards:state.user.infoUser.wallet.cards,
    tokenCusStripe:state.user.infoUser.wallet.tokenCusStripe
  };
};

export default connect(mapStateToProps,{})(ListEvent);

