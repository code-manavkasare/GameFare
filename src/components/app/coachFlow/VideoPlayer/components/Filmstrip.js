import React, {Component} from 'react';
import {View, StyleSheet, Animated, FlatList, Image} from 'react-native';
import {isEqual} from 'lodash';
import styleApp from '../../../../style/style';
import {generateThumbnailSet} from '../../../../functions/videoManagement';
import {getArchiveByID} from '../../../../functions/archive';

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
      // const thumbnails = await this.fetchThumbnails({});
      // store.dispatch(
      //   setArchive({
      //     ...archive,
      //     initialSeekbarThumbnails: thumbnails,
      //   }),
      // );
    }
  };

  async componentDidUpdate(prevProps, prevState) {
    // const {onFilmstripLoad, source} = this.props;
    // const {loadedThumbs, count, thumbnails} = this.state;
    // const {source: prevSource} = prevProps;
    // if (onFilmstripLoad && loadedThumbs === count) {
    //   Animated.timing(this.opacity, timing(1, 150)).start();
    //   onFilmstripLoad();
    //   const {archiveId} = this.props;
    //   let archive = await getArchiveByID(archiveId);
    //   store.dispatch(
    //     setArchive({
    //       ...archive,
    //       initialSeekbarThumbnails: thumbnails,
    //     }),
    //   );
    // } else if (source !== prevSource) {
    //   const {archiveId} = this.props;
    //   // let archive = await getArchiveByID(archiveId);
    //   if (!archive.initialSeekbarThumbnails) {
    //     // const thumbnails = await this.fetchThumbnails({});
    //     // store.dispatch(
    //     //   setArchive({
    //     //     ...archive,
    //     //     initialSeekbarThumbnails: thumbnails,
    //     //   }),
    //     // );
    //   }
    // }
  }

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
      let nextState = {
        thumbnails,
        timeBounds,
      };
      if (index === undefined) {
        nextState = {
          ...nextState,
          loadedThumbs: 0,
        };
      }
      this?.setState(nextState);
      return thumbnails;
    }
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
    const opacity = this.opacity;
    return (
      <Animated.View style={{opacity, width}}>
        {/* <Image
          source={{uri: path}}
          style={styles.thumbnail}
          onError={(e) => {
            this.fetchThumbnails({index});
          }}
          onLoad={(res) => {
            const {loadedThumbs} = this.state;
            this.setState({
              loadedThumbs: loadedThumbs + 1,
            });
          }}
        /> */}
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
