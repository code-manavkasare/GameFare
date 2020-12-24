import React, {Component} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {object, string, func} from 'prop-types';

import {goBack, navigate} from '../../../../../../../NavigationService';
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
import {
  acceptInvite,
  generateClubDiscoveryList,
} from '../../../../../functions/clubs';
import {Col, Row} from 'react-native-easy-grid';
// import GuidedInteraction from '../../../../../utility/initialInteractions/GuidedInteraction';
class ClubList extends Component {
  static propTypes = {
    clubs: object,
    selectClub: func,
    selectedClubID: string,
  };
  static defaultProps = {};
  componentDidMount() {
    this.autoSelect(true);
  }
  componentDidUpdate() {
    this.autoSelect(true);
  }
  static getDerivedStateFromProps(props) {
    const {clubs, isConnected} = props;
    return {
      clubs: isConnected ? clubs : [{id: 'clubGameFare'}],
    };
  }
  autoSelect(ignoreAnimation) {
    const {clubs} = this.state;
    const {selectClub, selectedClubID} = this.props;
    if (selectedClubID || !clubs || clubs.length === 0) return;
    selectClub(clubs[0]?.id, ignoreAnimation);
  }
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
  searchClubs = () => {
    navigate('SearchPage', {
      searchFor: 'clubs',
      action: 'joinClub',
      selectOne: true,
      defaultHeader: 'Discover Clubs',
      defaultList: generateClubDiscoveryList,
      onConfirm: ({results}) => {
        goBack();
        if (!results) return;
        const clubID = Object.keys(results)[0];
        acceptInvite({clubID});
      },
    });
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
      borderRadius: 0,
      backgroundColor: 'transparent',
      width: 100,
    };
    return (
      <Row style={addClubContainerStyle}>
        <Col size={50} style={styleApp.center}>
          {/* <GuidedInteraction
            text={'Tap to find a club!'}
            type={'overlay'}
            interaction={'clubSearch'}
            onPress={this.searchClubs}> */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={this.searchClubs}
            style={styles.footerButton}>
            <Row style={styleApp.center}>
              <AllIcon
                name={'search'}
                size={17}
                color={styles.footerText.color}
                type="font"
                solid
              />
            </Row>
          </TouchableOpacity>
          {/* </GuidedInteraction> */}
        </Col>
        <Col size={50} style={styleApp.center}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={this.addClub}
            style={styles.footerButton}>
            <Row style={styleApp.center}>
              <AllIcon
                name={'plus'}
                size={17}
                color={styles.footerText.color}
                type="font"
                solid
              />
            </Row>
          </TouchableOpacity>
        </Col>
      </Row>
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
    const {clubs} = this.state;
    let {clubInvites, userConnected} = this.props;
    const cardWidth =
      styleApp.cardClubSmall.width + styleApp.cardClubSmall.marginRight;
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
  footerButton: {
    height: '50%',
    width: '85%',
    borderRadius: 15,
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    marginHorizontal: 0,
  },
  footerText: {
    ...styleApp.textBold,
    fontSize: 12,
    color: colors.greyDark,
    marginLeft: 7,
    marginTop: 1,
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
