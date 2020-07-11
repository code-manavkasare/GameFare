import React from 'react';
import {AppState, View, Text, Dimensions, Image, Animated} from 'react-native';
import {connect} from 'react-redux';
import {keys} from 'ramda';
import Orientation from 'react-native-orientation-locker';

import {historicSearchAction} from '../../../actions/historicSearchActions';
import {messageAction} from '../../../actions/messageActions';
import PlaceHolder from '../../placeHolders/CardConversation';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import Button from '../../layout/buttons/Button';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import {loadMyDiscusions} from '../../functions/message';
import SearchBarContact from '../elementsEventCreate/elementsContacts/SearchBarContact';

import ScrollView2 from '../../layout/scrollViews/ScrollView2';
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
      searchInput: '',
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      Orientation.lockToPortrait();
    });
    if (this.props.userConnected) this.loadDiscussions();
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.loader !== nextState.loader) {
      return true;
    }

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
      if (this.props.userConnected) this.loadDiscussions();
    }
    this.setState({appState: nextAppState});
  };

  updateSearchField = async (searchInput) => {
    this.setState({searchInput});
    this.loadDiscussions();
  };

  loadDiscussions = async () => {
    await this.setState({loader: true});
    const discussions = await loadMyDiscusions(
      this.props.userID,
      this.state.searchInput,
      this.props.blockedUsers,
    );
    console.log('discussions loaded', discussions);
    await this.props.messageAction('setConversations', discussions);
    this.setState({loader: false});
  };

  async componentWillReceiveProps(nextProps) {
    if (
      this.props.userConnected !== nextProps.userConnected &&
      nextProps.userConnected
    ) {
      await this.setState({loader: true});
      this.loadDiscussions();
    } else if (
      this.props.userConnected !== nextProps.userConnected &&
      !nextProps.userConnected
    ) {
      this.setState({loader: true});
    }
  }

  logoutView() {
    const {navigation} = this.props;
    return (
      <View style={[styleApp.marginView, {marginTop: 30, minHeight: height}]}>
        <View style={styleApp.center}>
          <Image
            style={{height: 85, width: 85, marginBottom: 30}}
            source={require('../../../img/images/target.png')}
          />
          <Text style={[styleApp.text, {marginBottom: 30}]}>
            Sign in to see or start a conversation.
          </Text>
        </View>

        <Button
          text="Sign in"
          click={() => navigation.navigate('SignIn')}
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
    const {discussions, userConnected, navigation} = this.props;
    const {searchInput} = this.state;

    if (!userConnected) return this.logoutView();
    return (
      <View style={{minHeight: height}}>
        <SearchBarContact
          placeHolderMessage={'Search your messages...'}
          updateSearch={(searchInput) => this.updateSearchField(searchInput)}
          searchString={searchInput}
        />
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
              navigation={navigation}
              discussionID={discussion}
              myConversation={true}
            />
          ))
        )}
        <View style={{height: 30}} />
      </View>
    );
  }

  async setLocation(data) {
    this.listEventsRef.setLocation(data);
  }

  render() {
    const {navigate} = this.props.navigation;
    const {userConnected} = this.props;
    return (
      <View style={styleApp.stylePage}>
        {userConnected && (
          <HeaderBackButton
            AnimatedHeaderValue={this.AnimatedHeaderValue}
            textHeader={userConnected && 'Inbox'}
            inputRange={[5, 10]}
            initialBorderColorIcon={colors.white}
            initialBackgroundColor={'white'}
            initialBorderColorHeader={colors.white}
            initialTitleOpacity={0}
            initialBorderWidth={1}
            typeIcon2={'font'}
            sizeIcon2={17}
            icon2={userConnected && 'edit'}
            clickButton2={() =>
              userConnected ? navigate('NewConversation') : navigate('SignIn')
            }
          />
        )}

        <ScrollView2
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.messagePageView()}
          keyboardAvoidDisable={true}
          marginBottomScrollView={0}
          marginTop={
            userConnected ? sizes.heightHeaderHome : sizes.marginTopApp
          }
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          colorRefresh={colors.title}
          stickyHeaderIndices={[3]}
          refreshControl={true}
          refresh={() => this.loadDiscussions()}
          offsetBottom={sizes.heightFooter + 30}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
    discussions: state.message.conversations,
    blockedUsers: state.user.infoUser.blockedUsers,
  };
};

export default connect(
  mapStateToProps,
  {historicSearchAction, messageAction},
)(MessageTab);
