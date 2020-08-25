import React, {Component} from 'react';
import {Text, View, StyleSheet, Animated, FlatList, Image} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import {isEqual} from 'lodash';
import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import ButtonColor from '../../../../layout/Views/Button';
import AllIcons from '../../../../layout/icons/AllIcons';
import {
  generateThumbnailSet,
  getLocalVideoByID,
  getFirebaseVideoByID,
} from '../../../../functions/videoManagement';
import {getVideoInfo} from '../../../../functions/pictures';

import {native} from '../../../../animations/animations';
import AsyncImage from '../../../../layout/image/AsyncImage';

export default class Filmstrip extends Component {
  constructor(props) {
    super(props);

    this.state = {
      timeBounds: [0, 0],
      thumbnailAspect: 0,
      thumbnails: undefined,
      count: 13,
      loadedThumbs: 0,
    };

    this.loadedThumbs = 0;
    this.failedThumbs = false;
  }

  componentDidMount = async () => {
    this.props.onRef(this);
    const {archiveId} = this.props;
    let archive = await getLocalVideoByID(archiveId);
    if (!archive) archive = await getFirebaseVideoByID(archiveId);
    this.setState({
      timeBounds: [0, archive.durationSeconds],
      thumbnailAspect: archive.size.height / archive.size.width,
    });
    this.fetchThumbnails();
  };

  componentDidUpdate(prevState, prevProps) {
    const {onFilmstripLoad} = this.props;
    const {thumbnails, loadedThumbs, count} = this.state;
    if (
      thumbnails &&
      !prevState.thumbnails &&
      onFilmstripLoad &&
      loadedThumbs === count
    ) {
      onFilmstripLoad();
    }
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
    const thumbnails = await generateThumbnailSet(source, timeBounds, count);
    this.failedThumbs = false;
    this.setState({
      thumbnails,
      loadedThumbs: 0,
    });
  };

  thumbnail(response) {
    const {count} = this.state;
    const {seekbar} = this.props;
    const {item, index} = response;
    const {path} = item;
    const width = seekbar.width.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1 / count],
    });
    return (
      <Animated.View style={{width}}>
        <Image
          source={{uri: path}}
          style={styles.thumbnail}
          onError={(e) => {
            if (!this.failedThumbs) {
              this.failedThumbs = true;
              this.fetchThumbnails();
            }
          }}
          onLoad={(res) => {
            const {loadedThumbs} = this.state;
            this.setState({loadedThumbs: loadedThumbs + 1});
          }}
        />
      </Animated.View>
    );
  }

  render() {
    const {thumbnails} = this.state;
    return (
      <View style={styles.container}>
        <FlatList
          data={thumbnails}
          renderItem={this.thumbnail.bind(this)}
          keyExtractor={(item) => item.path}
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
    backgroundColor: colors.green,
  },
});
