import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

import ButtonColor from '../../../../layout/Views/Button';
import AllIcons from '../../../../layout/icons/AllIcons';
import {coachAction} from '../../../../../actions/coachActions';
import {getLastDrawing} from '../../../../functions/coach';

import {
  marginTopApp,
  marginTopAppLanscape,
  heightHeaderHome,
} from '../../../../style/sizes';
import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';

class RightButtons extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  componentDidUpdate(prevProps) {
    const {userID} = this.props;
    let prevDrawings = prevProps.videoBeingShared.drawings;
    if (prevDrawings) {
      const lastDrawing = getLastDrawing(prevDrawings);
      if (lastDrawing.userID === userID) {
        const prevDrawingsLength = Object.values(prevDrawings).length;
        let nextDrawings = this.props.videoBeingShared.drawings;
        if (!nextDrawings) nextDrawings = {};
        const nextDrawingsLength = Object.values(nextDrawings).length;
        console.log(
          'nextDrawingsLength',
          nextDrawingsLength,
          prevDrawingsLength,
        );
        if (
          prevDrawingsLength !== nextDrawingsLength &&
          prevDrawingsLength > nextDrawingsLength
        )
          this.props.drawViewRef.undo(lastDrawing.idSketch);
      }
    }
  }
  button(icon, text, active, click, colorActive) {
    return (
      <ButtonColor
        view={() => {
          return (
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
          );
        }}
        click={async () => click()}
        style={styles.button}
        onPressColor={colors.off}
      />
    );
  }
  buttonColor(color) {
    const {settingsDraw, coachAction} = this.props;
    const styleButton = [
      styles.roundColor,
      {
        backgroundColor: color,

        borderColor: settingsDraw.color === color ? colors.secondary : 'white',
      },
    ];
    return (
      <ButtonColor
        view={() => {
          return <View style={styleButton} />;
        }}
        click={async () =>
          coachAction('setCoachSessionDrawSettings', {color: color})
        }
        style={[styles.button, {height: 35}]}
        onPressColor={colors.off}
      />
    );
  }
  undo = async (idLastDrawing) => {
    const {
      videoBeingShared,
      coachSessionID,
      settingsDraw,
      archiveID,
      drawViewRef,
      coachAction,
    } = this.props;
    if (videoBeingShared.drawings) {
      if (!idLastDrawing)
        idLastDrawing = getLastDrawing(videoBeingShared.drawings).id;
      await database()
        .ref(
          `coachSessions/${coachSessionID}/sharedVideos/${archiveID}/drawings/${idLastDrawing}`,
        )
        .remove();
    }
  };
  toolsDraw() {
    const {archiveID, coachSessionID} = this.props;
    return (
      <View style={styles.toolBox}>
        {this.buttonColor(colors.red)}
        {this.buttonColor(colors.blue)}
        {this.buttonColor(colors.greenStrong)}

        {this.button({name: 'undo', type: 'font'}, 'Undo', false, () =>
          this.undo(),
        )}

        {this.button({name: 'trash', type: 'font'}, 'Clear', false, () => {
          database()
            .ref(
              `coachSessions/${coachSessionID}/sharedVideos/${archiveID}/drawings`,
            )
            .remove();
          this.props.drawViewRef.clear();
        })}
      </View>
    );
  }
  openToolBox() {
    const {coachAction, settingsDraw} = this.props;
    console.log('openToolBox', settingsDraw.touchEnabled);
    coachAction('setCoachSessionDrawSettings', {
      touchEnabled: !settingsDraw.touchEnabled,
    });
  }
  buttons() {
    const {archiveID, videoBeingShared, settingsDraw} = this.props;
    const {personSharingScreen, portrait, drawingEnable} = this.props;
    const {touchEnabled} = settingsDraw;
    if (!drawingEnable || !touchEnabled) return null;

    const displayButtonDraw =
      personSharingScreen && archiveID === videoBeingShared.id;
    let marginTop = marginTopApp;
    if (!portrait) marginTop = marginTopAppLanscape;
    return (
      <View
        style={[styles.colButtonsRight, {top: marginTop + heightHeaderHome}]}>
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
    paddingTop: 10,
    paddingBottom: 10,
    zIndex: 2,
    backgroundColor: colors.title + '90',

    borderRadius: 27.5,
    borderWidth: 1,
    borderColor: colors.off,
    width: 55,
  },
  button: {height: 55, width: '100%', paddingTop: 10, paddingBottom: 10},
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
