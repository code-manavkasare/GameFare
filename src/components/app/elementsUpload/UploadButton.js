import React, {Component} from 'react';
import {
  View,
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Dimensions,
} from 'react-native';
import {connect} from 'react-redux';
import {Row, Col} from 'react-native-easy-grid';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';
import {native} from '../../animations/animations';

import Loader from '../../layout/loaders/Loader';
import ButtonColor from '../../layout/Views/Button';
import QueueList from './QueueList';

class UploadButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
    this.scaleCard = new Animated.Value(0);
    this.buttonAnimation = new Animated.Value(0);
  }

  componentDidMount() {
    const {status} = this.props;
    if (status === 'uploading') this.showButton();
  }

  componentDidUpdate(prevProps, prevState) {
    const {expanded} = this.state;
    const {status, queue} = this.props;
    if (expanded !== prevState.expanded) {
      if (expanded) this.open();
      else this.close();
    }
    if (status !== prevProps.status) {
      if (status === 'empty') this.hideButton();
      if (
        status === 'uploading' &&
        queue.filter((task) => task.displayInList).length > 0
      )
        this.showButton();
    }
  }

  showButton() {
    return Animated.parallel([
      Animated.timing(this.buttonAnimation, native(1, 150)),
    ]).start();
  }

  hideButton() {
    return Animated.sequence([
      Animated.delay(2000),
      Animated.timing(this.buttonAnimation, native(0, 150)),
    ]).start(() => {
      this.setState({expanded: false});
    });
  }

  open() {
    return Animated.parallel([
      Animated.timing(this.scaleCard, native(1, 150)),
    ]).start();
  }

  close() {
    return Animated.parallel([
      Animated.timing(this.scaleCard, native(0, 150)),
    ]).start(() => {
      this.setState({expanded: false});
    });
  }

  backdrop() {
    const {expanded} = this.state;
    const {backdrop} = this.props;
    if (backdrop === undefined) return;
    return (
      <TouchableWithoutFeedback onPress={() => this.close()}>
        <Animated.View
          pointerEvents={expanded ? 'auto' : 'none'}
          style={{...styles.fullPage, opacity: 0}}
        />
      </TouchableWithoutFeedback>
    );
  }

  button() {
    const {status} = this.props;
    return (
      <Animated.View>
        <ButtonColor
          view={() => {
            return status === 'uploading' ? (
              <Loader size={30} color={colors.white} />
            ) : status === 'empty' ? (
              <Image
                source={require('../../../img/icons/check.png')}
                style={{width: 20, height: 20, tintColor: 'white'}}
              />
            ) : status === 'paused' ? (
              <Image
                source={require('../../../img/icons/pause.png')}
                style={{width: 20, height: 20, tintColor: 'white'}}
              />
            ) : null;
          }}
          click={() => {
            this.setState({expanded: true});
          }}
          color={colors.title + '70'}
          style={styles.buttonRight}
          onPressColor={colors.title + '70'}
        />
      </Animated.View>
    );
  }

  expandableView() {
    const {expanded} = this.state;
    const {width} = Dimensions.get('screen');
    const {expandableViewStyle, expandableView} = this.props;
    const translateY = this.scaleCard.interpolate({
      inputRange: [0, 1],
      outputRange: [-50, 0],
      extrapolate: 'clamp',
    });
    return expanded && expandableView ? (
      <Animated.View
        style={{
          ...expandableViewStyle,
          ...styles.expandableView,
          left: width - expandableViewStyle.width - 20,
          opacity: this.scaleCard,
          transform: [{translateY: translateY}],
        }}>
        <QueueList />
      </Animated.View>
    ) : null;
  }

  streamButtonView() {
    const {style} = this.props;
    const {width} = Dimensions.get('screen');
    const translateX = this.buttonAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [width, 0],
      extrapolate: 'clamp',
    });
    return (
      <Animated.View style={{...style, transform: [{translateX: translateX}]}}>
        <Row>
          <Col size={85} />
          <Col size={15} style={styleApp.center3}>
            {this.button()}
          </Col>
        </Row>
        {this.expandableView()}
      </Animated.View>
    );
  }

  render() {
    return (
      <View>
        {this.streamButtonView()}
        {this.backdrop()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonRight: {
    ...styleApp.center,
    height: 46,
    width: 46,
    borderRadius: 23,
    borderWidth: 0,
  },
  expandableView: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 15,
    zIndex: 12,
    top: 70,
  },
  fullPage: {
    position: 'absolute',
    width: sizes.width,
    height: 200000,
    backgroundColor: '#000000',
    zIndex: 10,
  },
});

const mapStateToProps = (state) => {
  return {
    status: state.uploadQueue.status,
    queue: state.uploadQueue.queue,
  };
};

export default connect(
  mapStateToProps,
  {},
)(UploadButton);
