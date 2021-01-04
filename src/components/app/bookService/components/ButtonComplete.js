import React, {Component} from 'react';
import {string} from 'prop-types';

import {goBack, navigate} from '../../../../../NavigationService';

import Button from '../../../layout/buttons/Button';
import colors from '../../../style/colors';
import {completeBooking} from '../../../functions/booking';
import {timeout} from '../../../functions/coach';

export default class ButtonComplete extends Component {
  static propTypes = {
    bookingID: string,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      error: null,
    };
  }

  completeBooking = async () => {
    const {bookingID} = this.props;

    await this.setState({loader: true});
    const {response, error} = await completeBooking({
      bookingID,
    });
    await this.setState({loader: false});
    if (response && !error) {
      await navigate('ClubsPage');
      await timeout(300);
      navigate('Club', {screen: 'AddContentBooking', params: {bookingID}});
    } else if (error) {
      await timeout(300);
      navigate('Alert', {
        title: error,
        subtitle: 'Try again in a moment.',
        textButton: 'Got it!',
        onGoBack: () => {},
      });
    }
  };

  render() {
    const {loader} = this.state;
    return (
      <Button
        backgroundColor="primary"
        onPressColor={colors.primaryLight}
        enabled={true}
        loader={loader}
        text={'Mark as Complete'}
        icon={{
          name: 'lock',
          size: 24,
          type: 'font',
          color: colors.white,
        }}
        click={this.completeBooking}
      />
    );
  }
}
