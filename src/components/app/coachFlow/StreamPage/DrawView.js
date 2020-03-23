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
    this.translateXPage = new Animated.Value(this.props.draw ? 0 : width);
  }
  componentDidMount() {
    // this.props.onRef(this);
  }
  componentWillReceiveProps(nextProps) {
    console.log('draw view receive props', nextProps);
    if (nextProps.draw !== this.props.draw) {
      return this.translateXPage.setValue(nextProps.draw ? 0 : width);
    }
  }
  drawView() {
    return (
      <Animated.View
        style={[
          styles.page,
          {transform: [{translateX: this.translateXPage}]},
        ]}>
        <SketchCanvas
          style={{
            height: height - 90,
            width: width,
            // backgroundColor: 'blue',
            position: 'absolute',
            top: 0,
          }}
          strokeColor={'red'}
          strokeWidth={7}
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
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    coach: state.coach,
  };
};

export default connect(mapStateToProps, {coachAction})(Draw);
