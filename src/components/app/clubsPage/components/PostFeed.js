import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {any, string} from 'prop-types';

import styleApp from '../../../style/style';
import {
  postListSelector,
  isClubOwnerSelector,
} from '../../../../store/selectors/clubs';
import {FlatListComponent} from '../../../layout/Views/FlatList';
import CardPost from './CardPost';
import colors from '../../../style/colors';
import {
  heightFooter,
  heightHeaderHome,
  marginBottomApp,
  marginTopApp,
} from '../../../style/sizes';
import Button from '../../../layout/buttons/Button';
import {navigate} from '../../../../../NavigationService';

class PostFeed extends Component {
  static propTypes = {
    currentClubID: string,
    AnimatedScrollValue: any,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  componentDidUpdate(prevProps) {
    const {currentClubID} = this.props;
    const {currentClubID: prevClubID} = prevProps;
    if (currentClubID !== prevClubID) {
      this.flatListRef?.jumpToTop();
    }
  }
  createPost = () => {
    const {currentClubID} = this.props;
    navigate('CreatePost', {clubID: currentClubID});
  };
  renderClub = ({item: {id: postID}}) => <CardPost id={postID} />;
  renderAddPost = () => (
    <Button
      backgroundColor="primary"
      styleButton={styles.postButton}
      textButton={{
        fontSize: 15,
        color: colors.white,
      }}
      click={this.createPost}
      icon={{
        name: 'plus',
        size: 15,
        type: 'font',
        color: colors.white,
      }}
      onPressColor={colors.primaryLight}
      enabled={true}
      text="Post to your club"
    />
  );
  emptyList = () => {
    const {isClubOwner} = this.props;
    let config = {
      textButton: 'Post to your club',
      iconButton: 'plus',
    };
    if (isClubOwner) {
      config = {...config, clickButton: this.createPost};
    } else {
      config = {
        ...config,
        text: "The club owner hasn't posted anything",
        image: require('../../../../img/images/target.png'),
      };
    }
    return config;
  };
  render() {
    const {posts, AnimatedScrollValue} = this.props;
    if (!posts) return null;
    return (
      <FlatListComponent
        onRef={(ref) => (this.flatListRef = ref)}
        reanimated
        AnimatedHeaderValue={AnimatedScrollValue}
        styleContainer={{
          paddingTop: marginTopApp + heightHeaderHome + 60,
          paddingBottom: heightFooter + marginBottomApp + 160,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={this.emptyList()}
        list={posts}
        lengthList={posts.length}
        cardList={this.renderClub}
        keyExtractor={(item, index) => item.id}
        header={posts.length > 0 ? this.renderAddPost : null}
        headerStyle={styleApp.center}
        scrollEnabled={posts.length > 0}
      />
    );
  }
}

const styles = StyleSheet.create({
  postButton: {
    width: '100%',
    borderBottomWidth: 0,
    borderColor: colors.off,
    borderRadius: 15,
    height: 40,
    marginBottom: 20,
    shadowOpacity: 0,
  },
});

const mapStateToProps = (state, props) => {
  return {
    posts: postListSelector(state, {id: props.currentClubID}),
    isClubOwner: isClubOwnerSelector(state, {id: props.currentClubID}),
  };
};

export default connect(mapStateToProps)(PostFeed);
