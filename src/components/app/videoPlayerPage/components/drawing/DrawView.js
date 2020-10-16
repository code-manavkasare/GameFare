import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, StyleSheet, Animated, PanResponder} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import {ImageEditor} from '@wwimmo/react-native-sketch-canvas';

import DisplayDrawingToViewers from './DisplayDrawingToViewers';
import DrawSraightLine from './DrawSraightLine';
import DrawCircles from './DrawCircles';
import {coachAction} from '../../../../../actions/coachActions';
import {generateID} from '../../../../functions/createEvent';
import {getLastDrawing} from '../../../../functions/coach';

import {ratio} from '../../../../style/sizes';
import colors from '../../../../style/colors';
import DrawRectangles from './DrawRectangles';
import DrawArrow from './DrawArrow';
import DrawAngles from './DrawAngles';

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
      scaleDrawing: 1,
      strokeWidth: 3,
      drawings: {},
      colorDrawing: colors.red,
      drawSetting: 'custom',
      displayDrawingZone: true,
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
  async onStrokeEnd(event, widthDrawView, heightDrawView) {
    const {
      archiveID,
      coachSessionID,
      index,
      onDrawingChange,
      userID,
      videoBeingShared,
      clickVideo,
    } = this.props;
    const {drawSetting} = this.state;
    let {path} = event;
    const id = generateID();
    let {data} = path;
    if (drawSetting === 'custom') {
      data = data.map((dot) => {
        let x = Number(dot.split(',')[0]);
        x = x / widthDrawView;
        let y = Number(dot.split(',')[1]);
        y = y / heightDrawView;
        return x + ',' + y;
      });
      if (data.length < 3) clickVideo(index);
    } else {
      data = {
        ...path,
        startPoint: {
          x: data.startPoint.x / widthDrawView,
          y: data.startPoint.y / heightDrawView,
        },
        endPoint: {
          x: data.endPoint.x / widthDrawView,
          y: data.endPoint.y / heightDrawView,
        },
      };
    }

    path = {
      ...path,
      timeStamp: Date.now(),
      id,
      idSketch: path.id ? path.id : id,
      userID,
      data,
      type: drawSetting,
    };

    if (videoBeingShared) {
      database()
        .ref(
          `coachSessions/${coachSessionID}/sharedVideos/${archiveID}/drawings/${
            path.id
          }`,
        )
        .update(path);
    } else {
      const {drawings} = this.state;
      const newDrawings = {...drawings, [path.idSketch]: path};
      await this.setState({drawings: newDrawings});
      onDrawingChange(index, newDrawings);
    }
    if (drawSetting === 'custom') {
      this.canvasRef.deletePath(path.idSketch);
    }
  }
  drawingZone = ({w, h}) => {
    const {drawingOpen} = this.props;
    const {scaleDrawing, drawSetting, colorDrawing, strokeWidth} = this.state;
    if (drawSetting === 'custom')
      return (
        <ImageEditor
          style={styles.drawingZone}
          ref={(ref) => (this.canvasRef = ref)}
          touchEnabled={drawingOpen}
          strokeColor={colorDrawing}
          strokeWidth={strokeWidth}
          scale={scaleDrawing}
          onStrokeEnd={(event) => this.onStrokeEnd(event, w, h)}
        />
      );
    if (drawSetting === 'rectangle')
      return (
        <DrawRectangles
          style={styles.drawingZone}
          strokeWidth={strokeWidth}
          strokeColor={colorDrawing}
          onRef={(ref) => (this.drawStraighLinesRef = ref)}
          onStrokeEnd={(event) => this.onStrokeEnd(event, w, h)}
        />
      );
    if (drawSetting === 'circle')
      return (
        <DrawCircles
          style={styles.drawingZone}
          strokeWidth={strokeWidth}
          strokeColor={colorDrawing}
          onRef={(ref) => (this.drawStraighLinesRef = ref)}
          onStrokeEnd={(event) => this.onStrokeEnd(event, w, h)}
        />
      );
    if (drawSetting === 'straight')
      return (
        <DrawSraightLine
          style={styles.drawingZone}
          strokeWidth={strokeWidth}
          strokeColor={colorDrawing}
          onRef={(ref) => (this.drawStraighLinesRef = ref)}
          onStrokeEnd={(event) => this.onStrokeEnd(event, w, h)}
        />
      );

    if (drawSetting === 'arrow')
      return (
        <DrawArrow
          style={styles.drawingZone}
          strokeWidth={strokeWidth}
          strokeColor={colorDrawing}
          onRef={(ref) => (this.drawArrowsRef = ref)}
          onStrokeEnd={(event) => this.onStrokeEnd(event, w, h)}
        />
      );
    if (drawSetting === 'angle')
      return (
        <DrawAngles
          style={styles.drawingZone}
          strokeWidth={strokeWidth}
          strokeColor={colorDrawing}
          onRef={(ref) => (this.drawStraighLinesRef = ref)}
          onStrokeEnd={(event) => this.onStrokeEnd(event, w, h)}
        />
      );
  };
  drawView() {
    const {drawingOpen, sizeVideo, playerStyle} = this.props;
    const {drawings, displayDrawingZone} = this.state;

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

    let styleDrawView = {
      height: h,
      width: w,
    };
    if (styleDrawView.h === 0) {
      return null;
    }
    return (
      <Animated.View
        pointerEvents={drawingOpen ? 'auto' : 'none'}
        style={[styles.page, styleDrawView]}>
        {displayDrawingZone && (
          <View style={styles.drawingZone}>{this.drawingZone({w, h})}</View>
        )}

        <View style={styles.drawingZoneDisplay}>
          <DisplayDrawingToViewers
            heightDrawView={h}
            widthDrawView={w}
            currentScreenSize={{currentWidth, currentHeight}}
            drawings={drawings ? Object.values(drawings) : []}
          />
        </View>
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
  drawingZoneDisplay: {
    height: '100%',
    width: '100%',
    zIndex: -3,
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
