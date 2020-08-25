import React, {Component} from 'react';
import {Text, View, StyleSheet, Animated, FlatList} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import {isEqual} from 'lodash';
import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import ButtonColor from '../../../../layout/Views/Button';
import AllIcons from '../../../../layout/icons/AllIcons';
import {generateThumbnailSet} from '../../../../functions/videoManagement';
import {getVideoInfo} from '../../../../functions/pictures';

import {native} from '../../../../animations/animations';
import AsyncImage from '../../../../layout/image/AsyncImage';

export default class Filmstrip extends Component {
  constructor(props) {
    super(props);

    this.state = {
      timeBounds: [0, 0],
      thumbnailAspect: 0,
      thumbnails: [],
      count: 13,
    };
  }

  componentDidMount = async () => {
    this.props.onRef(this);
    const {source} = this.props;
    console.log('Source', this.props.source);
    const videoInfo = await getVideoInfo(source);
    this.setState({
      timeBounds: [0, videoInfo.durationSeconds],
      thumbnailAspect: videoInfo.size.height / videoInfo.size.width,
    });
    this.fetchThumbnails();
  };

  componentDidUpdate(prevState, prevProps) {
    // console.log(this.props);
  }

  shouldComponentUpdate(prevProps, prevState) {
    if (!isEqual(prevProps, this.props)) {
      return false;
    }
    return true;
  }

  fetchThumbnails = async (from, to) => {
    const {source} = this.props;
    const {count} = this.state;
    const timeBounds = !from || !to ? this.state.timeBounds : [from, to];
    const callback = (thumbnail) => {
      const {thumbnails} = this.state;
      thumbnails.push(thumbnail);
      this.setState({thumbnails});
    };
    generateThumbnailSet(source, timeBounds, count, callback);
  };

  thumbnail(item, index) {
    const {count} = this.state;
    const {seekbar} = this.props;
    const {path} = item.item;
    const width = seekbar.width.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1 / count],
    });
    return (
      <Animated.View style={{width}} key={index}>
        <AsyncImage mainImage={path} style={styles.thumbnail} />
      </Animated.View>
    );
  }

  render() {
    const {thumbnails} = this.state;
    // console.log(thumbnails.length);
    return (
      <View style={styles.container}>
        <FlatList
          data={thumbnails}
          renderItem={(item, index) => this.thumbnail(item, index)}
          keyExtractor={(item, index) => index.toString() + '_' + item.path}
          horizontal={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...styleApp.fullSize,
  },
  thumbnail: {
    ...styleApp.fullSize,
    opacity: 0.9,
  },
});
