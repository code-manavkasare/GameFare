import React, {Component} from 'react';
import {Animated, View, Text, TextInput, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import {
  heightFooterBooking,
  heightHeaderModal,
  marginBottomApp,
  marginTopApp,
} from '../../style/sizes';

import Button from '../../layout/buttons/Button';
import {rowTitle} from '../TeamPage/components/elements';

import HeaderBookingsPage from './components/HeaderBookingsPage';
import {userBookingsSelector} from '../../../store/selectors/user';
import {FlatListComponent} from '../../layout/Views/FlatList';
import CardBooking from './components/CardBooking';

class BookingsPage extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  emptyList = () => {
    const {isClubOwner} = this.props;
    let config = {
      textButton: 'Post to your club',
      iconButton: 'plus',
    };
    if (isClubOwner) {
      config = {...config, clickButton: this.createPost};
    } else {
      config = {
        ...config,
        text: "The club owner hasn't posted anything",
        image: require('../../../img/images/target.png'),
      };
    }
    return config;
  };
  renderBooking = ({item: {id}}) => <CardBooking id={id} />;
  render() {
    const {navigation, bookings} = this.props;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBookingsPage
          title={'Bookings'}
          navigation={navigation}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
        />

        <FlatListComponent
          onRef={(ref) => (this.flatListRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          styleContainer={{
            paddingTop: 22,
            ...styleApp.marginView,
          }}
          showsVerticalScrollIndicator={false}
          header={rowTitle({
            hideDividerHeader: true,
            title: 'Bookings',
            titleColor: colors.greyDarker,
            titleStyle: {
              fontWeight: '800',
              fontSize: 23,
            },
            containerStyle: {
              marginBottom: 0,
              marginTop: 0,
            },
          })}
          paddingBottom={120}
          list={bookings}
          lengthList={bookings.length}
          cardList={this.renderBooking}
          keyExtractor={(item) => item.id}
          scrollEnabled={bookings.length > 0}
        />
      </View>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    bookings: userBookingsSelector(state),
  };
};

export default connect(mapStateToProps)(BookingsPage);
