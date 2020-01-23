import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
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

class MessageTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      loader: true,
      discussions: [],
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    if (this.props.userConnected) this.loadDiscussions(this.props.userID);
  }

  async loadDiscussions(userID) {
    const discussions = await loadMyDiscusions(userID);
    await this.props.messageAction('setConversations', discussions);
    this.setState({discussions: discussions, loader: false});
  }
  async componentWillReceiveProps(nextProps) {
    if (
      this.props.userConnected !== nextProps.userConnected &&
      nextProps.userConnected
    ) {
      var that = this;
      setTimeout(function() {
        that.loadDiscussions(nextProps.userID);
      }, 800);
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
  messagePageView(conversations) {
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
          {this.state.loader
            ? this.placeHolder()
            : Object.values(conversations).map((discussion, i) => (
                <CardConversation
                  key={i}
                  index={i}
                  discussion={discussion}
                  myConversation={true}
                />
              ))}
        </View>
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
    const {discussions} = this.state;
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
          icon2={userConnected ? 'edit' : null}
          clickButton2={() =>
            userConnected ? navigate('NewConversation') : navigate('SignIn')
          }
        />

        <ScrollView2
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.messagePageView(discussions)}
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
    // conversations: state.message.conversations,
    userID: state.user.userID,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps, {historicSearchAction, messageAction})(
  MessageTab,
);
