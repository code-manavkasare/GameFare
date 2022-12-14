import React, {Component} from 'react';
import {connect} from 'react-redux';
import {any, string} from 'prop-types';

import {navigate} from '../../../../../NavigationService';
import {FlatListComponent} from '../../../layout/Views/FlatList';
import CardPost from './CardPost';
import OptionsRow from './OptionsRow';
import {
  postListSelector,
  isClubOwnerSelector,
} from '../../../../store/selectors/clubs';
import {userConnectedSelector} from '../../../../store/selectors/user';
import styleApp from '../../../style/style';
import {
  heightFooter,
  heightHeaderHome,
  marginBottomApp,
  marginTopApp,
} from '../../../style/sizes';

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
  renderClub = ({item: {id: postID}}) => {
    const {currentClubID} = this.props;
    return <CardPost id={postID} clubID={currentClubID} />;
  };
  settingsRow = () => {
    const {currentClubID, userConnected} = this.props;
    if (!userConnected) return null;
    return <OptionsRow currentClubID={currentClubID} />;
  };
  emptyList = () => {
    const {isClubOwner} = this.props;
    let config = {
      textButton: 'Post to your club',
      iconButton: 'plus',
    };
    if (isClubOwner) {
      config = {
        ...config,
        clickButton: this.createPost,
        text: "You haven't posted anything yet",
        image: require('../../../../img/images/target.png'),
      };
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
          paddingTop: marginTopApp + heightHeaderHome + 35,
          paddingBottom: heightFooter + marginBottomApp + 90,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={this.emptyList()}
        list={posts}
        lengthList={posts.length}
        cardList={this.renderClub}
        keyExtractor={(item, index) => item.id}
        header={this.settingsRow}
        headerStyle={styleApp.marginView}
        scrollEnabled={posts.length > 0}
      />
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    posts: postListSelector(state, {id: props.currentClubID}),
    isClubOwner: isClubOwnerSelector(state, {id: props.currentClubID}),
    userConnected: userConnectedSelector(state),
  };
};

export default connect(mapStateToProps)(PostFeed);
