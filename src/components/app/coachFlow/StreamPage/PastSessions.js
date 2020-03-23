import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image} from 'react-native';
import {connect} from 'react-redux';

import NavigationService from '../../../../../NavigationService';

import ButtonColor from '../../../layout/Views/Button';
import AllIcons from '../../../layout/icons/AllIcons';
import {coachAction} from '../../../../actions/coachActions';
import {timing} from '../../../animations/animations';
import {Col, Row} from 'react-native-easy-grid';

import {width} from '../../../style/sizes';
import colors from '../../../style/colors';
import styleApp from '../../../style/style';

class PastSessions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recording: false,
    };
    this.animateView = new Animated.Value(0);
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  open(val) {
    if (val)
      return Animated.parallel([
        Animated.timing(this.animateView, timing(1, 200)),
        Animated.timing(this.props.translateYViewPublisher, timing(-120, 200)),
      ]).start();
    return Animated.parallel([
      Animated.timing(this.animateView, timing(0, 200)),
      Animated.timing(this.props.translateYViewPublisher, timing(0, 200)),
    ]).start();
  }
  sessions() {
    const {heightView} = this.animationView();
    return (
      <Animated.View style={{height: heightView}}>
        <Row style={[{width: width}]}>
          <Col style={styleApp.center}>
            <Text style={[styleApp.title, {color: colors.white}]}>
              List past sessions
            </Text>
          </Col>
        </Row>
      </Animated.View>
    );
  }
  animationView() {
    const heightView = this.animateView.interpolate({
      inputRange: [0, 1],
      extrapolate: 'clamp',
      outputRange: [0, 120],
    });
    return {heightView};
  }
  render() {
    return this.sessions();
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    coach: state.coach,
  };
};

export default connect(mapStateToProps, {coachAction})(PastSessions);
