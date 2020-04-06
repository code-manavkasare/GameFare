import React, {Component} from 'react';
import {View, StyleSheet, Dimensions, Animated} from 'react-native';
import {connect} from 'react-redux';
import {CardIOView, CardIOUtilities} from 'react-native-awesome-card-io';
const {height, width} = Dimensions.get('screen');

import ScrollView from '../../../layout/scrollViews/ScrollView';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import sizes from '../../../style/sizes';

class ScanCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialLoader: true,
      events: [],
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
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

export default connect(mapStateToProps, {})(ScanCard);
