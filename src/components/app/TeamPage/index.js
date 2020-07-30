import React, {Component} from 'react';
import {Animated, View} from 'react-native';
import {connect} from 'react-redux';
import ScrollView2 from '../../layout/scrollViews/ScrollView2';
import {Col, Row} from 'react-native-easy-grid';

import sizes from '../../style/sizes';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import HeaderTeamPage from './components/HeaderTeamPage';

import {
  imageCardTeam,
  sessionTitle,
  sessionDate,
  viewLive,
  buttonPlay,
  hangupButton,
  listPlayers,
} from './components/elements';

class TeamPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  groupPage() {
    const {session} = this.props;
    return (
      <View style={styleApp.stylePage}>
        {buttonPlay(session)}

        <Row style={{flex: 0, paddingTop: 10, ...styleApp.marginView}}>
          <Col size={60} style={styleApp.center2}>
            {/* {sessionTitle(session)} */}
            {/* {sessionDate(session)} */}
          </Col>
        </Row>
        {/* <View style={styleApp.divider2} /> */}
        {listPlayers(session)}
      </View>
    );
  }

  render() {
    const {loader} = this.state;
    const {navigation, session} = this.props;
    return (
      <View style={styleApp.stylePage}>
        <HeaderTeamPage
          loader={loader}
          session={session}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          navigation={navigation}
        />

        <ScrollView2
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.groupPage()}
          keyboardAvoidDisable={true}
          marginBottomScrollView={sizes.heightFooter + sizes.marginBottomApp}
          marginTop={sizes.heightHeaderHome}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottom={0}
          colorRefresh={colors.title}
          refreshControl={false}
          offsetBottom={30}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const mapStateToProps = (state, props) => {
  const {coachSessionID} = props.route.params;
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    session: state.coachSessions[coachSessionID],
  };
};
export default connect(
  mapStateToProps,
  {},
)(TeamPage);