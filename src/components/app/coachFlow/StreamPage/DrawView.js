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
import {SketchCanvas} from '@terrylinla/react-native-sketch-canvas';
const {height, width} = Dimensions.get('screen');

import AllIcons from '../../../layout/icons/AllIcons';
import {coachAction} from '../../../../actions/coachActions';
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
    this.translateXPage = new Animated.Value(0);
    // this.translateXPage = new Animated.Value(this.props.draw ? 0 : width);
    this.canvasRef = React.createRef();
  }
  componentDidMount() {
    // this.props.onRef(this);
  }
  componentWillReceiveProps(nextProps) {
    console.log('draw view receive props', nextProps);
    if (nextProps.draw !== this.props.draw) {
      return this.translateXPage.setValue(nextProps.draw ? 0 : width);
    } else if (nextProps.settingsDraw.clear !== this.props.settingsDraw.clear) {
      console.log('canvas clear');
      this.canvasRef.current.clear();
    } else if (nextProps.settingsDraw.undo !== this.props.settingsDraw.undo) {
      console.log('canvas undo');
      this.canvasRef.current.undo();
    }
  }
  onStrokeEnd(event) {
    console.log('onStrokeEnd', event);
  }
  drawView() {
    const {settingsDraw} = this.props;
    return (
      <Animated.View
        style={[styles.page, {transform: [{translateX: this.translateXPage}]}]}>
        <SketchCanvas
          style={styles.drawingZone}
          ref={this.canvasRef}
          touchEnabled={settingsDraw.touchEnabled}
          strokeColor={settingsDraw.color}
          strokeWidth={4}
          onStrokeEnd={(event) => this.onStrokeEnd(event)}
        />
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
    height: '100%',
    width: width,
    position: 'absolute',
    // backgroundColor: colors.red,
    // opacity: 0.1,
    zIndex: 3,
  },
  drawingZone: {
    height: height - 90,
    width: width,
    position: 'absolute',
    top: 0,
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
