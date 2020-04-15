import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
  Image,
} from 'react-native';
import {connect} from 'react-redux';
const {height, width} = Dimensions.get('screen');

import coachAction from '../../../../actions/coachActions';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import {
  marginTopApp,
  heightFooter,
  offsetBottomHeaderStream,
} from '../../../style/sizes';
import ScrollView from '../../../layout/scrollViews/ScrollView2';

import LogoutView from './components/LogoutView';
import PermissionView from './components/PermissionView';

import ListStreams from './components/ListStreams';
import HeaderListStream from './components/HeaderListStream';

class StreamTab extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {}
  StreamTab = () => {
    const {permissionsCamera} = this.state;
    let {userConnected} = this.props;
    return (
      <View style={styles.containerTabPage}>
        <HeaderListStream
          userConnected={userConnected}
          hideButtonNewSession={!userConnected || !permissionsCamera}
        />
        <View style={{height: offsetBottomHeaderStream}} />
        {!userConnected ? (
          <LogoutView />
        ) : !permissionsCamera ? (
          <PermissionView setState={this.setState.bind(this)} />
        ) : (
          <ListStreams AnimatedHeaderValue={this.AnimatedHeaderValue} />
        )}
      </View>
    );
  };

  render() {
    return (
      <View style={[styleApp.page, {backgroundColor: 'white'}]}>
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.StreamTab()}
          marginBottomScrollView={0}
          marginTop={0}
          scrollDisabled={false}
          offsetBottom={heightFooter + 90}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerTabPage: {
    ...styleApp.fullSize,
    paddingTop: marginTopApp,
    minHeight: height - 100,
  },
  titlePage: {
    ...styleApp.title,
    color: colors.title,
    marginBottom: 10,
    marginLeft: 20,
  },
  rowButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // marginTop: 20,
    width: width,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    userConnected: state.user.userConnected,
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(StreamTab);
