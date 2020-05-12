import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

import ButtonColor from '../../../../layout/Views/Button';
import AllIcons from '../../../../layout/icons/AllIcons';
import {coachAction} from '../../../../../actions/coachActions';
import {getLastDrawing} from '../../../../functions/coach';

import {marginTopApp, marginTopAppLanscape} from '../../../../style/sizes';
import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';

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
                    styleApp.textBold,
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
            ]}
          />
        ),
        sizeButton: 35,
        hideText: true,
      },
      false,
      false,
      () => {
        coachAction('setCoachSessionDrawSettings', {color: color});
      },
    );
  }
  toolsDraw() {
    const {
      settingsDraw,
      coachAction,
      archiveID,
      coachSessionID,
      videoBeingShared,
    } = this.props;
    return (
      <View style={styles.toolBox}>
        {this.buttonColor(colors.red)}
        {this.buttonColor(colors.blue)}
        {this.buttonColor(colors.greenStrong)}

        {this.button({name: 'undo', type: 'font'}, 'Undo', false, () => {
          if (videoBeingShared.drawings) {
            const idLastDrawing = getLastDrawing(videoBeingShared).id;
            database()
              .ref(
                `coachSessions/${coachSessionID}/sharedVideos/${archiveID}/drawings/${idLastDrawing}`,
              )
              .remove();
          }

          coachAction('setCoachSessionDrawSettings', {
            undo: !settingsDraw.undo,
          });
        })}

        {this.button({name: 'trash', type: 'font'}, 'Clear', false, () => {
          database()
            .ref(
              `coachSessions/${coachSessionID}/sharedVideos/${archiveID}/drawings`,
            )
            .remove();
          coachAction('setCoachSessionDrawSettings', {
            clear: !settingsDraw.clear,
          });
        })}
      </View>
    );
  }
  buttons() {
    const {archiveID, videoBeingShared} = this.props;

    const {
      settingsDraw,
      coachAction,
      personSharingScreen,
      portrait,
      drawingOpen,
    } = this.props;
    if (!drawingOpen) return null;

    const displayButtonDraw =
      personSharingScreen && archiveID === videoBeingShared.id;
    let marginTop = marginTopApp;
    if (!portrait) marginTop = marginTopAppLanscape;
    return (
      <View style={[styles.colButtonsRight, {top: marginTop + 10}]}>
        {displayButtonDraw &&
          this.button(
            {name: 'magic', type: 'font'},
            'Draw',
            settingsDraw.touchEnabled,
            () =>
              coachAction('setCoachSessionDrawSettings', {
                touchEnabled: !settingsDraw.touchEnabled,
              }),
            colors.secondary,
          )}

        {displayButtonDraw && settingsDraw.touchEnabled && this.toolsDraw()}
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
    position: 'absolute',
    right: '5%',
    zIndex: 40,
    backgroundColor: colors.title + '90',
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: colors.off,
    width: 65,
  },
  button: {flex: 1, width: '100%', paddingTop: 10, paddingBottom: 10},
  textButton: {
    fontSize: 11,
    marginTop: 7,
  },
  roundColor: {
    height: 30,
    width: 30,
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
    portrait: state.layout.currentScreenSize.portrait,
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(RightButtons);
