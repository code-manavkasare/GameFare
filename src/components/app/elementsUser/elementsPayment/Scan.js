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
import BackButton from '../../../layout/buttons/BackButton';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import sizes from '../../../style/sizes';

import colors from '../../../style/colors';
import {CardIOView, CardIOUtilities} from 'react-native-awesome-card-io';

class ListEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialLoader: true,
      events: [],
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  static navigationOptions = ({navigation}) => {
    return {
      title: 'Scan',
      headerStyle: {
        backgroundColor: colors.primary,
        borderBottomWidth: 0,
      },
      headerTitleStyle: {
        color: 'white',
        fontFamily: 'OpenSans-Bold',
        fontSize: 14,
      },
      headerLeft: () => (
        <BackButton
          name="keyboard-arrow-left"
          type="mat"
          click={() => navigation.goBack()}
        />
      ),
    };
  };
  async componentDidMount() {
    CardIOUtilities.preload();
  }
  didScanCard = (card) => {
    this.props.navigation.state.params.onGoBack(card);
  };
  scan() {
    return (
      <CardIOView
        hideCardIOLogo={true}
        didScanCard={this.didScanCard}
        style={styles.scanView}
        scanExpiry={true}
      />
    );
  }
  render() {
    return (
      <View style={{backgroundColor: 'white', flex: 1}}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Scan your card'}
          inputRange={[20, 50]}
          initialTitleOpacity={0}
          initialBackgroundColor={'white'}
          initialBorderColorIcon={'white'}
          icon1="arrow-left"
          clickButton1={() => this.props.navigation.goBack()}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={this.scan.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  scanView: {
    width: width,
    marginLeft: -20,
    marginTop: 0,
    height: height - 100,
    // backgroundColor:'red'
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    defaultCard: state.user.infoUser.wallet.defaultCard,
    cards: state.user.infoUser.wallet.cards,
    tokenCusStripe: state.user.infoUser.wallet.tokenCusStripe,
  };
};

export default connect(mapStateToProps, {})(ListEvent);
