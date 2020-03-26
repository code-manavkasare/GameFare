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
import firebase from 'react-native-firebase';
import {SketchCanvas} from '@terrylinla/react-native-sketch-canvas';
const {height, width} = Dimensions.get('screen');

import AllIcons from '../../../layout/icons/AllIcons';
import DisplayDrawingToViewers from './DisplayDrawingToViewers';
import {coachAction} from '../../../../actions/coachActions';
import {generateID} from '../../../functions/createEvent';
import {getLastDrawing} from '../../../functions/coach';
import {Col, Row} from 'react-native-easy-grid';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';

class Draw extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraAccess: false,
      microAccess: false,
      loader: true,
    };
    this.translateXPage = new Animated.Value(
      this.props.drawingOpen ? 0 : width,
    );
    this.canvasRef = React.createRef();
  }
  componentDidMount() {}
  componentWillReceiveProps(nextProps) {
    if (nextProps.drawingOpen !== this.props.drawingOpen) {
      return this.translateXPage.setValue(nextProps.drawingOpen ? 0 : width);
    } else if (nextProps.settingsDraw.clear !== this.props.settingsDraw.clear) {
      this.canvas2.clear();
    } else if (nextProps.settingsDraw.undo !== this.props.settingsDraw.undo) {
      console.log('undo!');
      const idSketchLast = getLastDrawing(nextProps.video).idSketch;
      console.log('idSketchLast', idSketchLast);
      this.canvas2.deletePath(idSketchLast);
    }
  }
  async onStrokeEnd(event) {
    let {path} = event;
    path.timeStamp = Number(new Date());
    const idPath = generateID();
    path.idSketch = path.id;
    path.screenSource = {
      height: height,
      width: width,
    };
    path.id = idPath;
    const {videoID, coachSessionID} = this.props;
    await firebase
      .database()
      .ref(
        `coachSessions/${coachSessionID}/sharedVideos/${videoID}/drawings/${idPath}`,
      )
      .update(path);
  }
  drawView() {
    const {settingsDraw, video, shareScreen} = this.props;

    return (
      <Animated.View
        style={[
          styles.page,
          {height: height},
          {
            transform: [{translateX: this.translateXPage}],
          },
        ]}>
        {shareScreen ? (
          <SketchCanvas
            style={styles.drawingZone}
            ref={(ref) => (this.canvas2 = ref)}
            touchEnabled={settingsDraw.touchEnabled}
            strokeColor={settingsDraw.color}
            strokeWidth={4}
            onStrokeEnd={(event) => this.onStrokeEnd(event)}
          />
        ) : (
          <View style={styles.drawingZone}>
          <DisplayDrawingToViewers drawings={video.drawings} />
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
    ...styleApp.center,
    height: height,
    width: width,
    position: 'absolute',
    // backgroundColor: colors.red,
    // opacity: 0.1,
    zIndex: 3,
  },
  drawingZone: {
    height: '100%',
    width: width,
    zIndex: -2,
    // backgroundColor: 'red',
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
  };
};

export default connect(mapStateToProps, {coachAction})(Draw);
