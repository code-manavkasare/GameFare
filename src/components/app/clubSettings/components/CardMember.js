import React, {Component} from 'react';
import {View} from 'react-native';
import {string, bool} from 'prop-types';

import colors from '../../../style/colors';
import {navigate} from '../../../../../NavigationService';

import {removeUserFromClub} from '../../../functions/clubs';
import CardUser from '../../../layout/cards/CardUser';

export default class CardMember extends Component {
  static propTypes = {
    id: string,
    clubID: string,
    allowRemoval: bool,
    clubOwner: bool,
  };
  static defaultProps = {};
  removeMember = async () => {
    const {id, clubID} = this.props;
    navigate('Alert', {
      title: 'Are you sure you want to remove this member?',
      textButton: 'Remove',
      colorButton: 'red',
      onPressColor: colors.red,
      onGoBack: async () => removeUserFromClub({clubID, userID: id}),
    });
  };
  render() {
    const {id, allowRemoval, clubOwner} = this.props;
    return (
      <View>
        <CardUser
          id={id}
          icon={
            allowRemoval &&
            !clubOwner && {name: 'times', color: colors.greyDarker}
          }
          onPress={allowRemoval && !clubOwner && this.removeMember}
        />
      </View>
    );
  }
}
