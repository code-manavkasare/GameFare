import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import {ImageEditor} from '@wwimmo/react-native-sketch-canvas';

import DisplayDrawingToViewers from './DisplayDrawingToViewers';
import {coachAction} from '../../../../../actions/coachActions';
import {generateID} from '../../../../functions/createEvent';
import {getLastDrawing} from '../../../../functions/coach';

import styleApp from '../../../../style/style';
import colors from '../../../../style/colors';
import {ratio} from '../../../../style/sizes';
import isEqual from 'lodash.isequal';

class Draw extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraAccess: false,
      microAccess: false,
      loader: true,
      scaleDrawing: 1,
      drawings: {},
    };
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  static getDerivedStateFromProps(props, state) {
    if (!isEqual(props.drawings, state.drawings) && props.videoBeingShared)
      return {
        drawings: props.drawings,
      };
    return {};
  }
  clear = () => {
    try {
      this.canvasRef.clear();
      this.setState({drawings: {}});
    } catch (err) {}
  };
  undo = (idLastDrawing) => {
    const {drawings} = this.state;

    if (!idLastDrawing) {
      const lastDrawing = getLastDrawing(drawings);
      if (lastDrawing) idLastDrawing = getLastDrawing(drawings).idSketch;
    }
    if (idLastDrawing) {
      try {
        const newDrawing = Object.values(drawings)
          .filter((item) => item.idSketch !== idLastDrawing)
          .reduce(function(result, item) {
            result[item.id] = item;
            return result;
          }, {});
        this.setState({drawings: newDrawing});
        this.canvasRef.deletePath(idLastDrawing);
      } catch (err) {
        Alert.alert('error!', err.toString());
      }
    }
  };
  async onStrokeEnd(event, widthDrawView, heightDrawView) {
    const {userID} = this.props;
    let {path} = event;
    path.timeStamp = Number(new Date());
    const idPath = generateID();
    path.idSketch = path.id;
    path.userID = userID;
    path.id = idPath;
    let {data} = path;

    data = data.map((dot) => {
      let x = Number(dot.split(',')[0]);
      x = x / widthDrawView;
      let y = Number(dot.split(',')[1]);
      y = y / heightDrawView;
      return x + ',' + y;
    });

    path.data = data;
    const {archiveID, coachSessionID, videoBeingShared} = this.props;
    if (videoBeingShared.id === archiveID) {
      await database()
        .ref(
          `coachSessions/${coachSessionID}/sharedVideos/${archiveID}/drawings/${idPath}`,
        )
        .update(path);
      return this.undo(path.idSketch);
    } else {
      const {drawings} = this.state;

      const newDrawings = {...drawings, [path.idSketch]: path};
      this.setState({drawings: newDrawings});
    }
  }
  drawView() {
    const {
      settingsDraw,
      videoBeingShared,
      archiveID,
      drawingOpen,
      currentScreenSize,
      sizeVideo,
    } = this.props;
    const {drawings} = this.state;
    const {scaleDrawing} = this.state;

    let h = 0;
    let w = 0;

    const {currentWidth, currentHeight} = currentScreenSize;

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

    if (styleDrawView.h === 0) return null;
    return (
      <Animated.View
        pointerEvents={drawingOpen ? 'auto' : 'none'}
        style={[styles.page, styleDrawView]}>
        <ImageEditor
          style={styles.drawingZone}
          ref={(ref) => (this.canvasRef = ref)}
          touchEnabled={drawingOpen}
          strokeColor={settingsDraw.color}
          strokeWidth={4}
          scale={scaleDrawing}
          onStrokeEnd={(event) => this.onStrokeEnd(event, w, h)}
        />
        {videoBeingShared.id === archiveID && (
          <View style={styles.drawingZoneDisplay}>
            <DisplayDrawingToViewers
              heightDrawView={h}
              widthDrawView={w}
              currentScreenSize={currentScreenSize}
              drawings={drawings}
            />
          </View>
        )}
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
  functionButton: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    height: 30,
    width: 60,
    position: 'absolute',
    top: 200,
    backgroundColor: '#39579A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    settingsDraw: state.coach.settingsDraw,
    currentScreenSize: state.layout.currentScreenSize,
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(Draw);