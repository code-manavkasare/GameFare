import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {Row} from 'react-native-easy-grid';
import {connect} from 'react-redux';
import {string} from 'prop-types';

import {navigate} from '../../../../../NavigationService';
import ButtonColor from '../../../layout/Views/Button';
import AllIcons from '../../../layout/icons/AllIcons';
import {isClubOwnerSelector} from '../../../../store/selectors/clubs';
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
  render() {
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
  }
}

const styles = StyleSheet.create({
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
    isClubOwner: isClubOwnerSelector(state, {id: props.currentClubID}),
  };
};

export default connect(mapStateToProps)(OptionsRow);
