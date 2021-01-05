import React, {Component} from 'react';
import {View, Animated} from 'react-native';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {connect} from 'react-redux';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import {heightHeaderHome, height} from '../../../style/sizes';
import {goBack} from '../../../../../NavigationService';

import ScrollView from '../../../layout/scrollViews/ScrollView2';
import {ListPlayers} from './elements';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import {imageCardTeam, sessionTitle} from './elements';
import RowIcon from '../../../layout/rows/RowIcon';
import {deleteSession} from '../../../functions/coach';
import {sessionSelector} from '../../../../store/selectors/sessions';
import {
  userConnectedSelector,
  userIDSelector,
  userInfoSelector,
} from '../../../../store/selectors/user';
import {messagesSelector} from '../../../../store/selectors/conversations';

class SessionSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {loader: false};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  settings() {
    const {session, messages, navigation, route} = this.props;
    const {navigate} = navigation;
    const {objectID} = route.params;
    return (
      <View style={{minHeight: height}}>
        <View style={styleApp.marginView}>
          <Row style={{flex: 0, paddingTop: 20, paddingBottom: 20}}>
            <Col size={25} style={styleApp.center2}>
              {imageCardTeam(session)}
            </Col>
            <Col size={75} style={styleApp.center2}>
              {sessionTitle(session)}
            </Col>
          </Row>
        </View>
        <View style={[styleApp.divider3]} />
        <View>{ListPlayers({session, messages, navigate})}</View>
        <View style={[styleApp.divider3]} />
        <RowIcon
          label="Leave this conversation"
          icon={{name: 'sign-out-alt', type: 'font', size: 20}}
          colorText={colors.red}
          click={() => deleteSession(objectID)}
        />
      </View>
    );
  }
  render() {
    const {loader} = this.state;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[20, 25]}
          loader={loader}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          initialBorderWidth={1}
          icon1={'chevron-left'}
          sizeIcon1={21}
          clickButton1={() => goBack()}
          icon2={null}
          text2={'Select'}
          typeIcon2={'font'}
          sizeIcon2={17}
          clickButton2={() => true}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.settings()}
          marginBottomScrollView={0}
          marginTop={heightHeaderHome}
          offsetBottom={30}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const mapStateToProps = (state, props) => {
  const {objectID} = props.route.params;
  return {
    userID: userIDSelector(state),
    userConnected: userConnectedSelector(state),
    infoUser: userInfoSelector(state),
    session: sessionSelector(state, {id: objectID}),
    messages: messagesSelector(state, {id: objectID}),
  };
};

export default connect(mapStateToProps)(SessionSettings);
