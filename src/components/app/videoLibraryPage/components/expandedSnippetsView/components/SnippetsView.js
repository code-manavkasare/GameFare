import React, {Component} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import {connect} from 'react-redux';
import MediaPicker from 'react-native-image-crop-picker';
import {includes} from 'ramda';
import StatusBar from '@react-native-community/status-bar';

import CardArchive from '../../../../coachFlow/StreamPage/components/StreamView/footer/components/CardArchive';
import ScrollView2 from '../../../../../layout/scrollViews/ScrollView2';

import sizes from '../../../../../style/sizes';
import styleApp from '../../../../../style/style';
import colors from '../../../../../style/colors';

const {height, width} = Dimensions.get('screen');

class SnippetsView extends Component {
  constructor(props) {
    super(props);
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  listVideos() {
    const {video} = this.props;
    if (!video) {
      return null;
    }
    const {snippets} = video;
    console.log('SnippetsView listVideos', video);
    if (!snippets) {
      throw 'Error: expandedSnippetsView, !snippets';
    }
    return (
      <View style={styleApp.marginView}>
        <Text style={[styleApp.title, {marginBottom: 10}]}>
          Full video
        </Text>
        {this.renderCardArchive(video)}
        <Text style={[styleApp.title, {marginTop: 10, marginBottom: 10}]}>Flags</Text>
        <FlatList
          data={Object.values(snippets)}
          renderItem={(snippet) => this.renderCardArchive(snippet.item)}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={{paddingBottom: 0}}
          showsVerticalScrollIndicator={true}
          initialNumToRender={10}
        />
      </View>
    );
  }
  renderCardArchive(video) {
    return (
      <CardArchive
        selectableMode={false}
        isSelected={false}
        selectVideo={() => null}
        style={styles.cardArchive}
        archive={video}
        key={video.id}
        noUpdateStatusBar={true}
      />
    );
  }
  render() {

    return (
      <View style={styleApp.stylePage}>
        <ScrollView2
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.listVideos()}
          keyboardAvoidDisable={true}
          marginBottomScrollView={sizes.heightFooter + sizes.marginBottomApp}
          marginTop={sizes.heightHeaderHome}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottom={0}
          colorRefresh={colors.title}
          refreshControl={false}
          offsetBottom={30}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cardArchive: {
    width: (width * 0.9) / 2 - 10,
    height: 150,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.title,
    margin: 5,
  },
});
const mapStateToProps = (state, props) => {
  return {
    video: state.localVideoLibrary.videoLibrary[props.id],
  };
};
export default connect(
  mapStateToProps,
  {},
)(SnippetsView);
