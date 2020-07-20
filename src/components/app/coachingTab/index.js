import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions, Animated} from 'react-native';
import {connect} from 'react-redux';
import StatusBar from '@react-native-community/status-bar';

import {coachAction} from '../../../actions/coachActions';
import {layoutAction} from '../../../actions/layoutActions';
import {autocompleteSearchUsers} from '../../../components/functions/users';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import {heightFooter, heightHeaderHome} from '../../style/sizes';
import ScrollView from '../../layout/scrollViews/ScrollView2';
import PlaceHolder from '../../placeHolders/CardConversation';

import Loader from '../../layout/loaders/Loader';
import HeaderCoachingTab from './components/HeaderCoachingTab';
import CardCoach from './components/CardCoach';

class CoachingTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coaches: [],
      loader: true,
      search: '',
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    this.searchCoach('');
  }
  async searchCoach(search) {
    const {blockedByUsers, userID} = this.props;
    const coaches = await autocompleteSearchUsers(
      search,
      userID,
      false,
      blockedByUsers ? Object.keys(blockedByUsers) : false,
      true,
    );
    this.setState({loader: false, coaches: coaches});
  }
  componentDidUpdate = (prevProps, prevState) => {};

  viewLoader = () => {
    return (
      <View style={[{height: 120}, styleApp.center]}>
        <Loader size={55} color={colors.primary} />
      </View>
    );
  };
  CoachingTab = (currentHeight) => {
    const {loader, coaches} = this.state;

    return (
      <View style={[styles.containerTabPage, {minHeight: currentHeight - 100}]}>
        <View style={styleApp.marginView}>
          <Text style={styleApp.title}>Find a coach and book a session</Text>
          <Text style={[styleApp.text, {marginTop: 10, marginBottom: 20}]}>
            Connect live with a coach through an in-app video call. Only pay for
            time spent in session.
          </Text>
        </View>

        {loader ? (
          <View>
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
          </View>
        ) : (
          coaches.map((coach) => (
            <CardCoach coach={coach} key={coach.objectID} />
          ))
        )}
      </View>
    );
  };

  render() {
    const {permissionsCamera} = this.state;
    const {userConnected} = this.props;
    const {height} = Dimensions.get('screen');
    return (
      <View style={styleApp.stylePage}>
        <HeaderCoachingTab
          userConnected={userConnected}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          hideButtonNewSession={!userConnected || !permissionsCamera}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.CoachingTab(height)}
          marginBottomScrollView={0}
          marginTop={heightHeaderHome}
          offsetBottom={heightFooter + 90}
          showsVerticalScrollIndicator={true}
          refreshControl={true}
          refresh={async () => {
            await this.setState({loader: true});
            const {search} = this.state;
            this.searchCoach(search);
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerTabPage: {
    ...styleApp.fullSize,
    paddingTop: 0,
  },
  titlePage: {
    ...styleApp.title,
    color: colors.title,
    marginBottom: 10,
    marginLeft: 20,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    userConnected: state.user.userConnected,
    currentSessionID: state.coach.currentSessionID,
    blockedByUsers: state.user.infoUser.blockedByUsers,
  };
};

export default connect(
  mapStateToProps,
  {coachAction, layoutAction},
)(CoachingTab);
