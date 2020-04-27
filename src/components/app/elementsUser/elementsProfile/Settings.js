import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import {connect} from 'react-redux';

import ScrollView from '../../../layout/scrollViews/ScrollView';

import colors from '../../../style/colors';

class ListEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialLoader: true,
      events: [],
    };
  }
  async componentDidMount() {}
  settings() {
    return <View style={{marginTop: 0}} />;
  }
  render() {
    return (
      <View style={{backgroundColor: 'white', flex: 1}}>
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

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    defaultCard: state.user.infoUser.wallet.defaultCard,
    cards: state.user.infoUser.wallet.cards,
  };
};

export default connect(
  mapStateToProps,
  {},
)(ListEvent);
