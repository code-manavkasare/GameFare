import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableHighlight,
} from 'react-native';
import {Row, Col} from 'react-native-easy-grid';
import {connect} from 'react-redux';
import * as Progress from 'react-native-progress';
import Swipeout from 'react-native-swipeout';

import styleApp from '../../style/style';
import colors from '../../style/colors';

import {uploadQueueAction} from '../../../actions/uploadQueueActions';
import {FormatDate, formatDuration} from '../../functions/date';
import AllIcons from '../../layout/icons/AllIcons';

class TaskCard extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {onRef} = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  thumbnail() {
    const {task} = this.props;
    return (
      <View style={styles.fullCenter}>
        <View style={{...styles.thumbnail}}>
          {task?.videoInfo?.thumbnail ? (
            <Image
              source={{uri: task.videoInfo.thumbnail}}
              style={styles.thumbnail}
            />
          ) : (
            <View style={styles.placeholderContainer} />
          )}
        </View>
      </View>
    );
  }

  taskInfo() {
    const {task, currentScreenSize} = this.props;
    const {type, progress, timeSubmitted} = task;
    const {currentWidth} = currentScreenSize;
    return (
      <View style={{width: '100%'}}>
        <Text style={{...styleApp.title, fontSize: 15, marginBottom: 5}}>
          {type === 'video'
            ? formatDuration(task?.videoInfo?.durationSeconds)
            : ''}
        </Text>
        <Text style={{...styleApp.text, fontSize: 15, marginBottom: 15}}>
          <FormatDate date={timeSubmitted} />
        </Text>
        <Progress.Bar
          color={colors.primaryLight}
          width={currentWidth * 0.65}
          progress={progress}
          borderWidth={0}
          unfilledColor={colors.grey}
          formatText={() => progress === 0 ? '' : `${Math.round(progress * 100)}%`}
        />
      </View>
    );
  }

  render() {
    const {task} = this.props;
    return (
      <View
        style={{
          ...styles.card,
          opacity: task.uploading ? 1 : 0.7,
        }}>
        <Row>
          <Col size={15}>{this.thumbnail()}</Col>
          <Col size={5} />
          <Col size={80} style={styles.taskInfo}>
            {this.taskInfo()}
          </Col>
        </Row>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fullCenter: {
    ...styleApp.center,
    ...styleApp.fullSize,
  },
  card: {
    ...styleApp.marginView,
    paddingTop: 15,
    height: 100,
    paddingBottom: 15,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 50,
    height: 70,
    ...styleApp.shadow,
    borderRadius: 6,
    backgroundColor: colors.greyDark,
  },
  textProgress: {
    ...styleApp.textBold,
    fontWeight: 'bold',
    color: 'white',
    fontSize: 17,
  },
  placeholderContainer: {
    ...styleApp.center,
    height: 60,
    width: 60,
    borderRadius: 40,
    backgroundColor: colors.greyDark,
  },
  placeholder: {
    height: 30,
    width: 30,
    tintColor: colors.grey,
  },
  complete: {
    ...styleApp.fullSize,
    ...styleApp.center,
    position: 'absolute',
    backgroundColor: colors.greyLight + '40',
    opacity: 0.8,
  },
  taskInfo: {
    paddingLeft: 10,
    justifyContent: 'center',
  },
});

const mapStateToProps = (state) => {
  return {
    uploadQueue: state.uploadQueue,
    currentScreenSize: state.layout.currentScreenSize,
  };
};

export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(TaskCard);
