import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image, Alert} from 'react-native';
import {connect} from 'react-redux';
import Slider from '@react-native-community/slider';

import ButtonColor from '../../../../layout/Views/Button';
import AllIcons from '../../../../layout/icons/AllIcons';
import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import {valueColor} from '../../../../functions/pictures';

class DrawTools extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colorDrawing: 0,
      drawSetting: 'custom',
    };
  }
  button(icon, text, active, click, colorActive) {
    return (
      <ButtonColor
        view={() => {
          return (
            <AllIcons
              type={icon.type}
              color={
                icon.color
                  ? icon.color
                  : active && colorActive
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
        click={async () => true}
        style={[styles.button, {height: 40}]}
        onPressColor={colors.off}
      />
    );
  }
  toolsDraw() {
    const {colorDrawing, drawSetting} = this.state;
    const {clear, undo, setState} = this.props;

    return (
      <View style={[styleApp.center, styles.toolBox]}>
        {this.buttonColor(valueColor(colorDrawing))}
        <Slider
          style={{width: 80, height: '100%'}}
          minimumValue={0}
          maximumValue={300}
          step={20}
          minimumTrackTintColor={colors.white}
          maximumTrackTintColor={colors.title}
          onSlidingStart={(value) => this.setState({colorDrawing: value})}
          onValueChange={(value) => this.setState({colorDrawing: value})}
          onSlidingComplete={async (value) => {
            await this.setState({colorDrawing: value});
            setState({colorDrawing: valueColor(value)});
          }}
        />
        {this.button(
          {
            name: 'gesture',
            type: 'mat',
            color: drawSetting === 'custom' ? colors.secondary : colors.white,
          },
          '',
          false,
          () => {
            this.setState({drawSetting: 'custom'});
            setState({drawSetting: 'custom'});
          },
        )}

        {this.button(
          {
            name: 'remove',
            type: 'mat',
            color: drawSetting === 'straight' ? colors.secondary : colors.white,
          },
          '',
          false,
          () => {
            this.setState({drawSetting: 'straight'});
            setState({drawSetting: 'straight'});
          },
        )}
        {this.button(
          {
            name: 'circle',
            type: 'font',
            color: drawSetting === 'circle' ? colors.secondary : colors.white,
          },
          '',
          false,
          () => {
            this.setState({drawSetting: 'circle'});
            setState({drawSetting: 'circle'});
          },
        )}

        {this.button(
          {
            name: 'square',
            type: 'font',
            color:
              drawSetting === 'rectangle' ? colors.secondary : colors.white,
          },
          '',
          false,
          () => {
            this.setState({drawSetting: 'rectangle'});
            setState({drawSetting: 'rectangle'});
          },
        )}

        {this.button({name: 'history', type: 'mat'}, 'Undo', false, () =>
          undo(),
        )}

        {this.button({name: 'delete', type: 'mat'}, 'Clear', false, () =>
          clear(),
        )}
      </View>
    );
  }
  buttons() {
    const {landscape} = this.props;

    let marginTop = 100;
    if (landscape) marginTop = 70;

    return (
      <View style={[styles.colButtonsRight, {marginTop}]}>
        {this.toolsDraw()}
      </View>
    );
  }

  render() {
    return this.buttons();
  }
}

const styles = StyleSheet.create({
  colButtonsRight: {
    top: 0,
    position: 'absolute',
    right: '5%',
    width: 380,
    height: 50,
    zIndex: 20,
    backgroundColor: colors.title + '70',
    borderRadius: 30,
    ...styleApp.center,
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
  {},
)(DrawTools);
