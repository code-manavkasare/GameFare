import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {bool, string, object} from 'prop-types';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';

import {bindClub} from '../../../database/firebase/bindings';
import {clubSelector} from '../../../../store/selectors/clubs';
import {boolShouldComponentUpdate} from '../../../functions/redux';
import AllIcon from '../../../layout/icons/AllIcons';
import {navigate} from '../../../../../NavigationService';

class CardClub extends Component {
  static propTypes = {
    navigation: object,
    id: string,
    addClub: bool,
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
  render() {
    const {club, addClub, selectClub} = this.props;
    if (addClub) return this.addClubCard();
    if (!club) return <View />;
    const {title, description} = club.info;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={selectClub}
        style={styleApp.cardClub}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{description}</Text>
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
});

const mapStateToProps = (state, props) => {
  return {
    club: clubSelector(state, props),
  };
};

export default connect(mapStateToProps)(CardClub);