import React, {Component} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  AppState,
  InteractionManager,
} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import {openSettings} from 'react-native-permissions';

import Button from '../../../layout/buttons/Button';
import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import Loader from '../../../layout/loaders/Loader';
import AllIcons from '../../../layout/icons/AllIcons';
import {permission} from '../../../functions/pictures';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
export default class NotificationPage extends Component {
  constructor(props) {
    super(props);
    const {params} = props.route;
    this.state = {
      appState: AppState.currentState,
      permission: false,
      loader: true,
      modalMode: params?.modal ? true : false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    InteractionManager.runAfterInteractions(async () => {
      this.loadPermission();
    });
    AppState.addEventListener('change', this._handleAppStateChange);
  }
  async loadPermission() {
    const permissionNotification = await permission('notification');
    this.setState({permission: permissionNotification, loader: false});
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
      <Row
        style={{
          paddingTop: 10,
          paddingBottom: 10,
          height: 40,
        }}>
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
    const {permission, loader} = this.state;
    return (
      <View style={{...styleApp.marginView, minHeight: 300, marginTop: 80}}>
        {loader ? (
          <Row style={{height: 60}}>
            <Col style={styleApp.center}>
              <Loader size={45} color={colors.grey} />
            </Col>
          </Row>
        ) : (
          <Row style={{height: 60}}>
            <Col size={65} style={styleApp.center}>
              <Text style={[styleApp.title, {fontSize: 22, marginBottom: 20}]}>
                Notifications are {permission ? 'ON' : 'OFF'}
              </Text>
              <Text style={styleApp.text}>
                You {permission ? 'will' : "won't"} be alerted for the following
                events
              </Text>
            </Col>
          </Row>
        )}

        <View style={{height: 30, marginTop: 0}} />
        <View style={styleApp.divider2} />
        {this.rowIcon('comment-alt', 'New message')}
        {this.rowIcon('video', 'Invitation to a new session')}
        {this.rowIcon('plug', 'Someone connects to one of your sessions')}

        <View style={styleApp.divider2} />
        <View style={{height: 40}} />
        {this.button('Settings', colors.green, () => openSettings())}
      </View>
    );
  }

  render() {
    const {modalMode} = this.state;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          marginTop={10}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[0, 50]}
          initialBorderColorIcon={'transparent'}
          initialBackgroundColor={'transparent'}
          initialBorderColorHeader={'transparent'}
          initialTitleOpacity={1}
          initialBorderWidth={1}
          icon1={modalMode ? 'times' : 'chevron-left'}
          sizeIcon1={modalMode ? 15 : 17}
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
