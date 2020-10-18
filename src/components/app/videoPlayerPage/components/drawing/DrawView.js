import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, StyleSheet, Animated, PanResponder} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import {ImageEditor} from '@wwimmo/react-native-sketch-canvas';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import Svg, {Circle} from 'react-native-svg';

import DisplayDrawingToViewers from './DisplayDrawingToViewers';

import {coachAction} from '../../../../../actions/coachActions';
import {generateID} from '../../../../functions/createEvent';
import {getLastDrawing} from '../../../../functions/coach';

import {ratio} from '../../../../style/sizes';
import colors from '../../../../style/colors';
import DrawRectangles from './shapes/DrawRectangles';
import DrawArrow from './shapes/DrawArrow';
import DrawAngles from './shapes/DrawAngles';
import DrawSraightLine from './shapes/DrawSraightLine';
import DrawCircles from './shapes/DrawCircles';

class DrawView extends Component {
  static propTypes = {
    onDrawingChange: PropTypes.func,
  };
  static defaultProps = {
    onDrawingChange: (index, drawings) => null,
  };
  constructor(props) {
    super(props);
    this.state = {
      cameraAccess: false,
      microAccess: false,
      loader: true,
      strokeWidth: 3,
      drawings: {},
      drawing: false,
      startPoint: {x: 0, y: 0},
      endPoint: {x: 0, y: 0},
      colorDrawing: colors.red,
      drawSetting: 'custom',
      selectedShape: null,
    };
    this.onStrokeEnd = this.onStrokeEnd.bind(this);
    this.undo = this.undo.bind(this);
  }
  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (props.videoBeingShared) {
      return {
        drawings: props.drawings,
      };
    }
    return {};
  }
  clear = async () => {
    try {
      const {
        archiveID,
        coachSessionID,
        index,
        onDrawingChange,
        videoBeingShared,
      } = this.props;
      if (videoBeingShared) {
        await database()
          .ref(
            `coachSessions/${coachSessionID}/sharedVideos/${archiveID}/drawings/`,
          )
          .remove();
      }

      this.setState({drawings: {}});
      onDrawingChange(index, {});
    } catch (err) {}
  };
  undo = () => {
    const {drawings} = this.state;
    const {
      archiveID,
      coachSessionID,
      index,
      onDrawingChange,
      videoBeingShared,
    } = this.props;

    let idLastDrawing = false;
    const lastDrawing = getLastDrawing(drawings);
    if (lastDrawing) {
      idLastDrawing = getLastDrawing(drawings).id;
    }
    if (idLastDrawing) {
      if (!videoBeingShared) {
        const newDrawing = Object.values(drawings)
          .filter((item) => item.id !== idLastDrawing)
          .reduce(function(result, item) {
            result[item.id] = item;
            return result;
          }, {});

        this.setState({drawings: newDrawing});
        onDrawingChange(index, newDrawing);
      } else {
        database()
          .ref(
            `coachSessions/${coachSessionID}/sharedVideos/${archiveID}/drawings/${idLastDrawing}`,
          )
          .remove();
      }
    }
  };
  async onStrokeEnd(event) {
    const {
      archiveID,
      coachSessionID,
      index,
      onDrawingChange,
      userID,
      videoBeingShared,
      clickVideo,
    } = this.props;
    const {w, h} = this.sizeScreen();
    const {drawSetting} = this.state;
    let {path} = event;
    const id = generateID();
    let {data} = path;
    if (drawSetting === 'custom') {
      data = data.map((dot) => {
        let x = Number(dot.split(',')[0]);
        x = x / w;
        let y = Number(dot.split(',')[1]);
        y = y / h;
        return x + ',' + y;
      });
      if (data.length < 3) clickVideo(index);
    } else {
      data = {
        ...path,
        startPoint: {
          x: data.startPoint.x / w,
          y: data.startPoint.y / h,
        },
        endPoint: {
          x: data.endPoint.x / w,
          y: data.endPoint.y / h,
        },
      };
    }
    console.log('end stroke start', this.state.startPoint);
    console.log('end stroke end', this.state.endPoint);
    path = {
      ...path,
      timeStamp: Date.now(),
      id,
      userID,
      data,
      drawSetting,
    };

    const {drawings} = this.state;
    const newDrawings = {...drawings, [id]: path};
    await this.setState({drawings: newDrawings, selectedShape: id});
    onDrawingChange(index, newDrawings);

    // if (videoBeingShared) {
    //   database()
    //     .ref(
    //       `coachSessions/${coachSessionID}/sharedVideos/${archiveID}/drawings/${
    //         path.id
    //       }`,
    //     )
    //     .update(path);
  }
  onPanGestureEvent = Animated.event(
    [
      {
        nativeEvent: {},
      },
    ],
    {
      useNativeDriver: true,
      listener: (event) => {
        const newPosition = {
          x: event.nativeEvent.x,
          y: event.nativeEvent.y,
        };
        const {drawing} = this.state;
        if (!drawing) {
          return this.setState({
            startPoint: newPosition,
            endPoint: newPosition,
            drawing: true,
          });
        }
        return this.setState({
          endPoint: newPosition,
        });
      },
    },
  );
  _onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const {startPoint, endPoint, colorDrawing, strokeWidth} = this.state;

      this.onStrokeEnd({
        path: {
          data: {startPoint, endPoint},
          color: colorDrawing,
          width: strokeWidth,
        },
      });
      return this.setState({
        drawing: false,
        startPoint: {x: 0, y: 0},
        endPoint: {x: 0, y: 0},
      });
    }
  };
  editShape = ({id, startPoint, endPoint}) => {
    const {drawings} = this.state;
    const {w, h} = this.sizeScreen();

    const newDrawings = {
      ...drawings,
      [id]: {
        ...drawings[id],
        timeStamp: Date.now(),
        data: {
          ...drawings[id].data,
          startPoint: startPoint
            ? {
                x: startPoint.x / w,
                y: startPoint.y / h,
              }
            : drawings[id].data.startPoint,
          endPoint: endPoint
            ? {
                x: endPoint.x / w,
                y: endPoint.y / h,
              }
            : drawings[id].data.endPoint,
        },
      },
    };
    this.setState({drawings: newDrawings});
  };
  shape = ({
    drawSetting,
    colorDrawing,
    strokeWidth,
    startPoint,
    endPoint,
    id,
  }) => {
    const {selectedShape} = this.state;
    const isSelected = selectedShape === id;
    if (drawSetting === 'circle')
      return (
        <DrawCircles
          isSelected={isSelected}
          style={styles.drawingZone}
          strokeWidth={strokeWidth}
          strokeColor={colorDrawing}
          id={id}
          editShape={this.editShape.bind(this)}
          startPoint={startPoint}
          endPoint={endPoint}
          onRef={(ref) => (this.drawCirclesRef = ref)}
          toggleSelect={(forceSelect) =>
            this.setState({
              selectedShape: isSelected && !forceSelect ? null : id,
            })
          }
        />
      );

    if (drawSetting === 'rectangle')
      return (
        <DrawRectangles
          isSelected={isSelected}
          id={id}
          editShape={this.editShape.bind(this)}
          style={styles.drawingZone}
          strokeWidth={strokeWidth}
          strokeColor={colorDrawing}
          startPoint={startPoint}
          endPoint={endPoint}
          onRef={(ref) => (this.drawRectangleRef = ref)}
          toggleSelect={(forceSelect) =>
            this.setState({
              selectedShape: isSelected && !forceSelect ? null : id,
            })
          }
        />
      );

    if (drawSetting === 'straight')
      return (
        <DrawSraightLine
          isSelected={isSelected}
          style={styles.drawingZone}
          strokeWidth={strokeWidth}
          strokeColor={colorDrawing}
          startPoint={startPoint}
          endPoint={endPoint}
          id={id}
          editShape={this.editShape.bind(this)}
          onRef={(ref) => (this.drawStraighLinesRef = ref)}
          toggleSelect={(forceSelect) =>
            this.setState({
              selectedShape: isSelected && !forceSelect ? null : id,
            })
          }
        />
      );

    if (drawSetting === 'arrow')
      return (
        <DrawArrow
          isSelected={isSelected}
          style={styles.drawingZone}
          strokeWidth={strokeWidth}
          strokeColor={colorDrawing}
          startPoint={startPoint}
          endPoint={endPoint}
          id={id}
          editShape={this.editShape.bind(this)}
          onRef={(ref) => (this.drawArrowsRef = ref)}
          toggleSelect={(forceSelect) =>
            this.setState({
              selectedShape: isSelected && !forceSelect ? null : id,
            })
          }
        />
      );

    if (drawSetting === 'angle')
      return (
        <DrawAngles
          isSelected={isSelected}
          style={styles.drawingZone}
          strokeWidth={strokeWidth}
          strokeColor={colorDrawing}
          startPoint={startPoint}
          endPoint={endPoint}
          id={id}
          editShape={this.editShape.bind(this)}
          onRef={(ref) => (this.drawAnglesRef = ref)}
          toggleSelect={(forceSelect) =>
            this.setState({
              selectedShape: isSelected && !forceSelect ? null : id,
            })
          }
        />
      );
    return null;
  };
  drawingZone = () => {
    const {
      drawSetting,
      colorDrawing,
      strokeWidth,
      startPoint,
      endPoint,
      drawings,
    } = this.state;
    const style = styles.drawingZone;
    const {w, h} = this.sizeScreen();
    return (
      <PanGestureHandler
        style={style}
        onGestureEvent={this.onPanGestureEvent}
        onHandlerStateChange={this._onHandlerStateChange}>
        <Animated.View style={style}>
          <Svg height={style.height} width={style.width}>
            {this.shape({
              drawSetting,
              colorDrawing,
              strokeWidth,
              startPoint,
              endPoint,
              id: 'currentDrawing',
            })}
            {Object.values(drawings).map((drawing) =>
              this.shape({
                drawSetting: drawing.drawSetting,
                colorDrawing: drawing.color,
                strokeWidth: drawing.width,
                id: drawing.id,
                startPoint: {
                  x: drawing.data.startPoint.x * w,
                  y: drawing.data.startPoint.y * h,
                },
                endPoint: {
                  x: drawing.data.endPoint.x * w,
                  y: drawing.data.endPoint.y * h,
                },
              }),
            )}
          </Svg>
        </Animated.View>
      </PanGestureHandler>
    );
  };
  sizeScreen = () => {
    const {sizeVideo, playerStyle} = this.props;
    let h = 0;
    let w = 0;
    const {height: currentHeight, width: currentWidth} = playerStyle;

    if (sizeVideo) {
      const ratioScreen = ratio(currentWidth, currentHeight);
      const ratioVideo = ratio(sizeVideo.width, sizeVideo.height);

      w = currentWidth;
      h = currentWidth * ratioVideo;
      if (ratioScreen < ratioVideo) {
        h = currentHeight;
        w = currentHeight / ratioVideo;
      }
    }
    return {w, h};
  };
  drawView() {
  
    const {w, h} = this.sizeScreen();

    let styleDrawView = {
      height: h,
      width: w,
    };

    if (styleDrawView.h === 0) {
      return null;
    }
    return (
      <Animated.View style={[styles.page, styleDrawView]}>
        {this.drawingZone({w, h})}
      </Animated.View>
    );
  }
  render() {
    return this.drawView();
  }
}

const styles = StyleSheet.create({
  page: {
    position: 'absolute',
    zIndex: 3,
  },
  drawingZone: {
    height: '100%',
    width: '100%',
    zIndex: -2,
    position: 'absolute',
    top: 0,
  },
});

const mapStateToProps = (state, props) => {
  const {coachSessionID, archiveID, videoBeingShared} = props;
  let drawings = {};
  if (videoBeingShared) {
    drawings =
      state.coachSessions[coachSessionID]?.sharedVideos[archiveID]?.drawings;
  }

  return {
    drawings: drawings,
    userID: state.user.userID,
    infoUser: state?.user?.infoUser?.userInfo,
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(DrawView);
