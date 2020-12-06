import React, {Component} from 'react';
import {Share} from 'react-native';
import {connect} from 'react-redux';
import {string} from 'prop-types';

import {navigate, popToTop} from '../../../../../NavigationService';
import {serviceSelector} from '../../../../store/selectors/services';
import {defaultCardSelector} from '../../../../store/selectors/user';
import {confirmBookingService} from '../../../functions/clubs';

import Button from '../../../layout/buttons/Button';
import colors from '../../../style/colors';

class ButtonBook extends Component {
  static propTypes = {
    clubID: string,
    serviceID: string,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      error: null,
    };
  }
  confirmBooking = async () => {
    const {serviceID, clubID, navigation} = this.props;

    await this.setState({loader: true});
    const {response, error} = await confirmBookingService({serviceID, clubID});
    await this.setState({loader: false, error});
    if (response) {
      await navigate('ClubsPage');
      navigate('Bookings');
    }
  };
  render() {
    const {loader} = this.state;
    const {service, defaultCard} = this.props;
    console.log('defaultCard', defaultCard);
    const {unit, value} = service.price;
    return (
      <Button
        backgroundColor="primary"
        onPressColor={colors.primaryLight}
        enabled={true}
        loader={loader}
        text={`Confirm ${unit}${value}`}
        disabled={!defaultCard}
        icon={{
          name: 'lock',
          size: 24,
          type: 'font',
          color: colors.white,
        }}
        click={this.confirmBooking}
      />
    );
  }
}

const mapStateToProps = (state, props) => {
  const {serviceID} = props;

  return {
    service: serviceSelector(state, {id: serviceID}),
    defaultCard: defaultCardSelector(state),
  };
};

export default connect(mapStateToProps)(ButtonBook);
