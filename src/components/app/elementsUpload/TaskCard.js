import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Row, Col} from 'react-native-easy-grid';
import {connect} from 'react-redux';
import * as Progress from 'react-native-progress';

import {boolShouldComponentUpdate} from '../../functions/redux';
import styleApp from '../../style/style';
import colors from '../../style/colors';

import AsyncImage from '../../layout/image/AsyncImage';
import {FormatDate, formatDuration} from '../../functions/date';
import {currentScreenSizeSelector} from '../../../store/selectors/layout';
import {connectionTypeSelector} from '../../../store/selectors/connectionType';
import {thumbnailSelector} from '../../../store/selectors/archives';

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
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'TaskCard',
    });
  }

  thumbnail() {
    const {task, archiveThumbnail} = this.props;
    return (
      <View style={styles.fullCenter}>
        <View style={{...styles.thumbnail}}>
          {archiveThumbnail ? (
            <AsyncImage mainImage={archiveThumbnail} style={styles.thumbnail} />
          ) : task?.videoInfo?.thumbnail ? (
            <AsyncImage
              mainImage={task?.videoInfo?.thumbnail}
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
    const {task, currentScreenSize, connectionType} = this.props;
    const {type, progress, timeSubmitted} = task;
    const {currentWidth} = currentScreenSize;
    return (
      <View style={{width: '100%'}}>
        <Text style={{...styleApp.title, fontSize: 15, marginBottom: 5}}>
          {type === 'video'
            ? formatDuration({
                duration: task?.videoInfo?.durationSeconds,
                inputUnit: 'second',
                formatType: 'textBrief',
              })
            : ''}
        </Text>
        <Text style={{...styleApp.text, fontSize: 15, marginBottom: 15}}>
          {connectionType !== 'wifi' && task.isBackground === true ? (
            'Waiting for Wi-Fi...'
          ) : (
            <FormatDate date={timeSubmitted} />
          )}
        </Text>
        <Progress.Bar
          color={colors.primaryLight}
          width={currentWidth * 0.65}
          progress={progress ? progress : 0}
          borderWidth={0}
          unfilledColor={colors.grey}
          formatText={() =>
            progress === 0 ? '' : `${Math.round(progress * 100)}%`
          }
        />
      </View>
    );
  }

  render() {
    const {task} = this.props;
    const styleCard = {
      ...styles.card,
      opacity: task.uploading ? 1 : 0.7,
    };
    return (
      <View style={styleCard}>
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

const mapStateToProps = (state, props) => {
  return {
    currentScreenSize: currentScreenSizeSelector(state),
    connectionType: connectionTypeSelector(state),
    archiveThumbnail: thumbnailSelector(state, {id: props.task.cloudID}),
  };
};

export default connect(mapStateToProps)(TaskCard);
