import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {historicSearchAction} from '../../../actions/historicSearchActions';
import {Col, Row, Grid} from 'react-native-easy-grid';
import union from 'lodash/union';
import PlaceHolder from '../../placeHolders/CardConversation';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import Button from '../../layout/buttons/Button';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import ButtonColor from '../../layout/Views/Button';
import {
  indexDiscussions,
  indexGroups,
  indexEvents,
  getMyGroups,
  getMyEvents,
} from '../../database/algolia';

import ScrollView2 from '../../layout/scrollViews/ScrollView';
const {height, width} = Dimensions.get('screen');

import sizes from '../../style/sizes';
import CardConversation from './CardConversation';

class MessageTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      loader: true,
      unreadMessages: 3,
      discussions: [],
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    if (this.props.userConnected) this.loadDiscussions(this.props.userID);
  }

  async loadDiscussions(userID) {
    indexDiscussions.clearCache();

    // search for persnal conversations
    var {hits} = await indexDiscussions.search({
      query: '',
      filters: 'allMembers:' + userID,
    });
    console.log('personal discussion', hits);

    // search for groups discussions
    var myGroups = await getMyGroups(userID, '');
    var groupsDiscussions = myGroups.map((group) => group.discussions[0]);
    var {results} = await indexDiscussions.getObjects(groupsDiscussions);

    // search for events discussions
    var myEvents = await getMyEvents(userID);
    var eventsDiscussions = myEvents
      .map((event) => {
        if (event.discussions) return event.discussions[0];
        // return null;
      })
      .filter((event) => event);
    var getDiscussionsEvent = await indexDiscussions.getObjects(
      eventsDiscussions,
    );
    getDiscussionsEvent = getDiscussionsEvent.results;
    console.log(
      'discussion',
      union(results, hits, getDiscussionsEvent).filter(
        (discussion) => discussion.firstMessageExists,
      ),
    );

    this.setState({
      loader: false,
      discussions: union(results, hits, getDiscussionsEvent).filter(
        (discussion) => discussion.firstMessageExists,
      ),
    });
  }
  async componentWillReceiveProps(nextProps) {
    if (
      this.props.userConnected !== nextProps.userConnected &&
      nextProps.userConnected
    ) {
      var that = this;
      setTimeout(function() {
        that.loadDiscussions(nextProps.userID);
      }, 2000);
    }
  }
  messagePageView() {
    if (!this.props.userConnected)
      return (
        <View style={[styleApp.marginView, {marginTop: 30}]}>
          <View style={styleApp.center}>
            <Image
              style={{height: 85, width: 85, marginBottom: 30}}
              source={require('../../../img/images/conversation.png')}
            />
          </View>
          <Text style={[styleApp.text, {marginBottom: 30}]}>
            Sign in to see or start a conversation.
          </Text>

          <Button
            text="Sign in"
            click={() =>
              this.props.navigation.navigate('Phone', {pageFrom: 'MessageList'})
            }
            backgroundColor={'green'}
            onPressColor={colors.greenClick}
          />
        </View>
      );
    return (
      <View style={{paddingTop: 5, minHeight: height / 1.5}}>
        <View style={[styleApp.marginView, {marginBottom: 15}]}>
          <Text style={[styleApp.title, {fontSize: 27}]}>Inbox</Text>
        </View>
        <View
          style={[
            styleApp.divider2,
            {marginLeft: 20, width: width - 40, marginTop: 0},
          ]}
        />
        <View>
          {this.state.loader ? (
            <View style={{flex: 1}}>
              <PlaceHolder />
              <PlaceHolder />
              <PlaceHolder />
              <PlaceHolder />
              <PlaceHolder />
              <PlaceHolder />
              <PlaceHolder />
              <PlaceHolder />
              <PlaceHolder />
              <PlaceHolder />
              <PlaceHolder />
            </View>
          ) : (
            Object.values(this.state.discussions).map((discussion, i) => (
              <CardConversation key={i} index={i} discussion={discussion} />
            ))
          )}
        </View>
      </View>
    );
  }
  async refresh() {
    // this.eventGroupsRef.reload()
    // this.listEventsRef.reload()
    await this.setState({loader: true});
    this.loadDiscussions(this.props.userID);
    return true;
  }
  async setLocation(data) {
    this.listEventsRef.setLocation(data);
  }
  render() {
    const {navigate} = this.props.navigation;
    return (
      <View>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={this.props.userConnected ? 'Inbox' : null}
          inputRange={[50, 80]}
          initialBorderColorIcon={colors.white}
          initialBackgroundColor={'white'}
          typeIcon2={'font'}
          sizeIcon2={17}
          initialTitleOpacity={0}
          icon1={null}
          icon2={'edit'}
          clickButton2={() =>
            this.props.userConnected
              ? navigate('NewConversation')
              : navigate('SignIn')
          }
        />

        <ScrollView2
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.messagePageView()}
          keyboardAvoidDisable={true}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottom={0}
          colorRefresh={colors.title}
          stickyHeaderIndices={[3]}
          refreshControl={true}
          refresh={() => this.refresh()}
          offsetBottom={10}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    height: 40,
    width: 120,
    backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voile: {
    position: 'absolute',
    height: height,
    backgroundColor: colors.title,
    width: width,
    opacity: 0.4,
    // zIndex:220,
  },
});

const mapStateToProps = (state) => {
  return {
    conversations: state.conversations,
    userID: state.user.userID,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps, {historicSearchAction})(MessageTab);
