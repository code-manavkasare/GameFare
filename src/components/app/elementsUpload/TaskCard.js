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
import moment from 'moment';

import styleApp from '../../style/style';
import colors from '../../style/colors';

import {uploadQueueAction} from '../../../actions/uploadQueueActions';

class TaskCard extends Component {
  thumbnail() {
    const {task} = this.props;
    return (
      <View style={styles.fullCenter}>
        {task.thumbnail ? (
          <Image source={{uri: task.thumbnail}} style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Image
              source={require('../../../img/icons/technology.png')}
              style={styles.placeholder}
            />
          </View>
        )}
        <View style={{position: 'absolute'}}>
          <Progress.Circle
            color={colors.primary}
            size={70}
            progress={task.progress}
            borderWidth={0}
            borderColor={colors.white}
            textStyle={styles.textProgress}
            showsText={true}
            formatText={() => {
              if (task.progress === 0) return '';
              return `${Math.round(task.progress * 100)}%`;
            }}
          />
        </View>
      </View>
    );
  }

  taskInfo() {
    const {task} = this.props;
    const {type, filename} = task;
    return (
      <View>
        <Text style={{...styleApp.title, fontSize: 15}}>
          {type === 'image'
            ? filename
            : this.formatDuration(
                task.duration
                  ? task.duration
                  : (task.stopTime - task.startTime) / 1000,
              )}
        </Text>
        <Text style={{...styleApp.text, fontSize: 15}}>
          {this.formatDate(task.date)}
        </Text>
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
      <View style={styles.card}>
        <Row>
          <Col size={35}>{this.thumbnail()}</Col>
          <Col size={65} style={styles.taskInfo}>
            {this.taskInfo()}
          </Col>
        </Row>
      </View>
      // <Swipeout
      //   key={id}
      //   style={{height: 80}}
      //   backgroundColor="transparent"
      //   right={[
      //     {
      //       type: 'delete',
      //       component: this.deleteButton(),
      //       onPress: () => {
      //         this.deleteJob(index);
      //       },
      //     },
      //   ]}>

      // </Swipeout>
    );
  }

  formatDate(date) {
    let justNow = moment(Date.now()).subtract(1, 'minute');
    let earlier = moment(Date.now()).subtract(7, 'days');
    let lastYear = moment(Date.now()).subtract(1, 'year');
    if (date > justNow) return 'Just now';
    else if (date > earlier) return moment(date).fromNow();
    else if (date > lastYear) return moment(date).format('ddd, MMM DD');
    else return moment(date).format('MMMM YYYY');
  }

  formatDuration(duration) {
    if (duration > 60)
      return Math.round(duration / 60).toString() + ' minutes long';
    else return Math.round(duration).toString() + ' seconds long';
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
  },
  thumbnail: {
    height: 60,
    width: 60,
    borderRadius: 40,
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
  };
};

export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(TaskCard);
