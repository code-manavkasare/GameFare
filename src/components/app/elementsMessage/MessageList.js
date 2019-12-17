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

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import Button from '../../layout/buttons/Button';
import ButtonColor from '../../layout/Views/Button';

import ScrollView2 from '../../layout/scrollViews/ScrollView2';
import AllIcons from '../../layout/icons/AllIcons';
const {height, width} = Dimensions.get('screen');
import StatusBar from '@react-native-community/status-bar';
import ButtonAdd from '../../app/elementsHome/ButtonAdd';

import sizes from '../../style/sizes';
import isEqual from 'lodash.isequal';
import CardConversation from './CardConversation';

class MessageTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      loader: false,
      unreadMessages: 3,
    };
    this.translateXVoile = new Animated.Value(width);
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.opacityVoile = new Animated.Value(0.3);
  }
  async componentDidMount() {}
  async componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.sports, nextProps.sports)) {
      await this.setState({
        loader: true,
        filterSports: nextProps.sportSelected,
      });
      this.setState({loader: false});
    }
  }
  async changeSport(val) {
    await this.setState({loader: true, filterSports: val});
    var that = this;
    setTimeout(function() {
      that.setState({loader: false});
    }, 400);
  }
  getAnimateHeader() {
    return this.scrollViewRef.getAnimateHeader();
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
            You need to be signed in in order to consult your conversations.
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
      <View style={{paddingTop: 20, minHeight: height}}>
        <View style={[styleApp.marginView, {marginBottom: 15}]}>
          <Text style={styleApp.title}>Inbox</Text>
          {/* <Text style={[styleApp.subtitle,{marginTop:5}]}>You have {this.state.unreadMessages} unread messages.</Text> */}
        </View>
        {/* 
          {Object.values(this.props.conversations).map((conversation, i) => (
            <CardConversation index={i} conversation={conversation} />
          ))} */}
      </View>
    );
  }
  async refresh() {
    // this.eventGroupsRef.reload()
    // this.listEventsRef.reload()
    return true;
  }
  async setLocation(data) {
    this.listEventsRef.setLocation(data);
  }
  render() {
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={this.props.userConnected ? 'Inbox' : null}
          inputRange={[50, 80]}
          initialBorderColorIcon={colors.grey}
          initialBackgroundColor={'white'}
          typeIcon2={'mat'}
          sizeIcon2={17}
          initialTitleOpacity={0}
          icon1={null}
          icon2={this.props.userConnected ? 'edit' : null}
          clickButton2={() => console.log('')}
        />

        <ScrollView2
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.messagePageView()}
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

const mapStateToProps = state => {
  return {
    conversations: state.conversations,
    userID: state.user.userID,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps, {historicSearchAction})(MessageTab);
