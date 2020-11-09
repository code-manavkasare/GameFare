import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image, Alert} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import Slider from '@react-native-community/slider';

import {fromHsv} from 'react-native-color-picker';

import ButtonColor from '../../../../layout/Views/Button';
import AllIcons from '../../../../layout/icons/AllIcons';
import {coachAction} from '../../../../../store/actions/coachActions';
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
      colorSelected: this.props.settingsDraw.color,
    };
  }
  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }
  componentDidUpdate(prevProps) {
    const {userID} = this.props;
    let prevDrawings = prevProps.videoBeingShared.drawings;
    if (prevDrawings) {
      const lastDrawing = getLastDrawing(prevDrawings);
      if (lastDrawing.userID === userID) {
        const prevDrawingsLength = Object.values(prevDrawings).length;
        let nextDrawings = this.props.videoBeingShared.drawings;
        if (!nextDrawings) {
          nextDrawings = {};
        }
        const nextDrawingsLength = Object.values(nextDrawings).length;

        if (
          prevDrawingsLength !== nextDrawingsLength &&
          prevDrawingsLength > nextDrawingsLength
        ) {
          if (nextDrawingsLength === 0) {
            return this.props.drawViewRef.clear();
          }
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
    const {videoBeingShared, coachSessionID, archiveID} = this.props;
    if (videoBeingShared?.drawings) {
      if (!idLastDrawing) {
        idLastDrawing = getLastDrawing(videoBeingShared.drawings).id;
      }
      await database()
        .ref(
          `coachSessions/${coachSessionID}/sharedVideos/${archiveID}/drawings/${idLastDrawing}`,
        )
        .remove();
    } else {
      this.props.drawViewRef.undo();
    }
  };

  toolsDraw() {
    const {colorSelected} = this.state;
    const {archiveID, coachSessionID, settingsDraw, coachAction} = this.props;
    const valueColor = (value) => {
      return fromHsv({h: value, s: 0.8, v: 1});
    };
    return (
      <View style={[styleApp.center, styles.toolBox]}>
        {this.buttonColor(colorSelected)}
        <Slider
          style={{width: 80, height: '100%'}}
          minimumValue={0}
          maximumValue={300}
          step={20}
          minimumTrackTintColor={colors.white}
          maximumTrackTintColor={valueColor(settingsDraw.color)}
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
    const {portrait, drawingOpen} = this.props;
    if (!drawingOpen) {
      return null;
    }

    let marginTop = marginTopApp;
    if (!portrait) {
      marginTop = marginTopAppLandscape;
    }
    return (
      <View
        style={[styles.colButtonsRight, {top: marginTop + heightHeaderHome}]}>
        {drawingOpen && this.toolsDraw()}
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
    width: 220,
    height: 50,
    paddingTop: 0,
    paddingBottom: 10,
    zIndex: 2,
    backgroundColor: colors.transparentGrey,

    borderRadius: 25,
    borderWidth: 0,
    borderColor: colors.off,
  },
  button: {height: 40, width: 40, paddingTop: 10, paddingBottom: 10},
  textButton: {
    fontSize: 11,
    marginTop: 7,
  },
  roundColor: {
    height: 30,
    width: 30,
    borderRadius: 20,
    borderWidth: 0,
    ...styleApp.center,
  },
  toolBox: {
    // backgroundColor: 'red',
    flexDirection: 'row',
    paddingLeft: 10,
    paddingTop: 5,
    width: 200,
  },
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
