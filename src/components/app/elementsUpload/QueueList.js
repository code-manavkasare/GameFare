import React, {Component} from 'react';
import {View, Text, Animated, StyleSheet, Image} from 'react-native';
import {connect} from 'react-redux';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';

import {uploadQueueAction} from '../../../actions/uploadQueueActions';
import ScrollView from '../../layout/scrollViews/ScrollView';
import TaskCard from './TaskCard';

class QueueList extends Component {
  constructor(props) {
    super(props);
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  header() {
    const {status} = this.props.uploadQueue;

    return (
      <View style={{...styles.header, ...styleApp.center}}>
        <Text style={[styleApp.title, {fontSize: 18}]}>
          {status === 'empty' ? 'All done!' : 'Currently Uploading'}
        </Text>
      </View>
    );
  }

  list() {
    const {queue} = this.props.uploadQueue;
    const filteredQueue = queue.filter((task) => task.displayInList);

    return (
      <View style={{marginBottom: 10}}>
        {filteredQueue.map((task, i) => (
          <TaskCard task={task} index={i} key={i} />
        ))}
      </View>
    );
  }

  emptyList() {
    const {status} = this.props.uploadQueue;
    return (
      <View
        style={{
          ...styles.emptyList,
          opacity: status === 'empty' ? 1 : 0,
        }}>
        <Image
          source={require('../../../img/images/rocket.png')}
          style={styles.rocket}
          resizeMode="contain"
        />
      </View>
    );
  }

  render() {
    return (
      <View style={styleApp.fullSize}>
        {this.header()}
        {this.emptyList()}
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.list()}
          marginBottomScrollView={0}
          marginTop={-25}
          offsetBottom={0}
          showsVerticalScrollIndicator={true}
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
    height: '100%',
    width: '100%',
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
  };
};

export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(QueueList);
