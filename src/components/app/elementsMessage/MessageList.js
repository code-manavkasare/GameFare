import React from 'react';
import {AppState, View, Text, Dimensions, Image, Animated} from 'react-native';
import {connect} from 'react-redux';
const {height, width} = Dimensions.get('screen');

import {historicSearchAction} from '../../../actions/historicSearchActions';
import {messageAction} from '../../../actions/messageActions';
import PlaceHolder from '../../placeHolders/CardConversation';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import Button from '../../layout/buttons/Button';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import {loadMyDiscusions} from '../../functions/message';

import ScrollView2 from '../../layout/scrollViews/ScrollView';
import sizes from '../../style/sizes';
import CardConversation from './CardConversation';
import isEqual from 'lodash.isequal';

class MessageTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      loader: true,
      discussions: [],
      appState: AppState.currentState,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  shouldComponentUpdate(nextProps) {
    return true;
  }
  componentDidMount() {
    if (this.props.userConnected) this.loadDiscussions(this.props.userID);
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      if (this.props.userConnected) this.loadDiscussions(this.props.userID);
    }
    this.setState({appState: nextAppState});
  };

  async loadDiscussions(userID) {
    this.setState({loader: true});
    const discussions = await loadMyDiscusions(userID);
    console.log('discussions~', discussions);
    //return true;
    const myDiscussions = Object.values(discussions).reduce(function(
      result,
      item,
    ) {
      result[item.objectID] = true;
      return result;
    },
    {});
    await this.props.messageAction('setConversations', discussions);
    await this.props.messageAction('setMyConversations', myDiscussions);
    this.setState({discussions: discussions, loader: false});
  }

  async componentWillReceiveProps(nextProps) {
    console.log('message oist receive props!~');
    if (
      this.props.userConnected !== nextProps.userConnected &&
      nextProps.userConnected
    ) {
      await this.setState({loader: true});
      this.loadDiscussions(nextProps.userID);
    } else if (
      !isEqual(
        this.props.myConversations,
        nextProps.myConversations && nextProps.userConnected,
      )
    ) {
      // await this.setState({loader: true});
      // return this.setState({loader: false});
    } else if (
      this.props.userConnected !== nextProps.userConnected &&
      !nextProps.userConnected
    ) {
      this.setState({discussions: [], loader: true});
    }
  }

  logoutView() {
    return (
      <View style={[styleApp.marginView, {marginTop: 30}]}>
        <View style={styleApp.center}>
          <Image
            style={{height: 85, width: 85, marginBottom: 30}}
            source={require('../../../img/images/conversation.png')}
          />
          <Text style={[styleApp.text, {marginBottom: 30}]}>
            Sign in to see or start a conversation.
          </Text>
        </View>

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
  }

  placeHolder() {
    return (
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
    );
  }

  messagePageView(myConversations) {
    console.log('myConversations', myConversations);
    if (!this.props.userConnected) return this.logoutView();
    return (
      <View style={{paddingTop: 5, minHeight: height}}>
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
            this.placeHolder()
          ) : Object.keys(myConversations).length === 0 || !myConversations ? (
            <Text style={[styleApp.text, {marginTop: 10, marginLeft: 20}]}>
              You don’t have any messages yet.
            </Text>
          ) : (
            Object.keys(myConversations)
              .reverse()
              .map((discussion, i) => (
                <CardConversation
                  key={i}
                  index={i}
                  discussionID={discussion}
                  myConversation={true}
                />
              ))
          )}
        </View>
        <View style={{height: 30}} />
      </View>
    );
  }

  async refresh() {
    await this.setState({loader: true});
    this.loadDiscussions(this.props.userID);
    return true;
  }

  async setLocation(data) {
    this.listEventsRef.setLocation(data);
  }

  render() {
    const {navigate} = this.props.navigation;
    const {myConversations} = this.props;
    console.log(' render myConversations', myConversations);
    const {userConnected} = this.props;
    return (
      <View>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={userConnected && 'Inbox'}
          inputRange={[50, 80]}
          initialBorderColorIcon={colors.white}
          initialBackgroundColor={'white'}
          typeIcon2={'font'}
          sizeIcon2={17}
          initialTitleOpacity={0}
          icon2={userConnected && 'edit'}
          clickButton2={() =>
            userConnected ? navigate('NewConversation') : navigate('SignIn')
          }
        />

        <ScrollView2
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.messagePageView(myConversations)}
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

const mapStateToProps = (state) => {
  return {
    myConversations: state.message.myDiscussions,
    userID: state.user.userID,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps, {historicSearchAction, messageAction})(
  MessageTab,
);
