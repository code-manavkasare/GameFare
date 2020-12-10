import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {bool, string, object, func} from 'prop-types';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';

import {bindClub} from '../../../database/firebase/bindings';
import {clubSelector} from '../../../../store/selectors/clubs';
import {boolShouldComponentUpdate} from '../../../functions/redux';
import {acceptInvite, declineInvite} from '../../../functions/clubs';
import CardInvitation from './CardInvitation';
import CardUser from '../../../layout/cards/CardUser';
import {FormatDate} from '../../../functions/date';

class CardClub extends Component {
  static propTypes = {
    navigation: object,
    id: string,
    selectClub: func,
    selectedClubID: string,
    displayAsInvitation: bool,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount = () => {
    const {id} = this.props;
    id && bindClub(id);
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
  declineInvite = () => {
    const {id} = this.props;
    declineInvite({clubID: id});
  };
  acceptInvite = () => {
    const {id} = this.props;
    acceptInvite({clubID: id});
  };
  profilePicture() {
    const {club} = this.props;
    const {owner} = club;
    return (
      <View style={styles.profileImg}>
        <CardUser
          id={owner}
          imgOnly
          hideProfileInitials
          styleImg={styleApp.fullSize}
        />
      </View>
    );
  }
  dateDisplay() {
    const {club} = this.props;
    const {timestamp} = club;
    if (!timestamp) return null;
    return (
      <Text style={styles.dateText}>
        <FormatDate date={timestamp} />
      </Text>
    );
  }
  invitationCard() {
    const {club} = this.props;
    const {info, owner} = club;
    const {title, description} = info;
    return (
      <CardInvitation
        user={{userID: owner, prefix: 'Invite from '}}
        title={title}
        description={description}
        buttonNo={{action: this.declineInvite}}
        buttonYes={{action: this.acceptInvite}}
      />
    );
  }
  render() {
    const {club, selectClub, selectedClubID, displayAsInvitation} = this.props;
    if (!club) return <View />;
    if (displayAsInvitation) return this.invitationCard();
    const {info} = club;
    const {title} = info;
    const isSelected = selectedClubID === club?.id;
    const selectionIndicationStyle = isSelected
      ? styles.selectionIndication
      : undefined;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={selectClub}
        style={styleApp.cardClubSmall}>
        {this.profilePicture()}
        <Text style={styles.title}>{title}</Text>
        <View style={selectionIndicationStyle} />
        {this.dateDisplay()}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    ...styleApp.textBold,
    // ...styleApp.shadow,
    fontSize: 13,
    color: colors.greyLighter,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 0, height: 0},
    // textShadowOpacity: 0.5,
    textShadowRadius: 7,
    overflow: 'visible',
  },
  subtitle: {
    ...styleApp.textBold,
    color: colors.greyMidDark,
    fontSize: 11,
    textAlign: 'center',
  },
  dateText: {
    ...styleApp.textBold,
    fontSize: 12,
    color: colors.greyDark,
    position: 'absolute',
    bottom: -23,
  },
  selectionIndication: {
    ...styleApp.fullSize,
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 5,
    borderColor: colors.primary,
  },
  profileImg: {
    position: 'absolute',
    zIndex: -1,
    opacity: 0.5,
    ...styleApp.fullSize,
    backgroundColor: colors.greyDark,
    borderRadius: 200,
    overflow: 'hidden',
  },
});

const mapStateToProps = (state, props) => {
  return {
    club: clubSelector(state, props),
  };
};

export default connect(mapStateToProps)(CardClub);
