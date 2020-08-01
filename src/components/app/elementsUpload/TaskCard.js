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
import {FormatDate, formatDuration} from '../../functions/date'
import AllIcons from '../../layout/icons/AllIcons';

/*
Task Object: (required keys)
  {
    thumbnail: url,
    durationSeconds: int,
    date: int,
    progress: int
  }
*/

class TaskCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      task: {}
    }
  }

  componentDidMount() {
    this.props.onRef(this)
  }

  static getDerivedStateFromProps (props, state) {
    const {task} = props;
    let stateTask = {...task}
    if (!task.progress) stateTask.progress = 0
    return {
      task: stateTask
    }
  }

  thumbnail() {
    const {task} = this.state;
    return (
      <View style={styles.fullCenter}>
        <View style={{...styles.thumbnail}}>
        {task.thumbnail ? (
          <Image source={{uri: task.thumbnail}} style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholderContainer} />
        )}
        </View>
      </View>
    );
  }

  taskInfo() {
    const {task} = this.state;
    const {currentScreenSize, members} = this.props;

    const {type, filename} = task;
    const {currentWidth: width} = currentScreenSize;
    return (
      <View style={{width:'100%'}}>
        <Text style={{...styleApp.title, fontSize: 15, marginBottom:5}}>
          {type === 'image'
            ? filename
            : formatDuration(task.durationSeconds)}
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
    const {index} = this.props;
    const {task} = this.state;
    return (
      <View style={{
        ...styles.card,
        opacity: (task.progress !== 0 || index === 0) ? 1 : 0.7
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

  deleteJob(index) {
    const {uploadQueueAction} = this.props;
    const {task} = this.state
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
    paddingTop:15,
    height:100,
    paddingBottom:15,
    overflow: 'hidden'
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
  complete: {
    ...styleApp.fullSize,
    ...styleApp.center,
    position: 'absolute',
    backgroundColor:colors.greyLight+'40',
    opacity:0.8
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
