import React, {Component} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {connect} from 'react-redux';

import colors from '../../../../../style/colors';
import styleApp from '../../../../../style/style';
import {numBookingNotificationsSelector} from '../../../../../../store/selectors/user';

class BadgeHandler extends Component {
  render() {
    const {numNotifications} = this.props;
    if (!numNotifications) return null;
    return (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{numNotifications}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  badge: {...styleApp.viewBadge, marginLeft: 30},
  badgeText: {...styleApp.textBold, color: colors.white, fontSize: 10},
});

const mapStateToProps = (state) => {
  return {
    numNotifications: numBookingNotificationsSelector(state),
  };
};

export default connect(mapStateToProps)(BadgeHandler);
