import React from 'react';
import {Text, View, styleAppheet, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import StatusBar from '@react-native-community/status-bar';
import {navigate} from '../../../../../../NavigationService';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import AllIcons from '../../../../layout/icons/AllIcons';
import Button from '../../../../layout/Views/Button';

class MainTabIcon extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isFocused !== this.props.isFocused && this.props.isFocused) {
      const {translateBlueView, index, numberRoutes} = this.props;
      if (Number(index) === 1) StatusBar.setBarStyle('light-content', true);
      else StatusBar.setBarStyle('dark-content', true);
      StatusBar.setBarStyle('dark-content', true);
      translateBlueView(index, numberRoutes);
    }
  }
  buttonFooter() {
    const {
      navigation,
      tintColor,
      icon,
      label,
      displayPastille,
      signInToPass,
      userConnected,
      index,
      discussions,
      userID,
    } = this.props;
    const conditionDisplayPastille =
      Object.values(discussions).filter((discussion) => {
        let usersRead = discussion.lastMessage.usersRead;
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
            <View>
              {displayPastille && conditionDisplayPastille && (
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
          navigate(routeName, {screen: pageStack, params: {}});
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

export default connect(
  mapStateToProps,
  {},
)(MainTabIcon);
