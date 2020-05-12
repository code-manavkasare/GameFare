import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import {SketchCanvas} from '@terrylinla/react-native-sketch-canvas';

import DisplayDrawingToViewers from './DisplayDrawingToViewers';
import {coachAction} from '../../../../../actions/coachActions';
import {generateID} from '../../../../functions/createEvent';
import {getLastDrawing} from '../../../../functions/coach';

import styleApp from '../../../../style/style';

class Draw extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraAccess: false,
      microAccess: false,
      loader: true,
    };
    this.translateXPage = new Animated.Value(0);
    this.canvasRef = React.createRef();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.drawingOpen !== this.props.drawingOpen) {
      return this.translateXPage.setValue(
        this.props.drawingOpen ? 0 : this.props.currentScreenSize.currentWidth,
      );
    } else if (prevProps.settingsDraw.clear !== this.props.settingsDraw.clear) {
      try {
        this.canvasRef.current.clear();
      } catch (err) {
        console.log('error');
      }
    } else if (prevProps.settingsDraw.undo !== this.props.settingsDraw.undo) {
      const idSketchLast = getLastDrawing(this.props.video).idSketch;
      if (idSketchLast) this.canvasRef.current.deletePath(idSketchLast);
    }
  }
  async onStrokeEnd(event) {
    const {currentWidth, currentHeight} = this.props.currentScreenSize;
    let {path} = event;
    path.timeStamp = Number(new Date());
    const idPath = generateID();
    path.idSketch = path.id;
    path.screenSource = {
      height: currentHeight,
      width: currentWidth,
    };
    path.id = idPath;
    const {archiveID, coachSessionID} = this.props;
    await database()
      .ref(
        `coachSessions/${coachSessionID}/sharedVideos/${archiveID}/drawings/${idPath}`,
      )
      .update(path);
  }
  drawView() {
    const {settingsDraw, video, drawingOpen, currentScreenSize} = this.props;
    const {currentWidth, currentHeight} = currentScreenSize;
    console.log('drawingOpen ici la', drawingOpen);
    return (
      <Animated.View
        style={[styles.page, {height: currentHeight, width: currentWidth}]}>
        {drawingOpen && (
          <SketchCanvas
            style={styles.drawingZone}
            ref={this.canvasRef}
            touchEnabled={settingsDraw.touchEnabled}
            strokeColor={settingsDraw.color}
            strokeWidth={4}
            onStrokeEnd={(event) => this.onStrokeEnd(event)}
          />
        )}
        <View style={styles.drawingZoneDisplay}>
          <DisplayDrawingToViewers
            currentScreenSize={currentScreenSize}
            drawings={video.drawings}
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
    ...styleApp.center,
    position: 'absolute',
    zIndex: 3,
  },
  drawingZone: {
    height: '100%',
    width: '100%',
    // backgroundColor: colors.off + '40',
    zIndex: -2,
    position: 'absolute',
    top: 0,
  },
  drawingZoneDisplay: {
    height: '100%',
    width: '100%',
    // backgroundColor: colors.off + '40',
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
