import React from 'react';
import {Text, View, styleAppheet, StyleSheet} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import {connect} from 'react-redux';
import StatusBar from '@react-native-community/status-bar';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import AllIcons from '../../../../layout/icons/AllIcons';
import Button from '../../../../layout/Views/Button';

class MainTabIcon extends React.Component {
  constructor(props) {
    super(props);
  }
  buttonFooter() {
    const {
      navigation,
      tintColor,
      icon,
      label,
      signInToPass,
      userConnected,
      index,
      discussions,
      translateBlueView,
      numberRoutes,
      userID,
    } = this.props;
    const displayPastille =
    Object.values(discussions).filter((discussion) => {
      let usersRead = discussion.lastMessage.usersRead;
      if (!usersRead) usersRead = [];
      if (!usersRead[userID]) return true;
      return false;
    }).length !== 0;
    let {routeName} = this.props;

    if (!userConnected && signInToPass) routeName = 'SignIn';
    return (
      <Button
        view={() => {
          return (
            <View>
              {displayPastille && (
                <View
                  style={[styleApp.roundMessage, {backgroundColor: tintColor}]}
                />
              )}
              <AllIcons
                name={icon.name}
                size={icon.size}
                color={tintColor}
                type={icon.type}
              />
            </View>
          );
        }}
        click={() => {
          translateBlueView(index,numberRoutes)
          if (routeName === 'Stream')
            StatusBar.setBarStyle('light-content', true);
          else StatusBar.setBarStyle('dark-content', true);
          navigation.navigate(routeName);
        }}
        // color={'red'}
        style={styles.button}
        onPressColor={colors.off}
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
    width: '100%',
    height: '100%',
    borderRadius: 0,
    paddingLeft: 0,
    paddingRight: 0,
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
    discussions: state.message.conversations,
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps, {})(MainTabIcon);
