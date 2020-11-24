import React, {Component} from 'react';
import {View, Animated} from 'react-native';
import {connect} from 'react-redux';

import colors from '../../../style/colors';
import Loader from '../../../layout/loaders/Loader';
import {ge10tLastVideo} from '../../../functions/pictures';
import styleApp from '../../../style/style';

import {FlatListComponent} from '../../../layout/Views/FlatList';
import CardArchive from '../../coachFlow/GroupsPage/components/StreamView/footer/components/CardArchive';

class ListIOSLibrary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videos: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    const videos = await ge10tLastVideo();
    this.setState({videos});
  }
  render() {
    const {selectVideo, selectedLocalVideos} = this.props;
    const {videos} = this.state;
    if (!videos) {
      return (
        <View
          style={{
            height: 150,
            width: '100%',
            marginBottom: 30,
            ...styleApp.center4,
          }}>
          <Loader size={40} color={colors.primary} />
        </View>
      );
    }
    return (
      <FlatListComponent
        list={videos}
        cardList={({item}) => {
          const isSelected =
            selectedLocalVideos.filter((video) => video === item.id).length !==
            0;
          return (
            <CardArchive
              id={item.id}
              style={{...styleApp.cardArchive, width: 100}}
              key={item.id}
              selectableMode={false}
              selectVideo={selectVideo}
              isSelected={isSelected}
              local={true}
              nativeArchive={item}
            />
          );
        }}
        numColumns={1}
        horizontal={true}
        incrementRendering={4}
        initialNumberToRender={8}
        hideDividerHeader={true}
      />
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(
  mapStateToProps,
  {},
)(ListIOSLibrary);
