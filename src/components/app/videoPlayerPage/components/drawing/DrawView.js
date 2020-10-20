import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, StyleSheet, Animated, PanResponder} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import Svg, {Circle} from 'react-native-svg';
import isEqual from 'lodash.isequal';

import {coachAction} from '../../../../../actions/coachActions';
import {generateID} from '../../../../functions/createEvent';
import {getLastDrawing} from '../../../../functions/coach';

import {ratio} from '../../../../style/sizes';
import colors from '../../../../style/colors';
import DrawRectangles from './shapes/DrawRectangles';
import DrawAngles from './shapes/DrawAngles';
import DrawSraightLine from './shapes/DrawSraightLine';
import DrawCircles from './shapes/DrawCircles';
import DrawCustomLine from './shapes/DrawCustomLine';

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
      path: [],
      startPoint: {x: 0, y: 0},
      endPoint: {x: 0, y: 0},
      thirdPoint: {x: 0, y: 0},
      colorDrawing: colors.red,
      drawSetting: 'custom',
      lastUpdate: Date.now(),
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
  componentDidUpdate = (prevProps, prevState) => {
    const {lastUpdate} = this.state;
    const {videoBeingShared, drawings} = this.props;

    if (lastUpdate > prevState.lastUpdate && videoBeingShared)
      return this.copyLastDrawingInCloud();
  };
  static getDerivedStateFromProps(props, state) {
    const cloudDrawings = props.drawings ? props.drawings : {};
    return {drawings: {...cloudDrawings, ...state.drawings}};
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
    const {index, onDrawingChange, userID, clickVideo} = this.props;
    const {w, h} = this.sizeScreen();
    const {drawSetting} = this.state;
    let {path} = event;
    const id = generateID();
    let {data} = path;
    data = {
      ...path,
      ...data,
      startPoint: {
        x: data.startPoint.x / w,
        y: data.startPoint.y / h,
      },
      endPoint: {
        x: data.endPoint.x / w,
        y: data.endPoint.y / h,
      },
      thirdPoint: data.thirdPoint
        ? {
            x: data.thirdPoint.x / w,
            y: data.thirdPoint.y / h,
          }
        : null,
    };
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
    console.log('newDrawings', newDrawings);
    await this.setState({
      drawings: newDrawings,
      selectedShape: id,
      lastUpdate: Date.now(),
    });
  }
  copyLastDrawingInCloud = () => {
    const {archiveID, coachSessionID} = this.props;
    const {drawings} = this.state;
    console.log('drawings', drawings);
    const path = Object.values(drawings).sort(
      (a, b) => a.timeStamp - b.timeStamp,
    )[0];
    console.log('copyLastDrawingInCloud', path);

    database()
      .ref(
        `coachSessions/${coachSessionID}/sharedVideos/${archiveID}/drawings/${
          path.id
        }`,
      )
      .update(path);
  };
  onPanGestureEvent = Animated.event(
    [
      {
        nativeEvent: {},
      },
    ],
    {
      useNativeDriver: true,
      listener: (event) => {
        const {w, h} = this.sizeScreen();
        const newPosition = {
          x: event.nativeEvent.x,
          y: event.nativeEvent.y,
        };
        const {drawing, drawSetting, startPoint, endPoint} = this.state;
        let thirdPoint = {x: 0, y: 0};
        const {x: x1, y: y1} = startPoint;
        const {x: x2, y: y2} = endPoint;
        if (drawSetting === 'custom') {
          let {path} = this.state;
          path.push({
            x: newPosition.x / w,
            y: newPosition.y / h,
          });

          return this.setState({
            path,
            startPoint: drawing ? startPoint : newPosition,
            endPoint: newPosition,
            drawing: true,
          });
        }
        if (drawSetting === 'angle')
          thirdPoint = {
            x: x1 + (x2 - x1) * Math.cos(45) - (y2 - y1) * Math.sin(45),
            y: y1 + (y2 - y1) * Math.cos(45) + (x2 - x1) * Math.sin(45),
          };
        if (!drawing) {
          return this.setState({
            startPoint: newPosition,
            endPoint: newPosition,
            thirdPoint: newPosition,
            drawing: true,
          });
        }
        return this.setState({
          endPoint: newPosition,
          thirdPoint,
        });
      },
    },
  );
  _onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const {
        startPoint,
        endPoint,
        colorDrawing,
        strokeWidth,
        thirdPoint,
        path,
      } = this.state;

      this.onStrokeEnd({
        path: {
          data: {startPoint, endPoint, thirdPoint, path},
          color: colorDrawing,
          width: strokeWidth,
        },
      });
      return this.setState({
        drawing: false,
        startPoint: {x: 0, y: 0},
        endPoint: {x: 0, y: 0},
        thirdPoint: {x: 0, y: 0},
        path: [],
      });
    }
  };
  editShape = ({id, startPoint, endPoint, thirdPoint, path}) => {
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
          thirdPoint: thirdPoint
            ? {
                x: thirdPoint.x / w,
                y: thirdPoint.y / h,
              }
            : drawings[id].data.thirdPoint,
          path: path ? path : drawings[id].data.path,
        },
      },
    };
    this.setState({drawings: newDrawings});
  };
  endEditShape = () => {
    console.log('endEditShape!!!!!!');
    this.setState({lastUpdate: Date.now()});
  };
  shape = ({
    drawSetting,
    colorDrawing,
    strokeWidth,
    startPoint,
    endPoint,
    thirdPoint,
    path,
    id,
  }) => {
    const {w, h} = this.sizeScreen();
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
          key={id}
          editShape={this.editShape.bind(this)}
          endEditShape={this.endEditShape.bind(this)}
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
    if (drawSetting === 'custom' && Object.values(path).length > 0)
      return (
        <DrawCustomLine
          isSelected={isSelected}
          style={styles.drawingZone}
          strokeWidth={strokeWidth}
          strokeColor={colorDrawing}
          id={id}
          key={id}
          path={path}
          w={w}
          h={h}
          editShape={this.editShape.bind(this)}
          endEditShape={this.endEditShape.bind(this)}
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
          key={id}
          editShape={this.editShape.bind(this)}
          endEditShape={this.endEditShape.bind(this)}
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
          key={id}
          id={id}
          editShape={this.editShape.bind(this)}
          endEditShape={this.endEditShape.bind(this)}
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
        <DrawSraightLine
          isSelected={isSelected}
          style={styles.drawingZone}
          arrow={true}
          strokeWidth={strokeWidth}
          strokeColor={colorDrawing}
          startPoint={startPoint}
          endPoint={endPoint}
          id={id}
          key={id}
          editShape={this.editShape.bind(this)}
          endEditShape={this.endEditShape.bind(this)}
          onRef={(ref) => (this.drawStraighLinesRef = ref)}
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
          thirdPoint={thirdPoint}
          id={id}
          key={id}
          editShape={this.editShape.bind(this)}
          endEditShape={this.endEditShape.bind(this)}
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
      thirdPoint,
      drawings,
      path,
    } = this.state;
    const style = styles.drawingZone;
    const {w, h} = this.sizeScreen();
    console.log('path', path);
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
              thirdPoint,
              id: 'currentDrawing',
              path,
            })}
            {Object.values(drawings).map((drawing) =>
              this.shape({
                drawSetting: drawing.drawSetting,
                colorDrawing: drawing.color,
                strokeWidth: drawing.width,
                path: drawing.data.path,
                id: drawing.id,
                startPoint: {
                  x: drawing.data.startPoint.x * w,
                  y: drawing.data.startPoint.y * h,
                },
                endPoint: {
                  x: drawing.data.endPoint.x * w,
                  y: drawing.data.endPoint.y * h,
                },
                thirdPoint: drawing.data.thirdPoint
                  ? {
                      x: drawing.data.thirdPoint.x * w,
                      y: drawing.data.thirdPoint.y * h,
                    }
                  : null,
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
