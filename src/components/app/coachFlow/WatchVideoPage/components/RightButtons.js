import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image, Alert} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import Slider from '@react-native-community/slider';

import {fromHsv} from 'react-native-color-picker';

import ButtonColor from '../../../../layout/Views/Button';
import AllIcons from '../../../../layout/icons/AllIcons';
import {coachAction} from '../../../../../actions/coachActions';
import {getLastDrawing} from '../../../../functions/coach';

import {
  marginTopApp,
  marginTopAppLandscape,
  heightHeaderHome,
} from '../../../../style/sizes';
import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';

class RightButtons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colorSelected: colors.red,
    };
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

        if (
          prevDrawingsLength !== nextDrawingsLength &&
          prevDrawingsLength > nextDrawingsLength
        ) {
          if (nextDrawingsLength === 0) return this.props.drawViewRef.clear();
          this.props.drawViewRef.undo(lastDrawing.idSketch);
        }
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
        borderColor: colors.white,
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
        style={[styles.button, {height: 40}]}
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
    const {colorSelected} = this.state;
    const {archiveID, coachSessionID, settingsDraw, coachAction} = this.props;
    const valueColor = (value) => {
      return fromHsv({h: value, s: 0.8, v: 1});
    };
    return (
      <View style={styles.toolBox}>
        {/* {this.buttonColor(colors.red)}
        {this.buttonColor(colors.blue)}
        {this.buttonColor(colors.greenStrong)} */}

        {this.buttonColor(colorSelected)}
        <Slider
          style={{width: '100%', height: 40}}
          minimumValue={0}
          maximumValue={300}
          step={20}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
          onSlidingStart={(value) =>
            this.setState({colorSelected: valueColor(value)})
          }
          onValueChange={(value) =>
            this.setState({colorSelected: valueColor(value)})
          }
          onSlidingComplete={(value) =>
            coachAction('setCoachSessionDrawSettings', {
              color: valueColor(value),
            })
          }
          // onColorSelected={(color) => {
          //   // coachAction('setCoachSessionDrawSettings', {color: fromHsv(color)});
          //   console.log('onColorSelected', fromHsv(color));
          // }}
        />

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
    if (!portrait) marginTop = marginTopAppLandscape;
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
    borderWidth: 0,
    borderColor: colors.off,
    width: 55,
  },
  button: {height: 55, width: '100%', paddingTop: 10, paddingBottom: 10},
  textButton: {
    fontSize: 11,
    marginTop: 7,
  },
  roundColor: {
    height: 35,
    width: 35,
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
