import React from 'react';
import {Text, View, styleAppheet, StyleSheet} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import {connect} from 'react-redux';
import StatusBar from '@react-native-community/status-bar';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import AllIcons from '../../../../layout/icons/AllIcons';
import Button from '../../../../layout/Views/Button';

const ButtonMessage = class MainTabIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newMessage: false,
    };
  }
  render() {
    const {
      routeName,
      navigation,
      tintColor,
      icon,
      label,
      displayPastille,
      signInToPass,
      userConnected,
    } = this.props;

    let {navigateTo} = this.props;

    if (!userConnected && signInToPass) navigateTo = 'SignIn';
    return (
      <Button
        view={() => {
          return (
            <Row>
              {displayPastille && (
                <View
                  style={[styleApp.roundMessage, {backgroundColor: tintColor}]}
                />
              )}
              <Col style={[styleApp.center4, {paddingTop: 15}]}>
                <AllIcons
                  name={icon.name}
                  size={icon.size}
                  color={tintColor}
                  style={styleApp.iconFooter}
                  type={icon.type}
                />
                <Text style={[styles.textButton, {color: tintColor}]}>
                  {label}
                </Text>
              </Col>
            </Row>
          );
        }}
        click={() => {
          StatusBar.setBarStyle('dark-content', true);
          navigation.navigate(navigateTo);
        }}
        color={'white'}
        style={styles.button}
        onPressColor={colors.off}
      />
    );
  }
};

class MainTabIcon extends React.Component {
  constructor(props) {
    super(props);
  }
  buttonCamera() {
    const {navigation, focused, tintColor, routeName} = this.props;
    return (
      <Button
        view={() => {
          return (
            <AllIcons
              name={'video-camera'}
              size={23}
              color={colors.white}
              type={'moon'}
            />
          );
        }}
        click={() => {
          // change color status bar
          StatusBar.setBarStyle('light-content', true);
          navigation.navigate('StartCoaching', {});
        }}
        color={colors.primary}
        style={[
          styles.buttonCamera,
          {
            borderWidth: 3,
            borderColor: focused ? colors.white : colors.white,
          },
        ]}
        onPressColor={focused ? colors.primaryLight : colors.primaryLight}
      />
    );
  }
  buttonFooter() {
    const {
      navigation,
      focused,
      tintColor,
      routeName,
      iconName,
      label,
      userConnected,
      signInToPass,
    } = this.props;
    console.log('routeName', routeName);
    if (routeName === 'StartCoaching') return this.buttonCamera();

    return (
      <ButtonMessage
        navigation={navigation}
        navigateTo={routeName}
        signInToPass={signInToPass}
        userConnected={userConnected}
        displayPastille={routeName === 'MessageList' && userConnected && true}
        label={label}
        icon={{
          name: iconName,
          type: 'moon',
          size: 16,
        }}
        tintColor={tintColor}
      />
    );
  }

  render() {
    return this.buttonFooter();
  }
}

const styles = StyleSheet.create({
  button: {
    paddingTop: 0,
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
    borderRadius: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  buttonCamera: {
    paddingTop: 0,
    width: 70,
    height: 70,
    marginTop: -35,
    borderRadius: 40,
  },
  textButton: {
    ...styleApp.footerText,
    marginTop: 6,
    marginBottom: 5,
    fontSize: 12.5,
  },
  rowInButton: {
    height: '100%',
  },
});

const mapStateToProps = (state) => {
  return {
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps, {})(MainTabIcon, ButtonMessage);
