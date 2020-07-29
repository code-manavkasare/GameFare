import React, {Component} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import {connect} from 'react-redux';
import ScrollView2 from '../../layout/scrollViews/ScrollView2';
import {Col, Row} from 'react-native-easy-grid';

import {openSession} from '../../functions/coach';
import sizes from '../../style/sizes';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import {navigate} from '../../../../NavigationService';
import HeaderTeamPage from './components/HeaderTeamPage';

import {
  imageCardTeam,
  sessionTitle,
  sessionDate,
  viewLive,
  buttonPlay
} from './components/elements';

class VideoLibraryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  groupPage() {
    const {session} = this.props;
    console.log('render group page', session);
    return (
      <View style={styleApp.stylePage}>
        {buttonPlay(session)}
        <Row style={{flex: 0, paddingTop: 10}}>
          <Col size={30}>{imageCardTeam(session)}</Col>
          <Col size={60} style={styleApp.center2}>
            {sessionTitle(session)}
            {sessionDate(session)}
          </Col>
          <Col size={15} style={styleApp.center}>
            {viewLive(session)}
          </Col>
        </Row>
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

const styles = StyleSheet.create({});
const mapStateToProps = (state, props) => {
  const {coachSessionID} = props.route.params;
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    session: state.coach.allSessions[coachSessionID],
  };
};
export default connect(
  mapStateToProps,
  {},
)(VideoLibraryPage);
