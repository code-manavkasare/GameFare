import React, {Component} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {connect} from 'react-redux';

import colors from '../../../../../style/colors';
import styleApp from '../../../../../style/style';
import {numFilteredNotificationsSelector} from '../../../../../../store/selectors/user';

class BookingsBadge extends Component {
  render() {
    const {numNotifications} = this.props;
    return numNotifications ? (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{numNotifications}</Text>
      </View>
    ) : null;
  }
}

const styles = StyleSheet.create({
  badge: {...styleApp.viewBadge, marginLeft: 30},
  badgeText: {...styleApp.textBold, color: colors.white, fontSize: 10},
});

const mapStateToProps = (state) => {
  return {
    numNotifications: numFilteredNotificationsSelector(state, {
      filterType: 'bookings',
    }),
  };
};

export default connect(mapStateToProps)(BookingsBadge);
