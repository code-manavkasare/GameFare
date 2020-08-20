import React, {Component} from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import {connect} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import database from '@react-native-firebase/database';
import isEqual from 'lodash.isequal';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';

import {uploadQueueAction} from '../../../actions/uploadQueueActions';
import TaskCard from './TaskCard';

class QueueList extends Component {
  constructor(props) {
    super(props);
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.state = {
      queue: [],
      cloudQueue: [],
      taskLength: 0,
      tasksToRemove: [],
    };
    this.taskRefs = [];
  }

  componentDidMount() {
    this.fetchCloudUploadQueue();
  }

  fetchCloudUploadQueue() {
    const {userID} = this.props;
    database()
      .ref(`users/${userID}/archivedStreams/uploading`)
      .on('value', this.firebaseCallback.bind(this));
  }

  componentWillUnmount() {
    const {userID} = this.props;
    database()
      .ref(`users/${userID}/archivedStreams/uploading`)
      .off('value', this.firebaseCallback.bind(this));
  }

  static getDerivedStateFromProps(props, state) {
    const {userID, uploadQueue} = props;
    const {queue} = uploadQueue;
    let {taskLength, tasksToRemove} = state;
    const {queue: prevQueue} = state;
    const cloudQueue = state.cloudQueue ? Object.values(state.cloudQueue) : [];
    const finalQueue = cloudQueue
      .filter(
        (task) =>
          task?.hostUser !== userID &&
          task?.thumbnail !== undefined &&
          task?.durationSeconds !== undefined &&
          task?.date !== undefined &&
          task?.progress !== undefined,
      )
      .concat(queue.filter((task) => task?.displayInList))
      .sort((a, b) => {
        if (a?.index > b?.index) return 1;
        if (a?.index < b?.index) return -1;
        else return 0;
      });
    let newState = {
      ...newState,
      queue: finalQueue,
    };
    if (finalQueue?.length > taskLength) {
      taskLength = finalQueue?.length;
      newState = {
        ...newState,
        taskLength: finalQueue?.length,
      };
    }
    if (finalQueue?.length < prevQueue?.length) {
      let removalIndex = 0;
      for (let task in finalQueue) {
        if (
          finalQueue[task]?.filename &&
          prevQueue[task]?.filename &&
          finalQueue[task]?.filename === prevQueue[task]?.filename
        )
          removalIndex++;
        else break;
      }
      let removedTask = {
        task: {
          ...prevQueue[removalIndex],
          progress: 1,
          remove: true,
        },
        index: removalIndex,
      };
      tasksToRemove.push(removedTask);
      newState = {
        ...newState,
        tasksToRemove,
      };
    }
    let progressSum = 0;
    finalQueue.map((task) => {
      progressSum += task?.progress;
    });
    const completedTasks = taskLength - finalQueue?.length;
    progressSum += completedTasks > 0 ? completedTasks : 0;
    const totalProgress = progressSum / taskLength;
    return {
      ...newState,
      totalProgress,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const {queue, taskLength, totalProgress} = this.state;
    const {queue: prevQueue, totalProgress: prevTotalProgress} = prevState;
    if (queue?.length > prevQueue?.length) {
      this.props.onOpen(queue?.length);
    } else if (queue?.length === 0 && prevQueue?.length > 0) {
      this.props.onClose();
      this.listY = new Animated.Value(0);
      this.setState({taskLength: 0, tasksToRemove: [], listY: 0});
    } else if (
      prevTotalProgress &&
      totalProgress > prevTotalProgress &&
      this.props.totalProgress
    ) {
      this.props.totalProgress(totalProgress ? totalProgress : 0);
    }
  }

  async firebaseCallback(snap) {
    const {queue} = this.state;
    const {userID} = this.props;
    const snapshot = snap.val();
    let cloudQueue = !snapshot
      ? []
      : Object.values(snapshot).filter((task) => task?.hostUser !== userID);
    this.setState({
      cloudQueue,
    });
    if (this.props.onFetch) {
      this.props.onFetch(queue);
    }
  }

  list() {
    const {localList} = this.props;
    const {queue} = this.state;
    if (localList) {
      if (queue.length === 0) return null;
      return (
        <View style={{minHeight: 120}}>
          {queue.map((task, i) => (
            <TaskCard
              task={task}
              index={i}
              key={i}
              onRef={(ref) => {
                this.taskRefs[i] = ref;
              }}
            />
          ))}
        </View>
      );
    }
    return (
      <ScrollView
        style={{marginBottom: 10}}
        showVerticalScrollbar={false}
        contentContainerStyle={{marginTop: 0, paddingBottom: 100}}>
        {queue.map((task, i) => (
          <TaskCard
            task={task}
            index={i}
            key={i}
            onRef={(ref) => {
              this.taskRefs[i] = ref;
            }}
          />
        ))}
      </ScrollView>
    );
  }

  emptyList() {
    const {queue} = this.state;
    return (
      <View
        style={{
          ...styles.emptyList,
          opacity: queue.length === 0 ? 1 : 0,
        }}>
        <Image
          source={require('../../../img/images/rocket.png')}
          style={styles.rocket}
          resizeMode="contain"
        />
        <Text style={[styleApp.title, {marginTop: 20, fontSize: 18}]}>
          {'All done!'}
        </Text>
      </View>
    );
  }

  render() {
    const {localList} = this.props;
    if (localList) return this.list();
    return (
      <View>
        {this.emptyList()}
        {this.list()}
        <LinearGradient
          style={{width: '100%', height: 100, bottom: 0, position: 'absolute'}}
          colors={[colors.white + '00', colors.white, colors.white]}
        />
        <LinearGradient
          style={{width: '100%', height: 20, top: 0, position: 'absolute'}}
          colors={[colors.white, colors.white + '00']}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    marginTop: 15,
  },
  emptyList: {
    ...styleApp.center,
    position: 'absolute',
    height: 200,
    width: '100%',
    zIndex: 2,
  },
  rocket: {
    height: 60,
    width: '100%',
    marginTop: 25,
  },
});

const mapStateToProps = (state) => {
  return {
    uploadQueue: state.uploadQueue,
    userID: state.user.userID,
  };
};

export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(QueueList);
