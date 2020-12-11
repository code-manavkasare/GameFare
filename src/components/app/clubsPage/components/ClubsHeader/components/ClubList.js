import React, {Component} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {object, string, func} from 'prop-types';

import {navigate} from '../../../../../../../NavigationService';
import styleApp from '../../../../../style/style';
import colors from '../../../../../style/colors';
import AllIcon from '../../../../../layout/icons/AllIcons';
import {FlatListComponent} from '../../../../../layout/Views/FlatList';
import {
  userClubInvitesSelector,
  userClubsSelector,
} from '../../../../../../store/selectors/clubs';
import CardClub from '../../CardClub';
import {width} from '../../../../../style/sizes';
import {userConnectedSelector} from '../../../../../../store/selectors/user';
class ClubList extends Component {
  static propTypes = {
    clubs: object,
    selectClub: func,
    selectedClubID: string,
  };
  static defaultProps = {};

  selectClub = (clubID) => {
    const {selectClub} = this.props;
    return selectClub(clubID);
  };
  renderClub = ({item: {id: clubID}}) => {
    const {selectedClubID} = this.props;
    return (
      <CardClub
        id={clubID}
        selectClub={() => this.selectClub(clubID)}
        selectedClubID={selectedClubID}
      />
    );
  };
  addClub = () => {
    navigate('ClubForm');
  };
  openInvites = () => {
    navigate('ClubInvites');
  };
  signIn = () => {
    navigate('SignIn');
  };
  renderSignedOut = () => {
    const addClubContainerStyle = {
      ...styleApp.cardClubSmall,
      backgroundColor: colors.greyDark,
    };
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={this.signIn}
        style={addClubContainerStyle}>
        <AllIcon
          name={'user-plus'}
          size={21}
          color={styles.addClubSubtitle.color}
          type="font"
          solid
        />
        <Text style={styles.addClubSubtitle}>Sign In</Text>
      </TouchableOpacity>
    );
  };
  renderAddClub = () => {
    const addClubContainerStyle = {
      ...styleApp.cardClubSmall,
      backgroundColor: colors.greyDark,
    };
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={this.addClub}
        style={addClubContainerStyle}>
        <AllIcon
          name={'plus'}
          size={21}
          color={styles.addClubSubtitle.color}
          type="font"
          solid
        />
        <Text style={styles.addClubSubtitle}>Create a Club</Text>
      </TouchableOpacity>
    );
  };
  renderInvites = () => {
    const invitesContainerStyle = {
      ...styleApp.cardClubSmall,
      backgroundColor: colors.greyDark,
    };
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={this.openInvites}
        style={invitesContainerStyle}>
        <AllIcon
          name={'user-friends'}
          size={21}
          color={styles.addClubSubtitle.color}
          type="font"
          solid
        />
        <Text style={styles.addClubSubtitle}>Club Invites</Text>
        <View style={styles.badge} />
      </TouchableOpacity>
    );
  };
  render() {
    let {clubs, clubInvites, userConnected} = this.props;
    const cardWidth =
      styleApp.cardClubSmall.width + styleApp.cardClubSmall.marginRight;
    console.log;
    const flatListStyle = {
      paddingHorizontal: '5%',
      width:
        clubs.length * cardWidth +
        0.05 * width +
        styleApp.cardClubSmall.marginRight +
        (clubInvites.length && clubs.length
          ? cardWidth * 2
          : clubInvites.length
          ? 10
          : clubs.length
          ? cardWidth
          : 0),
    };
    return (
      <FlatListComponent
        styleContainer={flatListStyle}
        horizontal
        showsHorizontalScrollIndicator={false}
        list={clubs}
        lengthList={clubs.length}
        cardList={this.renderClub}
        keyExtractor={(item) => item.id}
        header={clubInvites.length > 0 ? this.renderInvites : null}
        headerStyle={styles.header}
        footer={!userConnected ? this.renderSignedOut : this.renderAddClub}
        footerStyle={styleApp.fullSize}
        noLazy
      />
    );
  }
}

const styles = StyleSheet.create({
  header: {
    ...styleApp.center,
    height: 90,
  },
  addClubContainer: {
    ...styleApp.cardClubSmall,
    backgroundColor: colors.greyDark,
  },
  addClubSubtitle: {
    ...styleApp.textBold,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
    color: colors.greyLighter,
  },
  badge: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 15,
    backgroundColor: colors.primary,
    top: 3,
    right: 3,
  },
});

const mapStateToProps = (state) => {
  return {
    clubs: userClubsSelector(state),
    clubInvites: userClubInvitesSelector(state),
    userConnected: userConnectedSelector(state),
  };
};

export default connect(mapStateToProps)(ClubList);
