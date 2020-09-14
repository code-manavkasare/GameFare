import React from 'react';
import {Text, View, styleAppheet, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import {navigate} from '../../../../../../NavigationService';
import Orientation from 'react-native-orientation-locker';
import Reanimated from 'react-native-reanimated';
import {native} from '../../../../animations/animations';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import {heightFooter} from '../../../../style/sizes';
import AllIcons from '../../../../layout/icons/AllIcons';
import Button from '../../../../layout/Views/Button';

class FooterButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recording: false,
    };
    this.recordingIndicator = {
      color: new Animated.Value(0),
    };
  }
  componentDidUpdate(prevProps, prevState) {
    const {generalSessionRecording} = this.props;
    if (
      generalSessionRecording &&
      generalSessionRecording !== prevProps.generalSessionRecording
    ) {
      this.indicatorAnimation();
    }
  }
  indicatorAnimation() {
    const {generalSessionRecording} = this.props;
    if (generalSessionRecording) {
      Animated.timing(this.recordingIndicator.color, native(1, 1500)).start(
        () => {
          Animated.timing(this.recordingIndicator.color, native(0, 1500)).start(
            () => {
              this.indicatorAnimation();
            },
          );
        },
      );
    } else {
      this.recordingIndicator.color.setValue(0);
    }
  }
  recordButton() {
    const {tintColor, generalSessionRecording} = this.props;
    return (
      <Reanimated.View style={{...styles.recordButton, borderColor: tintColor}}>
        {generalSessionRecording && (
          <View style={{...styles.recordButtonActive}}>
            <Animated.View
              style={{
                ...styles.recordButtonOverlay,
                opacity: this.recordingIndicator.color,
              }}
            />
          </View>
        )}
      </Reanimated.View>
    );
  }
  buttonFooter() {
    const {
      icon,
      label,
      displayPastille,
      signInToPass,
      userConnected,
      discussions,
      isFocused,
      userID,
      scale,
      disableAnimation,
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
        color: colors.greyMidDark,
        marginTop: 6,
        fontSize: 13,
      },
    ];
    const recordButtonYTranslate = Reanimated.interpolate(scale, {
      inputRange: [0.7, 1],
      outputRange: [-5, disableAnimation ? -5 : -20],
    });
    return (
      <Button
        view={() => {
          return (
            <Reanimated.View
              style={{
                ...styles.buttonView,
                transform: [
                  {scale: scale ? (disableAnimation ? 0.7 : scale) : 1},
                  {translateY: scale ? recordButtonYTranslate : 0},
                ],
              }}>
              {displayPastille && conditionDisplayPastille && (
                <Reanimated.View
                  style={{
                    ...styles.roundMessage,
                    backgroundColor: colors.greyMidDark,
                  }}
                />
              )}
              {label ? (
                <AllIcons
                  name={icon.name}
                  size={icon.size}
                  color={colors.greyMidDark}
                  type={icon.type}
                  reanimated
                />
              ) : (
                this.recordButton()
              )}
              {label && (
                <Reanimated.Text style={labelStyle}>{label}</Reanimated.Text>
              )}
            </Reanimated.View>
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
    marginTop: 70,
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
  recordButtonActive: {
    height: 30,
    width: 30,
    borderRadius: 5,
    backgroundColor: colors.grey,
    opacity: 0.5,
  },
  recordButtonOverlay: {
    ...styleApp.fullSize,
    backgroundColor: colors.red,
    borderRadius: 5,
  },
});

const mapStateToProps = (state) => {
  return {
    userConnected: state.user.userConnected,
    discussions: state.message.conversations,
    userID: state.user.userID,
    generalSessionRecording: state.layout.generalSessionRecording,
  };
};

export default connect(
  mapStateToProps,
  {},
)(FooterButton);
