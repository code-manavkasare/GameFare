import React, {Component} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import MediaPicker from 'react-native-image-crop-picker';
import {includes} from 'ramda';

import CardArchive from '../../../coachFlow/StreamPage/components/StreamView/footer/components/CardArchive';

import {navigate} from '../../../../../../NavigationService';
import Button from '../../../../layout/buttons/Button';

import {sortVideos} from '../../../../functions/pictures';
import {
  addVideo,
  recordVideo,
  removeVideo,
} from '../../../../functions/videoManagement';
import sizes from '../../../../style/sizes';
import styleApp from '../../../../style/style';
import colors from '../../../../style/colors';
import HeaderVideoLibrary from './components/HeaderLocalVideoLibrary';
const {height, width} = Dimensions.get('screen');

class VideoLibraryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videosArray: [],
      loader: false,
      uploadingVideosArray: [],
      selectableMode: false,
      selectedVideos: [],
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  static getDerivedStateFromProps = (props) => {
    const videosArray = sortVideos(props.videoLibrary);
    return {videosArray};
  };

  deleteVideos = () => {
    const {selectedVideos} = this.state;
    const numberVideos = selectedVideos.length;
    if (numberVideos !== 0) {
      navigate('Alert', {
        title: `Are you sure you want to delete this video? This action cannot be undone.`,
        textButton: `Delete (${numberVideos})`,
        onGoBack: async () => {
          true;
        },
      });
    }
    this.setState({selectedVideos: [], selectableMode: false});
  };

  listVideos() {
    const {uploadingVideosArray, videosArray} = this.state;
    const isListEmpty =
      videosArray.length === 0 && uploadingVideosArray.length === 0;
    if (isListEmpty) return null;
    return (
      <View style={[styleApp.marginView, {marginBottom: 30}]}>
        <Text style={[styleApp.title, {marginBottom: 10}]}>
          Waiting for upload {!isListEmpty && `(${videosArray.length})`}
        </Text>
        {/* 
        {__DEV__ && (
          <Button
            text={'Add video'}
            icon={{
              name: 'plus',
              size: 22,
              type: 'font',
              color: colors.white,
            }}
            backgroundColor={'green'}
            onPressColor={colors.greenLight}
            click={() =>
              addVideo({
                startTimestamp: Date.now(),
                local: true,
                id: 'sdfsdfsdf',
                size: {
                  width: 1080,
                  height: 1920,
                },
                durationSeconds: 40.55,
                url:
                  'https://firebasestorage.googleapis.com/v0/b/gamefare-dev-cfc88.appspot.com/o/archivedStreams%2F12161302-A030-4653-97AB-03FD6971DCA4%2Farchive.mp4?alt=media&token=b33c8435-240b-47b4-8aec-912756e2b12b',
                thumbnail:
                  'https://i.ytimg.com/vi/0O1FRbwbgnQ/maxresdefault.jpg',
              })
            }
          />
        )} */}

        <View style={{height: 10}} />

        {!isListEmpty && (
          <FlatList
            data={videosArray}
            renderItem={this.renderCardArchive}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
          />
        )}
      </View>
    );
  }

  openVideoWithSnippets(id) {
    navigate('ExpandedSnippetsView', {id});
  }

  renderCardArchive = (video) => {
    const {selectableMode, selectedVideos} = this.state;
    const {id, snippets} = video.item;
    const isSelected = includes(id, selectedVideos);
    // return (
    //   <View style={styles.cardArchive} key={video.item.id}>
    //     <Text style={{color: 'white'}}>{video.item.id}</Text>
    //     <TouchableOpacity onPress={() => removeVideo(video.item.id)}>
    //       <Text style={{color: 'white', marginTop: 10}}>Remove</Text>
    //     </TouchableOpacity>
    //   </View>
    // );
    if (snippets && Object.values(snippets).length > 0) {
      return (
        <CardArchive
          selectableMode={selectableMode}
          isSelected={isSelected}
          style={styles.cardArchive}
          archive={video.item}
          key={video.item.id}
          noUpdateStatusBar={true}
          openVideo={(id) => this.openVideoWithSnippets(id)}
        />
      );
    } else {
      return (
        <CardArchive
          selectableMode={selectableMode}
          isSelected={isSelected}
          style={styles.cardArchive}
          archive={video.item}
          key={video.item.id}
          noUpdateStatusBar={true}
        />
      );
    }

  };

  render() {
    const {
      selectableMode,
      videosArray,
      uploadingVideosArray,
      loader,
      selectedVideos,
    } = this.state;
    const isListEmpty =
      videosArray.length === 0 && uploadingVideosArray.length === 0;

    return <View>{this.listVideos()}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardArchive: {
    width: (width * 0.9) / 2 - 10,
    height: 150,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.title,
    margin: 5,
  },
});

const mapStateToProps = (state) => {
  return {
    videoLibrary: state.localVideoLibrary.videoLibrary,
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
  };
};

export default connect(mapStateToProps)(VideoLibraryPage);
