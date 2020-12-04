import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {bool, string, object} from 'prop-types';
import {Col, Row} from 'react-native-easy-grid';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {navigate} from '../../../../../NavigationService';

import {
  bindBooking,
  bindService,
  unbindBooking,
  unbindService,
} from '../../../database/firebase/bindings';
import {boolShouldComponentUpdate} from '../../../functions/redux';
import {userIDSelector} from '../../../../store/selectors/user';
import {removeService} from '../../../functions/clubs';
import AllIcon from '../../../layout/icons/AllIcons';
import {
  bookingSelector,
  bookingSubSelector,
} from '../../../../store/selectors/bookings';
import CardUser from '../../../layout/cards/CardUser';
import CardService from '../../clubSettings/components/CardService';

class CardBooking extends Component {
  static propTypes = {
    id: string,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount = () => {
    const {id} = this.props;
    id && bindBooking(id);
  };
  componentWillUnmount = () => {
    const {id} = this.props;
    id && unbindBooking(id);
  };
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'CardBooking',
    });
  }

  removeService = () => {
    const {service, clubID} = this.props;
    const {id, title} = service;
    navigate('Alert', {
      title: 'Are you sure you want to delete ' + title + '?',
      subtitle: 'This action cannot be undone.',
      textButton: `Delete`,
      colorButton: 'red',
      onPressColor: colors.red,
      onGoBack: async () => removeService({clubID, serviceID: id}),
    });
  };
  render() {
    const {booking, userID} = this.props;

    if (!booking) return <View />;
    const {serviceID, status} = booking;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => true}
        style={styles.card}>
        <CardService id={serviceID} displayOwner={true} hideButtons={true} />
        <Row style={{marginTop: 20}}>
          <Col size={60}>
            <Text style={styles.title}>Status: {status}</Text>
            <Text style={styles.subtitle} />
          </Col>
          <Col size={20} style={styleApp.center3} />
          <Col size={20} style={styleApp.center3} />
        </Row>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    ...styleApp.marginView,
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: colors.off,
  },
  title: {
    ...styleApp.textBold,
    fontSize: 17,
    color: colors.title,
  },
  subtitle: {
    ...styleApp.textBold,
    color: colors.title,
    fontSize: 11,
    marginTop: 4,
  },
});

const mapStateToProps = (state, props) => {
  return {
    booking: bookingSelector(state, props),
    userID: userIDSelector(state),
  };
};

export default connect(mapStateToProps)(CardBooking);
