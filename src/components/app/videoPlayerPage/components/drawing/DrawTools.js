import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image, Alert} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';

import ButtonColor from '../../../../layout/Views/Button';
import AllIcons from '../../../../layout/icons/AllIcons';
import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import {valueColor} from '../../../../functions/pictures';

class DrawTools extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colorDrawing: colors.red,
      drawSetting: 'custom',
      submenu: false,
    };
  }
  arrow = () => {
    const style = {
      position: 'absolute',
      top: 5,
      right: -10,
      width: 20,
      height: 20,
      ...styleApp.center,
    };
    return (
      <View style={style}>
        <AllIcons
          type={'font'}
          color={colors.white}
          size={14}
          name={'chevron-right'}
        />
      </View>
    );
  };
  button({icon, click, displayArrow}) {
    const {name, type, size, color} = icon;
    return (
      <ButtonColor
        view={() => {
          return (
            <View style={[styleApp.fullSize, styleApp.center]}>
              <Row>
                <Col style={styleApp.center}>
                  <AllIcons type={type} color={color} size={size} name={name} />
                </Col>
                {displayArrow && this.arrow()}
              </Row>
            </View>
          );
        }}
        click={async () => click()}
        style={styles.button}
        onPressColor={colors.off}
      />
    );
  }
  buttonColor({color, setColor, displayArrow}) {
    const styleButton = [
      styles.roundColor,
      {
        backgroundColor: color,
        borderColor: colors.white,
      },
    ];
    const {submenu} = this.state;
    return (
      <ButtonColor
        view={() => {
          return (
            <View style={[styleApp.center, styleApp.fullSize]}>
              {displayArrow && this.arrow()}
              <View style={styleButton} />
            </View>
          );
        }}
        click={() => {
          if (setColor) return this.setColor(color);
          return this.setState({
            submenu: submenu === 'color' ? false : 'color',
          });
        }}
        style={[styles.button]}
        onPressColor={colors.off}
      />
    );
  }
  setColor = async (color) => {
    const {setState} = this.props;
    await this.setState({colorDrawing: color, submenu: false});
    setState({colorDrawing: color});
  };
  setShape = async (drawSetting) => {
    const {setState} = this.props;
    await this.setState({drawSetting, submenu: false});
    setState({drawSetting});
  };
  submenuView = () => {
    const {submenu, colorDrawing, drawSetting} = this.state;
    if (!submenu) return null;
    return (
      <View style={[styles.colButtonsRight, {left: 70, top: -10}]}>
        {submenu === 'color' ? (
          <View style={[styles.toolBox, styleApp.center]}>
            {this.buttonColor({color: colors.green, setColor: true})}
            {this.buttonColor({color: colors.red, setColor: true})}
            {this.buttonColor({color: colors.secondary, setColor: true})}
            {this.buttonColor({color: colors.primary, setColor: true})}
            {this.buttonColor({color: colors.white, setColor: true})}
          </View>
        ) : submenu === 'shape' ? (
          <View style={[styles.toolBox, styleApp.center]}>
            {this.button({
              icon: {
                name: 'gesture',
                type: 'mat',
                color: drawSetting === 'custom' ? colorDrawing : colors.white,
                size: 20,
              },
              click: () => this.setShape('custom'),
            })}
            {this.button({
              icon: {
                name: 'remove',
                type: 'mat',
                color: drawSetting === 'straight' ? colorDrawing : colors.white,
                size: 20,
              },
              click: () => this.setShape('straight'),
            })}
            {this.button({
              icon: {
                name: 'circle',
                type: 'font',
                color: drawSetting === 'circle' ? colorDrawing : colors.white,
                size: 20,
              },
              click: () => this.setShape('circle'),
            })}
            {this.button({
              icon: {
                name: 'square',
                type: 'font',
                color:
                  drawSetting === 'rectangle' ? colorDrawing : colors.white,
                size: 20,
              },
              click: () => this.setShape('rectangle'),
            })}
          </View>
        ) : null}
      </View>
    );
  };
  toolsDraw() {
    const {colorDrawing, submenu, drawSetting} = this.state;
    const {clear, undo} = this.props;

    return (
      <View style={[styles.toolBox]}>
        <View style={styleApp.center}>
          {this.button({
            displayArrow: submenu === 'color',
            icon: {
              name: 'palette',
              type: 'font',
              color: colorDrawing,
              size: 23,
            },

            click: () =>
              this.setState({submenu: submenu === 'color' ? false : 'color'}),
          })}
          {this.button({
            displayArrow: submenu === 'shape',
            arrow: submenu === 'shape' ? 'chevron-right' : 'chevron-left',
            icon: {
              name:
                drawSetting === 'custom'
                  ? 'gesture'
                  : drawSetting === 'circle'
                  ? 'circle'
                  : drawSetting === 'rectangle'
                  ? 'square'
                  : drawSetting === 'straight'
                  ? 'remove'
                  : null,
              type:
                drawSetting === 'custom' || drawSetting === 'straight'
                  ? 'mat'
                  : drawSetting === 'circle' || drawSetting === 'rectangle'
                  ? 'font'
                  : 'font',
              color: colorDrawing,
              size: 23,
            },

            click: () =>
              this.setState({submenu: submenu === 'shape' ? false : 'shape'}),
          })}

          {this.button({
            icon: {name: 'history', type: 'mat', size: 23, color: colors.white},
            click: () => undo(),
          })}

          {this.button({
            icon: {name: 'delete', type: 'mat', color: colors.white, size: 23},
            click: () => clear(),
          })}
        </View>
        {this.submenuView()}
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
    left: '5%',
    width: 60,
    flex: 1,
    zIndex: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: colors.title + '70',
    borderRadius: 30,
    ...styleApp.center,
  },
  button: {height: 45, width: 45, paddingTop: 10, paddingBottom: 10},
  textButton: {
    fontSize: 11,
    marginTop: 7,
  },
  roundColor: {
    height: 25,
    width: 25,
    borderRadius: 20,
    borderWidth: 0,
    ...styleApp.center,
  },
  toolBox: {
    // backgroundColor: 'red',
    flexDirection: 'column',
    paddingLeft: 0,
    width: '100%',
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
