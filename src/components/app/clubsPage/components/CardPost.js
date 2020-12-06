import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {string, func} from 'prop-types';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';

import {bindPost} from '../../../database/firebase/bindings';
import {postSelector} from '../../../../store/selectors/posts';
import {isClubOwnerSelector} from '../../../../store/selectors/clubs';
import {removePost} from '../../../functions/clubs';
import {boolShouldComponentUpdate} from '../../../functions/redux';
import ButtonColor from '../../../layout/Views/Button';
import AllIcon from '../../../layout/icons/AllIcons';
import CardArchive from '../../coachFlow/GroupsPage/components/StreamView/footer/components/CardArchive';
import CardUser from '../../../layout/cards/CardUser';
import {FormatDate} from '../../../functions/date';
import {navigate} from '../../../../../NavigationService';

class CardClub extends Component {
  static propTypes = {
    id: string,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount = () => {
    const {id} = this.props;
    id && bindPost(id);
  };
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'CardClub',
    });
  }
  openPostOptions = () => {
    const {post, clubID} = this.props;
    const {id: postID} = post;
    return navigate('Alert', {
      textButton: 'Delete',
      colorButton: 'red',
      onPressColor: 'red',
      onGoBack: () => removePost({clubID, postID}),
      title: 'Are you sure you want to delete this post?',
    });
  };
  optionsButton = () => {
    const {isClubOwner} = this.props;
    if (!isClubOwner) return null;
    return (
      <View style={styles.settingsButtonContainer}>
        <ButtonColor
          style={styles.settingsButton}
          click={this.openPostOptions}
          color={'transparent'}
          onPressColor={'transparent'}>
          <AllIcon
            name={'ellipsis-h'}
            size={15}
            color={colors.greyDark}
            type="font"
            solid
          />
        </ButtonColor>
      </View>
    );
  };
  captionView = () => {
    const {post} = this.props;
    const {text, timestamp} = post;
    return (
      <View style={styles.captionView}>
        {text ? <Text style={styles.caption}>{text}</Text> : null}
        <Text style={styles.date}>
          <FormatDate date={timestamp} />
        </Text>
      </View>
    );
  };
  render() {
    const {post} = this.props;
    if (!post) return null;
    const {video, userID} = post;
    return (
      <View style={styleApp.cardPost}>
        {this.optionsButton()}
        <CardUser
          id={userID}
          style={styles.cardUser}
          styleText={styleApp.textBold}
        />
        <CardArchive
          style={styleApp.fullCardArchive}
          id={video}
          noUpdateStatusBar={true}
          hideInformation
        />
        {this.captionView()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cardUser: {...styleApp.marginView},
  captionView: {...styleApp.marginView, marginTop: 15},
  caption: {...styleApp.text},
  date: {
    ...styleApp.textBold,
    marginTop: 5,
    fontSize: 14,
    color: colors.greyDark,
  },
  settingsButtonContainer: {
    height: 65,
    position: 'absolute',
    zIndex: 1,
    right: '5%',
    ...styleApp.center2,
  },
  settingsButton: {
    height: 30,
    width: 30,
    borderRadius: 15,
  },
});

const mapStateToProps = (state, props) => {
  return {
    post: postSelector(state, props),
    isClubOwner: isClubOwnerSelector(state, {id: props.clubID}),
  };
};

export default connect(mapStateToProps)(CardClub);
