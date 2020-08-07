import React from 'react';
import {Text, View, styleAppheet, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import StatusBar from '@react-native-community/status-bar';
import {navigate} from '../../../../../../NavigationService';
import Orientation from 'react-native-orientation-locker';

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
    } = this.props;
    const conditionDisplayPastille =
      Object.values(discussions).filter((discussion) => {
        const lastMessage = discussion.lastMessage;
        if (!lastMessage) return [];
        let usersRead = lastMessage.usersRead;
        if (!usersRead) usersRead = [];
        if (!usersRead[userID]) return true;
        return false;
      }).length !== 0;
    let {routeName, pageStack} = this.props;

    if (!userConnected && signInToPass) {
      routeName = 'SignIn';
      pageStack = 'Phone';
    }
    return (
      <Button
        view={() => {
          return (
            <View
              style={[
                styleApp.fullSize,
                styleApp.center4,
                {height: heightFooter, paddingTop: label ? 5 : 0},
              ]}>
              {displayPastille && conditionDisplayPastille && (
                <View
                  style={[styles.roundMessage, {backgroundColor: tintColor}]}
                />
              )}
              {label ? (
                <AllIcons
                  name={icon.name}
                  size={icon.size}
                  color={tintColor}
                  type={icon.type}
                />
              ) : (
                <View
                  style={{
                    ...styleApp.center,
                    height: 70,
                    width: 70,
                    borderRadius: 35,
                    borderWidth: 5,
                    marginTop: -5,
                    borderColor: tintColor,
                  }}>
                  {/* <AllIcons
                    name={icon.name}
                    size={icon.size}
                    color={tintColor}
                    type={icon.type}
                  /> */}
                </View>
              )}
              {label && (
                <Text
                  style={[
                    styleApp.textBold,
                    {color: tintColor, marginTop: 6, fontSize: 13},
                  ]}>
                  {label}
                </Text>
              )}
            </View>
          );
        }}
        click={() => {
          navigate(routeName, {screen: pageStack, params: {}});
        }}
        color={colors.white}
        style={styles.button}
        onPressColor={colors.off2}
      />
    );
  }
  render() {
    return this.buttonFooter();
  }
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: '100%',
    // borderRadius: 30,
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
    right: '34%',
    position: 'absolute',
    zIndex: 30,
    borderWidth: 1,
    borderColor: colors.white,
    backgroundColor: colors.primary,
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
