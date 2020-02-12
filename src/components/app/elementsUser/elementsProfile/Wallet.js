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
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import ScrollView from '../../../layout/scrollViews/ScrollView';
import PlaceHolder from '../../../placeHolders/CardConversation';

import sizes from '../../../style/sizes';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import CardTransfer from './CardTransfer';

class ListEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      listTransfers: [],
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    let listTransfers = await firebase
      .database()
      .ref('usersTransfers/' + this.props.userID)
      .once('value');
    listTransfers = listTransfers.val();
    if (!listTransfers) listTransfers = [];
    return this.setState({
      loader: false,
      listTransfers: Object.values(listTransfers),
    });
  }
  placehoder() {
    return (
      <View>
        <PlaceHolder />
        <PlaceHolder />
        <PlaceHolder />
        <PlaceHolder />
        <PlaceHolder />
        <PlaceHolder />
      </View>
    );
  }
  cardTransfer(transfer, i) {}
  listWallet() {
    const {loader, listTransfers} = this.state;
    return (
      <View style={{marginTop: 10}}>
        {loader ? (
          this.placehoder()
        ) : listTransfers.length === 0 ? (
          <Text style={styleApp.text}>You don't have any transfer yet.</Text>
        ) : (
          listTransfers.map((transfer, i) => (
            <CardTransfer key={i} transfer={transfer} />
          ))
        )}
      </View>
    );
  }

  render() {
    const {dismiss, goBack} = this.props.navigation;
    const {wallet} = this.props;
    return (
      <View
        style={{
          backgroundColor: 'white',
          flex: 1,
        }}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Wallet: $' + wallet.totalWallet}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          typeIcon2={'font'}
          sizeIcon2={17}
          icon1={'arrow-left'}
          clickButton1={() => goBack()}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.listWallet.bind(this)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    wallet: state.user.infoUser.wallet,
  };
};

export default connect(mapStateToProps, {})(ListEvent);
