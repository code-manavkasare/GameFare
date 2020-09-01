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
      orderedTasks: [],
      cloudQueue: [],
    };
  }

  static getDerivedStateFromProps(props, state) {
    const {uploadQueue} = props;
    const {queue} = uploadQueue;
    if (queue && Object.values(queue).length >= 0) {
      const orderedTasks = Object.values(queue)
        .filter((task) => task.displayInList)
        .sort((a, b) => a.timeSubmitted - b.timeSubmitted);
      return {orderedTasks};
    }
    // const cloudQueue = state.cloudQueue ? Object.values(state.cloudQueue) : [];
    // const finalQueue = cloudQueue
    //   .filter(
    //     (task) =>
    //       task?.hostUser !== userID &&
    //       task?.thumbnail !== undefined &&
    //       task?.durationSeconds !== undefined &&
    //       task?.date !== undefined &&
    //       task?.progress !== undefined,
    //   )
    //   .concat(Object.values(queue).filter((task) => task?.displayInList))
    //   .sort((a, b) => {
    //     if (a?.index > b?.index) return 1;
    //     if (a?.index < b?.index) return -1;
    //     else return 0;
    //   });
  }

  componentDidMount() {
    //this.fetchCloudUploadQueue();
  }

  componentWillUnmount() {
    // const {userID} = this.props;
    // database()
    //   .ref(`users/${userID}/archivedStreams/uploading`)
    //   .off('value', this.firebaseCallback.bind(this));
  }

  componentDidUpdate(prevProps, prevState) {
    const {orderedTasks} = this.state;
    const {orderedTasks: prevOrderedTasks} = prevState;
    if (orderedTasks?.length > prevOrderedTasks?.length) {
      this.props.onOpen();
    } else if (orderedTasks?.length === 0 && prevOrderedTasks?.length > 0) {
      this.props.onClose();
      // this.listY = new Animated.Value(0);
      // this.setState({listY: 0});
    }
  }

  // fetchCloudUploadQueue() {
  //   const {userID} = this.props;
  //   database()
  //     .ref(`users/${userID}/archivedStreams/uploading`)
  //     .on('value', this.firebaseCallback.bind(this));
  // }

  // async firebaseCallback(snap) {
  //   const {orderedTasks} = this.state;
  //   const {userID} = this.props;
  //   const snapshot = snap.val();
  //   let cloudQueue = !snapshot
  //     ? []
  //     : Object.values(snapshot).filter((task) => task?.hostUser !== userID);
  //   this.setState({
  //     cloudQueue,
  //   });
  //   if (this.props.onFetch) {
  //     this.props.onFetch(orderedTasks);
  //   }
  // }

  list() {
    // const {localList} = this.props;
    const {orderedTasks} = this.state;
    // if (localList) {
    //   if (orderedTasks.length === 0) {
    //     return null;
    //   } else {
    //     return (
    //       <View style={{minHeight: 120}}>
    //         {orderedTasks.map((task, i) => (
    //           <TaskCard
    //             task={task}
    //             index={i}
    //             key={task.id}
    //             onRef={(ref) => {
    //               this.taskRefs[i] = ref;
    //             }}
    //           />
    //         ))}
    //       </View>
    //     );
    //   }
    // } else {
    return (
      <ScrollView
        style={{marginBottom: 10}}
        showVerticalScrollbar={false}
        contentContainerStyle={{marginTop: 0, paddingBottom: 100}}>
        {orderedTasks.map((task, i) => (
          <TaskCard
            task={task}
            index={i}
            key={task.id}
          />
        ))}
      </ScrollView>
    );
    // }
  }

  emptyList() {
    return (
      <View
        style={{
          ...styles.emptyList,
          opacity: 1,
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
    const {orderedTasks} = this.state;
    return (
      <View>
        {!orderedTasks || (orderedTasks.length === 0 && this.emptyList())}
        {orderedTasks && orderedTasks.length > 0 && this.list()}
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
