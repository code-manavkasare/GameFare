import React, {Component} from 'react';
import {View, StyleSheet, Animated, FlatList, Image} from 'react-native';
import {isEqual} from 'lodash';
import styleApp from '../../../../style/style';
import {generateThumbnailSet} from '../../../../functions/videoManagement';
import {getArchiveByID} from '../../../../functions/archive';
import {setArchive} from '../../../../../actions/archivesActions';
import {store} from '../../../../../../reduxStore';
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

    this.loadedThumbs = 0;
    this.failedThumbs = false;
    this.opacity = new Animated.Value(0);
  }

  componentDidMount = async () => {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
    const {archiveId} = this.props;
    let archive = await getArchiveByID(archiveId);
    this.setState({
      timeBounds: [0, archive.durationSeconds],
      thumbnailAspect: archive.size.height / archive.size.width,
      thumbnails: archive.initialSeekbarThumbnails,
    });
    if (!archive.initialSeekbarThumbnails) {
      const thumbnails = await this.fetchThumbnails({});
      store.dispatch(
        setArchive({
          ...archive,
          initialSeekbarThumbnails: thumbnails,
        }),
      );
    }
  };

  componentDidUpdate(prevState, prevProps) {
    const {onFilmstripLoad} = this.props;
    const {thumbnails, loadedThumbs, count} = this.state;
    if (
      !isEqual(thumbnails, prevState.thumbnails) &&
      onFilmstripLoad &&
      loadedThumbs === count
    ) {
      Animated.timing(this.opacity, timing(1, 150)).start();
      onFilmstripLoad();
    }
  }

  shouldComponentUpdate(prevProps, prevState) {
    const {thumbnails} = this.state;
    const {thumbnails: prevThumbnails} = prevState;
    if (!isEqual(thumbnails, prevThumbnails)) {
      return true;
    } else if (!isEqual(prevProps, this.props)) {
      return false;
    }
    return true;
  }

  fetchThumbnails = async (options) => {
    const {from, to, count, index} = options;
    const {source} = this.props;
    const {count: stateCount} = this.state;
    let {thumbnails} = this.state;
    const timeBounds = !from || !to ? this.state.timeBounds : [from, to];
    let thumbnailSet = await generateThumbnailSet({
      source,
      timeBounds,
      size: count ? count : stateCount,
      index,
    });
    if (index) {
      thumbnails[index] = thumbnailSet;
    } else {
      thumbnails = thumbnailSet;
    }
    this.failedThumbs = false;
    this?.setState({
      thumbnails,
      loadedThumbs: 0,
      timeBounds,
    });
    return thumbnails;
  };

  thumbnail(response) {
    const {count} = this.state;
    const {seekbar, style} = this.props;
    const {item, index} = response;
    const {path} = item;
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
            if (!this.failedThumbs) {
              this.failedThumbs = true;
              this.fetchThumbnails({});
            }
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
    opacity: 0.85,
  },
});
