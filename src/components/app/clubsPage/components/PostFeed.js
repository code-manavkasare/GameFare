import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {any, string} from 'prop-types';
import {Row} from 'react-native-easy-grid';

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
import {navigate} from '../../../../../NavigationService';
import ButtonColor from '../../../layout/Views/Button';
import AllIcons from '../../../layout/icons/AllIcons';
import {inviteUsersToClub} from '../../../functions/clubs';

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
  goToSettings = () => {
    const {currentClubID} = this.props;
    navigate('Club', {screen: 'ClubSettings', params: {id: currentClubID}});
  };
  inviteUsersToClub = () => {
    const {currentClubID} = this.props;
    inviteUsersToClub({clubID: currentClubID});
  };
  renderClub = ({item: {id: postID}}) => {
    const {currentClubID} = this.props;
    return <CardPost id={postID} clubID={currentClubID} />;
  };
  settingsRow = () => {
    const {isClubOwner} = this.props;
    if (!isClubOwner) return null;
    return (
      <View style={styles.settingsRowContainer}>
        <Row style={styles.settingsRow}>
          <ButtonColor
            view={() => {
              return (
                <AllIcons
                  type={'font'}
                  color={colors.white}
                  size={16}
                  name={'user-plus'}
                  solid
                />
              );
            }}
            style={styles.settingsRowButton}
            color={colors.greyDark}
            click={this.inviteUsersToClub}
            onPressColor={colors.greyMidDark}
          />
          <ButtonColor
            view={() => {
              return (
                <AllIcons
                  type={'font'}
                  color={colors.white}
                  size={16}
                  name={'cog'}
                />
              );
            }}
            style={styles.settingsRowButton}
            color={colors.greyDark}
            click={this.goToSettings}
            onPressColor={colors.greyMidDark}
          />
          <ButtonColor
            view={() => {
              return (
                <AllIcons
                  type={'font'}
                  color={colors.white}
                  size={16}
                  name={'plus'}
                  solid
                />
              );
            }}
            style={styles.settingsRowButton}
            color={colors.blue}
            click={this.createPost}
            onPressColor={colors.blueLight}
          />
        </Row>
      </View>
    );
  };
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
    marginBottom: 30,
    shadowOpacity: 0,
  },
  settingsRowContainer: {
    height: 70,
    width: '100%',
    ...styleApp.center2,
  },
  settingsRow: {
    width: '50%',
    maxWidth: 240,
    minHeight: 55,
    ...styleApp.center,
    justifyContent: 'space-between',
  },
  settingsRowButton: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginTop: -10,
    ...styleApp.shadowWeak,
  },
});

const mapStateToProps = (state, props) => {
  return {
    posts: postListSelector(state, {id: props.currentClubID}),
    isClubOwner: isClubOwnerSelector(state, {id: props.currentClubID}),
  };
};

export default connect(mapStateToProps)(PostFeed);
