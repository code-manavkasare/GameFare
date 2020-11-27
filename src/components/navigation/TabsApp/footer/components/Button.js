import React from 'react';
import {Text, View, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import {navigate} from '../../../../../../NavigationService';
import Reanimated from 'react-native-reanimated';
import {native} from '../../../../animations/animations';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import {heightFooter} from '../../../../style/sizes';
import AllIcons from '../../../../layout/icons/AllIcons';
import Button from '../../../../layout/Views/Button';
import {logMixpanel} from '../../../../functions/logs';
import {
  numNotificationsSelector,
  userConnectedSelector,
} from '../../../../../store/selectors/user';
import {generalSessionRecordingSelector} from '../../../../../store/selectors/layout';

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
    const {generalSessionRecording, inSession} = this.props;
    if (
      (generalSessionRecording &&
        generalSessionRecording !== prevProps.generalSessionRecording) ||
      (inSession && inSession !== prevProps.inSession)
    ) {
      this.indicatorAnimation();
    }
  }

  indicatorAnimation() {
    const {generalSessionRecording, inSession} = this.props;
    if (generalSessionRecording || inSession) {
      Animated.timing(this.recordingIndicator.color, native(1, 1500)).start(
        () => {
          Animated.timing(
            this.recordingIndicator.color,
            native(generalSessionRecording ? 0 : 0.65, 1500),
          ).start(() => {
            this.indicatorAnimation();
          });
        },
      );
    } else {
      this.recordingIndicator.color.setValue(0);
    }
  }
  recordButton() {
    const {
      tintColor,
      generalSessionRecording,
      inSession,
      inSessionIndication,
    } = this.props;
    const inSessionContainerStyle = {
      ...styleApp.fullSize,
      opacity: this.recordingIndicator.color,
      position: 'absolute',
    };
    const inSessionViewStyle = {
      ...styles.inSessionView,
      opacity: inSessionIndication,
    };
    return (
      <Reanimated.View style={{...styles.recordButton, borderColor: tintColor}}>
        {generalSessionRecording ? (
          <View style={{...styles.recordButtonActive}}>
            <Animated.View
              style={{
                ...styles.recordButtonOverlay,
                opacity: this.recordingIndicator.color,
              }}
            />
          </View>
        ) : null}
        {inSession && !generalSessionRecording ? (
          <Animated.View style={inSessionContainerStyle}>
            <Reanimated.View style={inSessionViewStyle}>
              <Text style={styles.inSessionText}>Live</Text>
            </Reanimated.View>
          </Animated.View>
        ) : null}
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
      isFocused,
      scale,
      disableAnimation,
      numberNotifications,
      tintColor,
    } = this.props;

    let {routeName, pageStack} = this.props;

    if (!userConnected && signInToPass) {
      routeName = 'SignIn';
      pageStack = 'Phone';
    }
    const labelStyle = [
      styleApp.textBold,
      {
        color: tintColor,
        marginTop: 3,
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
              {label ? (
                <AllIcons
                  name={icon.name}
                  size={icon.size}
                  color={tintColor}
                  type={icon.type}
                  reanimated
                />
              ) : (
                this.recordButton()
              )}
              {label ? (
                <Reanimated.Text style={labelStyle}>{label}</Reanimated.Text>
              ) : null}
              {displayPastille && numberNotifications > 0 ? (
                <View
                  pointerEvents="none"
                  style={[
                    styles.absoluteViewBadge,
                    {
                      backgroundColor: isFocused
                        ? colors.primaryLight
                        : colors.grey,
                    },
                  ]}>
                  <Text
                    style={[
                      styleApp.textBold,
                      {color: colors.white, fontSize: 10},
                    ]}>
                    {/* {numberNotifications} */}
                  </Text>
                </View>
              ) : null}
            </Reanimated.View>
          );
        }}
        click={() => {
          let params = {};
          if (isFocused && label === undefined) {
            params = {
              action: Date.now(),
            };
          }
          logMixpanel({label: 'Click footer: ' + label, params});
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
    marginTop: 40,
    height: heightFooter,
    width: '100%',
  },

  inSessionView: {
    ...styleApp.center,
    ...styleApp.fullSize,
    position: 'absolute',
    backgroundColor: colors.red,
    borderRadius: 100,
  },
  inSessionText: {
    ...styleApp.textBold,
    color: colors.white,
    fontSize: 18,
  },
  rowInButton: {
    height: '100%',
  },
  absoluteViewBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 5,
    width: 5,
    borderRadius: 10,
    backgroundColor: colors.blue,
    position: 'absolute',
    top: 54,
    right: '48%',
  },
  recordButton: {
    ...styleApp.center,
    height: 70,
    width: 70,
    borderRadius: 35,
    marginTop: 5,
    borderWidth: 6.5,
    overflow: 'visible',
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
    userConnected: userConnectedSelector(state),
    generalSessionRecording: generalSessionRecordingSelector(state),
    numberNotifications: numNotificationsSelector(state),
  };
};

export default connect(mapStateToProps)(FooterButton);
