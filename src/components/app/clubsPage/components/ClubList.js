import React, {Component} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {object, string, func} from 'prop-types';

import {navigate} from '../../../../../NavigationService';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import AllIcon from '../../../layout/icons/AllIcons';
import {FlatListComponent} from '../../../layout/Views/FlatList';
import {
  userClubInvitesSelector,
  userClubsSelector,
} from '../../../../store/selectors/clubs';
import CardClub from './CardClub';
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
    navigate('CreateClub');
  };
  openInvites = () => {
    navigate('ClubInvites');
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
    const {clubs, clubInvites} = this.props;
    const flatListStyle = {
      paddingHorizontal: '5%',
      width: clubs.length
        ? clubs.length * 150 + (clubInvites.length ? 100 : 0)
        : 0,
    };
    return (
      <FlatListComponent
        styleContainer={flatListStyle}
        horizontal
        showsHorizontalScrollIndicator={false}
        list={clubs}
        lengthList={clubs.length}
        cardList={this.renderClub}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        header={clubInvites.length > 0 ? this.renderInvites : null}
        headerStyle={styles.header}
        footer={this.renderAddClub}
        footerStyle={styleApp.fullSize}
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
  };
};

export default connect(mapStateToProps)(ClubList);
