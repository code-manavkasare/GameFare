import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {string} from 'prop-types';

import {navigate} from '../../../../../NavigationService';
import Button from '../../../layout/buttons/Button';
import {
  clubSelector,
  isClubOwnerSelector,
} from '../../../../store/selectors/clubs';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';

class ButtonBook extends Component {
  static propTypes = {
    currentClubID: string,
  };
  static defaultProps = {};
  book = () => {
    const {currentClubID} = this.props;
    navigate('Club', {
      screen: 'BookService',
      params: {id: currentClubID},
    });
  };
  render() {
    const {isClubOwner, currentClub} = this.props;
    if (isClubOwner) return null;
    if (!currentClub?.services) return null;
    return (
      <View style={styles.container}>
        <Button
          backgroundColor="primary"
          onPressColor={colors.primaryLight}
          enabled={true}
          text={'Book'}
          styleButton={styles.button}
          icon={{
            name: 'store-alt',
            size: 20,
            type: 'font',
            color: colors.white,
          }}
          click={this.book}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...styleApp.footerBook,
    ...styleApp.marginView,
    height: 55,
  },
  button: {
    ...styleApp.shade,
    height: 45,
  },
});

const mapStateToProps = (state, props) => {
  return {
    isClubOwner: isClubOwnerSelector(state, {id: props.currentClubID}),
    currentClub: clubSelector(state, {id: props.currentClubID}),
  };
};

export default connect(mapStateToProps)(ButtonBook);
