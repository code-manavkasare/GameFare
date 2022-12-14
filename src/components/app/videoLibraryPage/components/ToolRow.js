import React, {Component} from 'react';
import {Text, StyleSheet, View, Animated} from 'react-native';
import moment from 'moment';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {connect} from 'react-redux';

import colors from '../../../style/colors';
import {marginBottomApp, heightFooter} from '../../../style/sizes';
import ButtonColor from '../../../layout/Views/Button';
import Loader from '../../../layout/loaders/Loader';
import styleApp from '../../../style/style';
import AllIcon from '../../../layout/icons/AllIcons';
import {native} from '../../../animations/animations';
import VideoList from './VideoList';
import sizes from '../../../style/sizes';
import {boolShouldComponentUpdate} from '../../../functions/redux';
import {currentSessionIDSelector} from '../../../../store/selectors/sessions';
import {userIDSelector} from '../../../../store/selectors/user';

const heightFooterFull = heightFooter + marginBottomApp;

class ToolRow extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.translateXBox = new Animated.Value(0);
    this.translateYBox = new Animated.Value(75 + heightFooterFull);
  }
  async componentDidMount() {
    this.props.onRef(this);
  }
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'Toolrow',
    });
  }
  componentDidUpdate = (prevProps, prevState) => {
    const {clickButton1, isButton2Selected, selectedVideos} = this.props;
    if (
      prevProps.selectedVideos.length !== selectedVideos.length ||
      prevProps.isButton2Selected !== isButton2Selected
    )
      return this.openToolBox(isButton2Selected);
    if (
      prevProps.currentSessionID !== this.props.currentSessionID &&
      !this.props.currentSessionID
    )
      return clickButton1(true);
  };
  openToolBox = (val) => {
    Animated.parallel([
      Animated.timing(
        this.translateYBox,
        native(val ? -10 : 75 + heightFooterFull),
      ),
    ]).start();
  };
  button = ({
    icon,
    backgroundColor,
    onPressColor,
    style,
    click,
    label,
    isSelected,
    badge,
    buttonDisabled,
    overlayIcon,
  }) => {
    const {name, size, type, color} = icon;
    return (
      <ButtonColor
        view={() => {
          return (
            <View style={styleApp.center}>
              <AllIcon
                name={name}
                size={size}
                color={isSelected ? color : colors.greyMidDark}
                type={type}
              />
              {overlayIcon ? (
                <View
                  style={{
                    position: 'absolute',
                    top: overlayIcon.top,
                    right: overlayIcon.right,
                  }}>
                  <AllIcon
                    name={overlayIcon.name}
                    size={overlayIcon.size}
                    color={isSelected ? overlayIcon.color : colors.greyMidDark}
                    type={overlayIcon.type}
                  />
                </View>
              ) : null}
              {label ? (
                <Text
                  style={[
                    styleApp.textBold,
                    styleApp.smallText,
                    {
                      color: isSelected ? color : colors.greyMidDark,
                      marginTop: 8,
                      textAlign: 'center',
                      maxWidth: '80%',
                      fontSize: 12,
                    },
                  ]}>
                  {label} {badge && badge !== 0 ? `(${badge})` : ''}
                </Text>
              ) : null}
            </View>
          );
        }}
        style={style}
        click={() => !buttonDisabled && click()}
        color={isSelected ? backgroundColor : colors.white}
        onPressColor={isSelected ? onPressColor : colors.white}
      />
    );
  };

  render() {
    const {
      clickButton2,
      clickButton3,
      clickButton4,
      isButton2Selected,
      selectedVideos,
      selectVideo,
      currentSessionID,
      clickButton0,
      selectedLocalVideos,
      selectedRecordVideos,
    } = this.props;

    return (
      <View style={styles.tool} pointerEvents="box-none">
        {isButton2Selected ? (
          <VideoList
            selectedVideos={selectedVideos}
            selectVideo={selectVideo}
          />
        ) : null}
        <Animated.View
          style={[
            styles.animatedToolBox,
            {
              transform: [
                {translateX: this.translateXBox},
                {translateY: this.translateYBox},
              ],
            },
          ]}>
          <Row style={{overflow: 'hidden'}}>
            {
              <Col size={25} style={styleApp.center3}>
                {this.button({
                  icon: {
                    name: 'play',
                    type: 'font',
                    color: colors.primary,
                    size: 20,
                  },
                  label: 'Play',
                  backgroundColor: colors.white,

                  isSelected:
                    !currentSessionID && selectedVideos.length > 0
                      ? true
                      : !currentSessionID
                      ? false
                      : selectedVideos.length > 0 &&
                        selectedLocalVideos.length === 0 &&
                        selectedRecordVideos.length === 0,
                  buttonDisabled:
                    !currentSessionID && selectedVideos.length === 0
                      ? true
                      : !currentSessionID
                      ? false
                      : selectedVideos.length === 0 ||
                        selectedLocalVideos.length > 0 ||
                        selectedRecordVideos.length > 0,
                  onPressColor: colors.off,
                  style: styles.button,
                  click: () =>
                    !currentSessionID
                      ? clickButton2({forceSelect: true})
                      : clickButton0({forceSharing: true}),
                })}
              </Col>
            }
            <Col size={25} style={styleApp.center}>
              {this.button({
                icon: {
                  name: 'user-plus',
                  type: 'font',
                  color: colors.primary,
                  size: 20,
                },
                buttonDisabled: selectedVideos.length === 0,
                label: 'Share',
                backgroundColor: colors.white,
                isSelected: selectedVideos.length > 0,
                onPressColor: colors.off2,
                style: styles.button,
                click: () => clickButton3({}),
              })}
            </Col>
            <Col size={25} style={styleApp.center}>
              {this.button({
                icon: {
                  name: 'trash',
                  type: 'font',
                  color: colors.primary,
                  size: 20,
                },
                label: 'Remove',
                buttonDisabled: selectedVideos.length === 0,
                backgroundColor: colors.white,
                isSelected: selectedVideos.length > 0,
                onPressColor: colors.off2,
                style: styles.button,
                click: () => clickButton4({}),
              })}
            </Col>
          </Row>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tool: {
    position: 'absolute',
    height: 75,
    width: '100%',
    ...styleApp.shade,

    bottom: heightFooter + marginBottomApp + 0,
    right: 0,
    zIndex: 10,
  },
  animatedToolBox: {
    width: '95%',
    left: '2.5%',
    position: 'absolute',
    height: '100%',
    borderWidth: 1,
    borderRadius: 55,
    borderColor: colors.off,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  button: {
    height: '100%',
    width: '100%',
  },
});

const mapStateToProps = (state, props) => {
  const {selectedVideos} = props;
  let selectedLocalVideos = [];
  let selectedRecordVideos = [];
  if (selectedRecordVideos.length > 0) {
    selectedLocalVideos = selectedVideos
      .map((video) => state.archives[video])
      .filter((video) => video?.local);
    selectedRecordVideos = selectedVideos
      .map((video) => state.archives[video])
      .filter((video) => video?.recordedActions);
  }

  return {
    currentSessionID: currentSessionIDSelector(state),
    userConnected: userIDSelector(state),
    selectedLocalVideos,
    selectedRecordVideos,
  };
};

export default connect(mapStateToProps)(ToolRow);
