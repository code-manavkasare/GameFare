import React from 'react';
import {Text, View, styleAppheet, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import StatusBar from '@react-native-community/status-bar';
import {navigate} from '../../../../../../NavigationService';
import Orientation from 'react-native-orientation-locker';
import Animated from 'react-native-reanimated';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import {heightFooter} from '../../../../style/sizes';
import AllIcons from '../../../../layout/icons/AllIcons';
import Button from '../../../../layout/Views/Button';

class MainTabIcon extends React.Component {
  constructor(props) {
    super(props);
  }
  buttonFooter() {
    const {
      tintColor,
      icon,
      label,
      displayPastille,
      signInToPass,
      userConnected,
      discussions,
      isFocused,
      userID,
      scale,
    } = this.props;
    const conditionDisplayPastille =
      Object.values(discussions).filter((discussion) => {
        const lastMessage = discussion.lastMessage;
        if (!lastMessage) {
          return [];
        }
        let usersRead = lastMessage.usersRead;
        if (!usersRead) {
          usersRead = [];
        }
        if (!usersRead[userID]) {
          return true;
        }
        return false;
      }).length !== 0;
    let {routeName, pageStack} = this.props;

    if (!userConnected && signInToPass) {
      routeName = 'SignIn';
      pageStack = 'Phone';
    }
    const labelStyle = [
      styleApp.textBold,
      {
        color: tintColor,
        marginTop: 6,
        fontSize: 13,
      },
    ];
    const recordButtonYTranslate = Animated.interpolate(scale, {
      inputRange: [0.7, 1],
      outputRange: [0, -15],
    });
    return (
      <Button
        view={() => {
          return (
            <Animated.View
              style={{
                ...styles.buttonView,
                transform: [
                  {scale: scale ? scale : 1},
                  {translateY: scale ? recordButtonYTranslate : 0},
                ],
              }}>
              {displayPastille && conditionDisplayPastille && (
                <Animated.View
                  style={{...styles.roundMessage, backgroundColor: tintColor}}
                />
              )}
              {label ? (
                <AllIcons
                  name={icon.name}
                  size={icon.size}
                  color={tintColor}
                  type={icon.type}
                  reanimated
                />
              ) : (
                <Animated.View
                  style={{...styles.recordButton, borderColor: tintColor}}
                />
              )}
              {label && (
                <Animated.Text style={labelStyle}>{label}</Animated.Text>
              )}
            </Animated.View>
          );
        }}
        click={() => {
          let params = {};
          if (isFocused && label === undefined) {
            params = {
              //Communicate with session
              action: Date.now(),
            };
          }
          navigate(routeName, {screen: pageStack, params});
        }}
        color={'transparent'}
        style={styles.button}
        onPressColor={'transparent'}
      />
    );
  }
  render() {
    return this.buttonFooter();
  }
}

const styles = StyleSheet.create({
  button: {
    height: heightFooter,
  },
  buttonView: {
    ...styleApp.shadowWeak,
    ...styleApp.center,
    marginTop: 50,
    height: heightFooter,
    width: '100%',
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
  roundMessage: {
    height: 11,
    width: 11,
    borderRadius: 5.5,
    top: 0,
    right: '25%',
    position: 'absolute',
    zIndex: 30,
    backgroundColor: colors.white,
  },
  recordButton: {
    ...styleApp.center,
    height: 70,
    width: 70,
    borderRadius: 35,
    borderWidth: 6.5,
  },
});

const mapStateToProps = (state) => {
  return {
    userConnected: state.user.userConnected,
    discussions: state.message.conversations,
    userID: state.user.userID,
  };
};

export default connect(
  mapStateToProps,
  {},
)(MainTabIcon);
