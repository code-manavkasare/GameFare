import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {bool, string, object, func} from 'prop-types';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {navigate} from '../../../../../NavigationService';

import {bindClub} from '../../../database/firebase/bindings';
import {clubSelector} from '../../../../store/selectors/clubs';
import {boolShouldComponentUpdate} from '../../../functions/redux';
import {userIDSelector} from '../../../../store/selectors/user';
import ButtonColor from '../../../layout/Views/Button';
import AllIcon from '../../../layout/icons/AllIcons';

class CardClub extends Component {
  static propTypes = {
    navigation: object,
    id: string,
    addClub: bool,
    selectClub: func,
    selectedClubID: string,
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
  addClub = () => {
    navigate('CreateClub');
  };
  goToSettings = () => {
    const {club} = this.props;
    const {id} = club;
    navigate('Club', {screen: 'ClubSettings', params: {id}});
  };
  addClubCard = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={this.addClub}
        style={styles.addClubContainer}>
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
  settingsButton = () => {
    const {club, userID} = this.props;
    const {owner} = club;
    if (owner !== userID) return;
    return (
      <ButtonColor
        style={styles.settingsButton}
        click={this.goToSettings}
        color={colors.greyLight}
        onPressColor={colors.greyLighter}>
        <AllIcon
          name={'ellipsis-h'}
          size={14}
          color={colors.greyDarker}
          type="font"
          solid
        />
      </ButtonColor>
    );
  };
  render() {
    const {club, addClub, selectClub, selectedClubID} = this.props;
    if (addClub) return this.addClubCard();
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
        style={styleApp.cardClub}>
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
  addClubContainer: {
    ...styleApp.cardClub,
    backgroundColor: colors.greyDark,
  },
  addClubSubtitle: {
    ...styleApp.textBold,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
    color: colors.greyLighter,
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
