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
    // this.canvasRef = React.createRef();
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.drawingOpen !== this.props.drawingOpen) {
      return this.translateXPage.setValue(
        this.props.drawingOpen ? 0 : this.props.currentScreenSize.currentWidth,
      );
    }
  }
  clear = () => {
    try {
      console.log('clear', this.props.coachSessionID);
      this.canvasRef.clear();
    } catch (err) {
      console.log('error');
    }
  };
  undo = (idLastDrawing) => {
    const {drawings} = this.props;
    if (!idLastDrawing) idLastDrawing = getLastDrawing(drawings).idSketch;
    console.log('delete last path', idLastDrawing);
    if (idLastDrawing) {
      try {
        this.canvasRef.deletePath(idLastDrawing);
      } catch (err) {
        Alert.alert('error!', err);
      }
    }
  };
  async onStrokeEnd(event) {
    const {userID} = this.props;
    const {currentWidth, currentHeight} = this.props.currentScreenSize;
    let {path} = event;
    path.timeStamp = Number(new Date());
    const idPath = generateID();
    path.idSketch = path.id;
    path.userID = userID;
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
    const {settingsDraw, drawings, drawingOpen, currentScreenSize} = this.props;
    const {currentWidth, currentHeight} = currentScreenSize;
    console.log('render drawview',drawings)
    return (
      <Animated.View
        style={[styles.page, {height: currentHeight, width: currentWidth}]}>
        {drawingOpen && (
          <SketchCanvas
            style={styles.drawingZone}
            ref={(ref) => (this.canvasRef = ref)}
            touchEnabled={settingsDraw.touchEnabled}
            strokeColor={settingsDraw.color}
            strokeWidth={4}
            onStrokeEnd={(event) => this.onStrokeEnd(event)}
          />
        )}
        <View style={styles.drawingZoneDisplay}>
          <DisplayDrawingToViewers
            currentScreenSize={currentScreenSize}
            drawings={drawings}
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
