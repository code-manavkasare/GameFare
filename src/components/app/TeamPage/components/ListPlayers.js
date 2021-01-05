import React, {Component} from 'react';
import {Text, StyleSheet, View, Animated} from 'react-native';
import moment from 'moment';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {connect} from 'react-redux';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';

import ScrollView from '../../../layout/scrollViews/ScrollView2';
import {listPlayers} from './elements';

import isEqual from 'lodash.isequal';

class ListPlayers extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  shouldComponentUpdate(prevProps) {
    if (isEqual(this.props, prevProps)) return false;
    return true;
  }
  render() {
    const {session, messages} = this.props;
    return (
      <View
        style={{
          flex: 1,
          width: '100%',
          marginTop: -34,
          backgroundColor: colors.white,
        }}>
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => (
            <View>{listPlayers({session, messages})}</View>
          )}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={30}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const mapStateToProps = (state, props) => {
  const {objectID} = props;
  const conversation = state.conversations[objectID];
  let messages = {};
  if (conversation) messages = conversation.messages;
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    infoUser: state.user.infoUser.userInfo,
    session: state.coachSessions[objectID],
    messages,
  };
};

export default connect(mapStateToProps)(ListPlayers);
