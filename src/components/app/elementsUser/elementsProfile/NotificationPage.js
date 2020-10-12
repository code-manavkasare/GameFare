import React, {Component} from 'react';
import {Animated, StyleSheet, Text, View, AppState} from 'react-native';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {connect} from 'react-redux';
import {openSettings} from 'react-native-permissions';

import Button from '../../../layout/buttons/Button';
import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import AllIcons from '../../../layout/icons/AllIcons';
import {heightHeaderHome} from '../../../style/sizes';
import {permission} from '../../../functions/pictures';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import ScrollView from '../../../layout/scrollViews/ScrollView2';

class NotificationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appState: AppState.currentState,
      permission: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    this.loadPermission();
    AppState.addEventListener('change', this._handleAppStateChange);
  }
  async loadPermission() {
    const permissionNotification = await permission('notification');
    this.setState({permission: permissionNotification});
  }
  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }
  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.loadPermission();
    }
    this.setState({appState: nextAppState});
  };

  button = (text, color, click) => {
    return (
      <Button
        backgroundColor={'green'}
        onPressColor={colors.greenLight}
        enabled={true}
        text={text}
        icon={{
          name: 'cog',
          size: 22,
          type: 'font',
          color: colors.white,
        }}
        styleButton={styles.buttonSignIn}
        loader={false}
        click={async () => click()}
      />
    );
  };
  rowIcon(icon, text) {
    return (
      <Row style={{paddingTop: 5, paddingBottom: 5, marginBottom: 10}}>
        <Col size={15} style={styleApp.center2}>
          <AllIcons name={icon} color={colors.grey} type="font" size={20} />
        </Col>
        <Col size={85} style={styleApp.center2}>
          <Text style={[styleApp.text, {fontSize: 14}]}>{text}</Text>
        </Col>
      </Row>
    );
  }
  notificationView() {
    const {permission} = this.state;
    return (
      <View style={{...styleApp.marginView, minHeight: 300, marginTop: 80}}>
        <Row style={{height: 40}}>
          <Col size={65}>
            <Text style={[styleApp.title, {fontSize: 21, marginBottom: 5}]}>
              Notifications are {permission ? 'enabled' : 'disabled'}.
            </Text>
            <Text style={styleApp.text}>
              You {permission ? 'will' : "won't"} be alerted for the following
              events:
            </Text>
          </Col>
        </Row>
        <View style={{height: 30, marginTop: 10}} />
        {this.rowIcon('comment-alt', 'New message')}
        {this.rowIcon('video', 'Invitation to a new session')}
        {this.rowIcon('plug', 'Someone connects to one of your sessions')}
        <View style={{height: 40}} />
        {this.button('Settings', colors.green, () => openSettings())}
      </View>
    );
  }

  render() {
    const {loader} = this.state;

    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          marginTop={10}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          loader={loader}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialBorderColorHeader={colors.white}
          initialTitleOpacity={1}
          initialBorderWidth={1}
          icon1={'times'}
          clickButton1={() => this.props.navigation.goBack()}
        />
        {this.notificationView()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: '100%',
    paddingLeft: 20,
    paddingRight: 20,
  },
  asyncImage: {
    width: 110,
    height: 110,
    borderColor: colors.off,
    borderRadius: 6,
    backgroundColor: colors.grey,
  },
});

const mapStateToProps = (state) => {
  return {
    infoUser: state.user.infoUser,
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps)(NotificationPage);
