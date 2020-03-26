import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image} from 'react-native';
import {connect} from 'react-redux';
import firebase from 'react-native-firebase';

import NavigationService from '../../../../../NavigationService';

import ButtonColor from '../../../layout/Views/Button';
import AllIcons from '../../../layout/icons/AllIcons';
import {coachAction} from '../../../../actions/coachActions';
import {timing} from '../../../animations/animations';
import {getLastDrawing} from '../../../functions/coach';
import {Col, Row} from 'react-native-easy-grid';

import sizes from '../../../style/sizes';
import colors from '../../../style/colors';
import styleApp from '../../../style/style';

class RightButtons extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  button(icon, text, active, click, colorActive) {
    const {sizeButton} = icon;
    return (
      <ButtonColor
        view={() => {
          return (
            <Animated.View style={[styleApp.center]}>
              {icon.viewIcon ? (
                icon.viewIcon
              ) : (
                <AllIcons
                  type={icon.type}
                  color={
                    active && colorActive
                      ? colorActive
                      : active
                      ? colors.primary
                      : colors.white
                  }
                  size={19}
                  name={icon.name}
                />
              )}

              {!icon.hideText && (
                <Text
                  style={[
                    styleApp.text,
                    styles.textButton,
                    {
                      color:
                        active && colorActive
                          ? colorActive
                          : active
                          ? colors.primary
                          : colors.white,
                    },
                  ]}>
                  {text}
                </Text>
              )}
            </Animated.View>
          );
        }}
        click={async () => click()}
        style={[
          styles.button,
          {
            height: sizeButton ? sizeButton : styles.button.height,
          },
        ]}
        onPressColor={colors.off}
      />
    );
  }
  buttonColor(color) {
    const {settingsDraw, coachAction} = this.props;
    return this.button(
      {
        viewIcon: (
          <View
            style={[
              styles.roundColor,
              {
                backgroundColor: color,
                borderColor:
                  settingsDraw.color === color ? colors.secondary : 'white',
              },
            ]}></View>
        ),
        sizeButton: 45,
        hideText: true,
      },
      false,
      false,
      () => {
        console.log('start setCoachSessionDrawSettings');
        coachAction('setCoachSessionDrawSettings', {color: color});
      },
    );
  }
  toolsDraw() {
    const {settingsDraw, coachAction, videoID, session} = this.props;
    const {objectID} = session;
    return (
      <View style={styles.toolBox}>
        {this.buttonColor(colors.red)}
        {this.buttonColor(colors.blue)}
        {this.buttonColor(colors.greenStrong)}

        {this.button({name: 'trash', type: 'font'}, 'Clear', false, () => {
          firebase
            .database()
            .ref(`coachSessions/${objectID}/sharedVideos/${videoID}/drawings`)
            .remove();
          coachAction('setCoachSessionDrawSettings', {
            clear: !settingsDraw.clear,
          });
        })}

        {this.button({name: 'undo', type: 'font'}, 'Undo', false, () => {
          if (session.sharedVideos[videoID].drawings) {
            const idLastDrawing = getLastDrawing(session.sharedVideos[videoID])
              .id;
            firebase
              .database()
              .ref(
                `coachSessions/${objectID}/sharedVideos/${videoID}/drawings/${idLastDrawing}`,
              )
              .remove();
          }

          coachAction('setCoachSessionDrawSettings', {
            undo: !settingsDraw.undo,
          });
        })}
      </View>
    );
  }
  buttons() {
    const {state, setState, session} = this.props;
    const {userID} = this.props;
    if (!session) return null;
    const member = session.members[userID];

    if (!member) return null;
    const {objectID: sessionID} = session;
    const {shareScreen} = member;
    const {cameraFront, draw} = state;
    const {settingsDraw, coachAction} = this.props;
    console.log('render right buttons', session);
    return (
      <View style={styles.colButtonsRight}>
        {this.button(
          {name: 'sync', type: 'font'},
          cameraFront ? 'Front' : 'Back',
          !cameraFront,
          () => {
            setState({
              cameraFront: !cameraFront,
            });
          },
        )}
        {this.button(
          {name: 'mobile-alt', type: 'font'},
          'Share screen',
          shareScreen,
          async () => {
            console.log('click share screen');
            await coachAction('setCoachSessionDrawSettings', {
              touchEnabled: false,
            });
            await firebase
              .database()
              .ref('coachSessions/' + sessionID + '/members/' + userID)
              .update({shareScreen: !shareScreen});
          },
          colors.green,
        )}

        {shareScreen &&
          this.button(
            {name: 'magic', type: 'font'},
            'Draw',
            settingsDraw.touchEnabled,
            () => {
              console.log(settingsDraw);
              coachAction('setCoachSessionDrawSettings', {
                touchEnabled: !settingsDraw.touchEnabled,
              });
            },
            colors.title,
          )}

        {settingsDraw.touchEnabled && this.toolsDraw()}
      </View>
    );
  }

  render() {
    return this.buttons();
  }
}

const styles = StyleSheet.create({
  colButtonsRight: {
    flex: 1,
    // backgroundColor: 'red',
    position: 'absolute',
    right: 10,
    zIndex: 5,
    backgroundColor: colors.grey,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 5,
    top: sizes.heightHeaderHome,
    width: 65,
  },
  button: {height: 65, width: '100%'},
  textButton: {
    fontSize: 11,
    marginTop: 7,
  },
  roundColor: {
    height: 40,
    width: 40,
    borderRadius: 20,
    borderWidth: 2,
    ...styleApp.center,
  },
  toolBox: {},
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    settings: state.coach.settings,
    settingsDraw: state.coach.settingsDraw,
  };
};

export default connect(mapStateToProps, {coachAction})(RightButtons);
