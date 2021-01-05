import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {Row} from 'react-native-easy-grid';
import {connect} from 'react-redux';
import {string} from 'prop-types';

import {navigate} from '../../../../../NavigationService';
import ButtonColor from '../../../layout/Views/Button';
import AllIcons from '../../../layout/icons/AllIcons';
import {
  clubSelector,
  isClubOwnerSelector,
} from '../../../../store/selectors/clubs';
import {inviteUsersToClub} from '../../../functions/clubs';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';

class OptionsRow extends Component {
  static propTypes = {
    currentClubID: string,
  };
  static defaultProps = {};
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
  book = () => {
    const {currentClubID} = this.props;
    navigate('Club', {
      screen: 'BookService',
      params: {id: currentClubID},
    });
  };
  buttonConfiguration = () => {
    const {isClubOwner, currentClub} = this.props;
    return isClubOwner
      ? [
          {
            icon: {
              name: 'user-plus',
            },
            onPress: this.inviteUsersToClub,
          },
          {
            icon: {
              name: 'cog',
            },
            onPress: this.goToSettings,
          },
          {
            icon: {
              name: 'plus',
            },
            color: colors.blue,
            onPressColor: colors.blueLight,
            onPress: this.createPost,
          },
        ]
      : [
          {
            icon: {
              name: 'user-friends',
            },
            onPress: this.goToSettings,
          },
          currentClub?.services
            ? {
                icon: {
                  name: 'store-alt',
                },
                color: colors.blue,
                onPressColor: colors.blueLight,
                onPress: this.book,
              }
            : undefined,
        ];
  };
  render() {
    const buttons = this.buttonConfiguration();
    return (
      <View style={styles.settingsRowContainer}>
        <Row style={styles.settingsRow}>
          {buttons.map((button) => {
            if (!button) return;
            const {icon, color, onPressColor, onPress} = button;
            return (
              <ButtonColor
                style={styles.settingsRowButton}
                click={onPress}
                color={color ?? colors.greyDark}
                onPressColor={onPressColor ?? colors.greyMidDark}>
                <AllIcons
                  type={icon.type ?? 'font'}
                  color={icon.color ?? colors.white}
                  size={icon.size ?? 16}
                  name={icon.name ?? 'user-plus'}
                  solid={icon.solid ?? true}
                />
              </ButtonColor>
            );
          })}
        </Row>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  settingsRowContainer: {
    height: 70,
    width: '100%',
    ...styleApp.center2,
  },
  settingsRow: {
    maxWidth: 240,
    minHeight: 55,
    ...styleApp.center,
    justifyContent: 'flex-start',
  },
  settingsRowButton: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginTop: -10,
    marginRight: 15,
    ...styleApp.shadowWeak,
  },
});

const mapStateToProps = (state, props) => {
  return {
    isClubOwner: isClubOwnerSelector(state, {id: props.currentClubID}),
    currentClub: clubSelector(state, {id: props.currentClubID}),
  };
};

export default connect(mapStateToProps)(OptionsRow);
