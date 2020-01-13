import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
const {height, width} = Dimensions.get('screen');
import firebase from 'react-native-firebase';
import {Col, Row, Grid} from 'react-native-easy-grid';
import AllIcons from '../../../layout/icons/AllIcons';
import Header from '../../../layout/headers/HeaderButton';
import ScrollView from '../../../layout/scrollViews/ScrollView';

import sizes from '../../../style/sizes';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import BackButton from '../../../layout/buttons/BackButton';

class ListEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialLoader: true,
      events: [],
    };
  }
  static navigationOptions = ({navigation}) => {
    return {
      title: 'My wallet',
      headerStyle: styleApp.styleHeader,
      headerTitleStyle: styleApp.textHeader,
      headerLeft: () => (
        <BackButton
          color={colors.title}
          name="keyboard-arrow-left"
          type="mat"
          click={() => navigation.navigate(navigation.getParam('pageFrom'))}
        />
      ),
    };
  };
  async componentDidMount() {}
  settings() {
    return (
      <View style={{marginTop: 0}}>
        {/* <Text style={[styleApp.title,{marginBottom:20,fontSize:19}]}>Payment methods</Text> */}
      </View>
    );
  }
  render() {
    return (
      <View
        style={{
          backgroundColor: 'white',
          flex: 1,
          borderLeftWidth: 1,
          borderColor: colors.off,
          showOpacity: 0,
        }}>
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.settings.bind(this)}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  defaultView: {
    backgroundColor: colors.greenLight,
    borderRadius: 12.5,
    height: 25,
    width: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textDefault: {
    color: colors.greenStrong,
    fontSize: 12,
    fontFamily: 'OpenSans-Bold',
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    defaultCard: state.user.infoUser.wallet.defaultCard,
    cards: state.user.infoUser.wallet.cards,
  };
};

export default connect(mapStateToProps, {})(ListEvent);
