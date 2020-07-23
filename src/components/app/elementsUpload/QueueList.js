import React, {Component} from 'react';
import {View, Text, Animated, StyleSheet, Image, ScrollView} from 'react-native';
import {connect} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';

import {uploadQueueAction} from '../../../actions/uploadQueueActions';
// import ScrollView from '../../layout/scrollViews/ScrollView';
import TaskCard from './TaskCard';

class QueueList extends Component {
  constructor(props) {
    super(props);
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  list() {
    const {queue} = this.props.uploadQueue;
    const filteredQueue = queue.filter((task) => task.displayInList);

    return (
      <ScrollView style={{marginBottom: 10}} contentContainerStyle={{marginTop:0, paddingBottom:100 }}>
        {filteredQueue.map((task, i) => (
          <TaskCard task={task} index={i} key={i} />
        ))}
      </ScrollView>
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
        <Text style={[styleApp.title, {marginTop:20, fontSize: 18}]}>
          {'All done!'}
        </Text>
      </View>
    );
  }

  render() {
    return (
      <View style={styleApp.fullSize}>
        {this.emptyList()}
        {this.list()}
        <LinearGradient
          style={{width:'100%', height:100, bottom:0, position: 'absolute'}}
          colors={[colors.white + '00', colors.white, colors.white]}
        />
        <LinearGradient
          style={{width:'100%', height:20, top:0, position: 'absolute'}}
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
