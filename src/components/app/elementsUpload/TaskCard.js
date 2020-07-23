import React, {Component} from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Image,
  TouchableHighlight,
} from 'react-native';
import {Row, Col} from 'react-native-easy-grid';
import {connect} from 'react-redux';
import * as Progress from 'react-native-progress';
import Swipeout from 'react-native-swipeout';

import styleApp from '../../style/style';
import colors from '../../style/colors';

import {uploadQueueAction} from '../../../actions/uploadQueueActions';
import {FormatDate, formatDuration} from '../../functions/date'

class TaskCard extends Component {
  thumbnail() {
    const {task} = this.props;
    return (
      <View style={styles.fullCenter}>
        <View style={{...styles.thumbnail}}>
        {task.thumbnail ? (
          <Image source={{uri: task.thumbnail}} style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholderContainer} />
        )}
        </View>
        <View style={{position: 'absolute'}}>
        </View>
      </View>
    );
  }

  taskInfo() {
    const {task} = this.props;
    const {currentScreenSize, members} = this.props;

    const {type, filename} = task;
    const {currentWidth: width} = currentScreenSize;
    return (
      <View style={{width:'100%'}}>
        <Text style={{...styleApp.title, fontSize: 15, marginBottom:5}}>
          {type === 'image'
            ? filename
            : formatDuration(
                task.duration
                  ? task.duration
                  : (task.stopTime - task.startTime) / 1000,
              )}
        </Text>
        <Text style={{...styleApp.text, fontSize: 15, marginBottom:15}}>
          <FormatDate date={task.date} />
        </Text>
        <Progress.Bar
          color={colors.primaryLight}
          width={width*0.65}
          progress={task.progress}
          borderWidth={0}
          unfilledColor={colors.grey}
          formatText={() => {
            if (task.progress === 0) return '';
            return `${Math.round(task.progress * 100)}%`;
          }}
        />
      </View>
    );
  }

  deleteButton() {
    return (
      <View style={{...styleApp.center, height: '100%'}}>
        <Image
          source={require('../../../img/icons/closeWhite.png')}
          style={{height: 22, width: 22}}
        />
      </View>
    );
  }

  render() {
    const {task, index} = this.props;
    const id = task.localIdentifier;
    return (
      <View style={{...styles.card, opacity: (task.progress === 0) ? 0.6 : 1}}>
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

  deleteJob(index) {
    const {uploadQueueAction, task} = this.props;
    if (task.progress === 0) uploadQueueAction('dequeueFileUpload', index);
  }
}

const styles = StyleSheet.create({
  fullCenter: {
    ...styleApp.center,
    ...styleApp.fullSize,
  },
  card: {
    ...styleApp.marginView,
    height: 80,
    marginTop:15,
    marginBottom:5
  },
  thumbnail: {
    width:50,
    height:70,
    ...styleApp.shadow,
    borderRadius: 6,
    backgroundColor:colors.greyDark
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
