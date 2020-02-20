import React from 'react';
import {AppState, View, Text, Dimensions, Image, Animated} from 'react-native';
import {connect} from 'react-redux';
import isEqual from 'lodash.isequal';
import {keys} from 'ramda';

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

const {height, width} = Dimensions.get('screen');

class MessageTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      loader: true,
      appState: AppState.currentState,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    if (this.props.userConnected) this.loadDiscussions(this.props.userID);
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  shouldComponentUpdate(nextProps) {
    if (
      keys(this.props.discussions).length ===
        keys(nextProps.discussions).length &&
      this.state.loader === false
    ) {
      return false;
    }
    return true;
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
    console.log(discussions);
    await this.props.messageAction('setConversations', discussions);
    this.setState({loader: false});
  }

  async componentWillReceiveProps(nextProps) {
    if (
      this.props.userConnected !== nextProps.userConnected &&
      nextProps.userConnected
    ) {
      await this.setState({loader: true});
      this.loadDiscussions(nextProps.userID);
    } else if (
      this.props.userConnected !== nextProps.userConnected &&
      !nextProps.userConnected
    ) {
      this.setState({loader: true});
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

  messagePageView() {
    const {discussions, userConnected} = this.props;
    if (!userConnected) return this.logoutView();
    console.log('discussions', discussions);
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
          ) : Object.keys(discussions).length === 0 || !discussions ? (
            <Text style={[styleApp.text, {marginTop: 10, marginLeft: 20}]}>
              You don’t have any messages yet.
            </Text>
          ) : (
            keys(discussions).map((discussion, i) => (
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

const mapStateToProps = (state) => {
  console.log(state);
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    discussions: state.message.conversations,
  };
};

export default connect(mapStateToProps, {historicSearchAction, messageAction})(
  MessageTab,
);
