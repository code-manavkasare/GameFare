import React, {Component} from 'react';
import {View, StyleSheet, Animated, FlatList, Image} from 'react-native';
import {isEqual} from 'lodash';
import styleApp from '../../../../style/style';
import {
  checkFetchAndSaveThumbnailsForSeekBar,
  generateThumbnailSet,
} from '../../../../functions/videoManagement';
import {getArchiveByID} from '../../../../functions/archive';
import {timing} from '../../../../animations/animations';

export default class Filmstrip extends Component {
  constructor(props) {
    super(props);

    this.state = {
      timeBounds: [0, 0],
      thumbnailAspect: 0,
      thumbnails: [],
      count: 13,
      loadedThumbs: 0,
    };
    this.opacity = new Animated.Value(0);
  }

  componentDidMount = async () => {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
    const {archiveId} = this.props;
    let archive = await getArchiveByID(archiveId);
    const {durationSeconds, local, size} = archive;
    this.setState({
      timeBounds: [0, durationSeconds],
      thumbnailAspect: size.height / size.width,
      thumbnails: archive.initialSeekbarThumbnails,
    });
    if (!local) {
      console.log('fetch Thumbnails');
      const {thumbnailsSeekBar} = archive;
      const thumbnails = await checkFetchAndSaveThumbnailsForSeekBar({
        archiveId,
        url: thumbnailsSeekBar,
      });
      this.setState({thumbnails});
    }
    if (local) {
      const thumbnails = this.sanitizeThumbnailsLocalsPath(
        await this.fetchThumbnails({}),
      );
      this.setState({thumbnails});
    }
  };

  async componentDidUpdate(prevProps, prevState) {
    const {onFilmstripLoad} = this.props;
    const {loadedThumbs, count} = this.state;
    if (onFilmstripLoad && loadedThumbs === count) {
      Animated.timing(this.opacity, timing(1, 150)).start();
      onFilmstripLoad();
    }
  }

  sanitizeThumbnailsLocalsPath = (thumbnails) => {
    return thumbnails.map((thumbnailInfo) => {
      return thumbnailInfo.path;
    });
  };

  shouldComponentUpdate(prevProps, prevState) {
    const {loadedThumbs} = this.state;
    const {source} = this.props;
    const {loadedThumbs: prevLoadedThumbs} = prevState;
    const {source: prevSource} = prevProps;
    if (loadedThumbs !== prevLoadedThumbs || source !== prevSource) {
      return true;
    } else if (!isEqual(prevProps, this.props)) {
      return false;
    }
    return true;
  }

  fetchThumbnails = async (options) => {
    const {source} = this.props;
    if (source !== undefined) {
      const {from, to, count, index} = options;
      const {count: stateCount} = this.state;

      if (!source) return;
      const timeBounds = !from || !to ? this.state.timeBounds : [from, to];
      let thumbnailSet = await generateThumbnailSet({
        source,
        timeBounds,
        size: count ? count : stateCount,
        index,
      });
      let {thumbnails} = this.state;
      if (index !== undefined) {
        thumbnails[index] = thumbnailSet[0];
      } else {
        thumbnails = thumbnailSet;
      }
      return thumbnails;
    }
  };

  thumbnail = (response) => {
    const {count} = this.state;
    const {seekbar} = this.props;
    const {item: path, index} = response;
    const width = seekbar.width.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1 / count],
    });
    const opacity = this.opacity;
    return (
      <Animated.View style={{opacity, width}}>
        <Image
          source={{uri: path}}
          style={styles.thumbnail}
          onError={(e) => {
            console.log('error thumbnail ', e);
          }}
          onLoad={(res) => {
            const {loadedThumbs} = this.state;
            this.setState({
              loadedThumbs: loadedThumbs + 1,
            });
          }}
        />
      </Animated.View>
    );
  };

  render() {
    const {thumbnails} = this.state;

    return thumbnails !== [] ? (
      <View style={styles.container}>
        <FlatList
          data={thumbnails}
          renderItem={(item) => this.thumbnail(item)}
          keyExtractor={(item) => item}
          horizontal={true}
        />
      </View>
    ) : null;
  }
}

const styles = StyleSheet.create({
  container: {
    ...styleApp.fullSize,
  },
  thumbnail: {
    ...styleApp.fullSize,
    opacity: 0.85,
  },
});
