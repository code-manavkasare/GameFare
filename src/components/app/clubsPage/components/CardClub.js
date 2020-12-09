import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {bool, string, object, func} from 'prop-types';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';

import {bindClub} from '../../../database/firebase/bindings';
import {clubSelector} from '../../../../store/selectors/clubs';
import {boolShouldComponentUpdate} from '../../../functions/redux';
import {userIDSelector} from '../../../../store/selectors/user';
import {acceptInvite, declineInvite} from '../../../functions/clubs';
import CardInvitation from './CardInvitation';

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
    if (displayAsInvitation) return this.invitationCard();
    if (!club) return <View />;
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
        <Text style={styles.title}>{title}</Text>
        <View style={selectionIndicationStyle} />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    ...styleApp.textBold,
    fontSize: 13,
    color: colors.greyLighter,
    textAlign: 'center',
  },
  subtitle: {
    ...styleApp.textBold,
    color: colors.greyMidDark,
    fontSize: 11,
    textAlign: 'center',
  },
  selectionIndication: {
    ...styleApp.fullSize,
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 5,
    borderColor: colors.primary,
  },
});

const mapStateToProps = (state, props) => {
  return {
    club: clubSelector(state, props),
    userID: userIDSelector(state),
  };
};

export default connect(mapStateToProps)(CardClub);
