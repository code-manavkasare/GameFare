import React, {Component} from 'react';
import {bool, any, object, string, func} from 'prop-types';
import {View, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import Animated from 'react-native-reanimated';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import {heightHeaderHome, marginTopApp} from '../../../../style/sizes';
import {reanimatedTiming} from '../../../../animations/animations';
import {boolShouldComponentUpdate} from '../../../../functions/redux';
import {userInfoSelector} from '../../../../../store/selectors/user';

import HeaderBackButton from '../../../../layout/headers/HeaderBackButton';
import ClubList from './components/ClubList';
import HeaderTitle from './components/HeaderTitle';
import BookingsBadge from './components/BookingsBadge';

const ROW_HEIGHT = 60;
const EXPANDED_ROW_HEIGHT = 185;

class ClubsHeader extends Component {
  static propTypes = {
    loader: bool,
    AnimatedScrollValue: any,
    navigation: object,
    infoUser: object,
    text: string,
    selectClub: func,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {listVisible: true, currentClub: undefined};
    this.headerAnimatedValue = new Animated.Value(1);
  }
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'ClubsHeader',
    });
  }
  animatedValues = () => {
    const {headerAnimatedValue} = this;
    const {AnimatedScrollValue} = this.props;
    const headerRowHeight = Animated.interpolate(headerAnimatedValue, {
      inputRange: [0, 1],
      outputRange: [ROW_HEIGHT, EXPANDED_ROW_HEIGHT],
      extrapolate: 'clamp',
    });
    const headerScrollBorderWidth = Animated.interpolate(AnimatedScrollValue, {
      inputRange: [0, 10],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    return {
      headerRowHeight,
      headerScrollBorderWidth,
    };
  };
  toggleListView = () => {
    const {listVisible} = this.state;
    const to = listVisible ? 0 : 1;
    const from = listVisible ? 1 : 0;
    this.headerAnimatedValue = reanimatedTiming({
      from,
      to,
      duration: 175,
    });
    this.setState({listVisible: !listVisible});
  };
  headerTitle = () => {
    const {listVisible} = this.state;
    const {currentClubID} = this.props;
    return (
      <HeaderTitle
        currentClubID={currentClubID}
        listVisible={listVisible}
        rowHeight={ROW_HEIGHT}
        click={this.toggleListView}
      />
    );
  };
  selectClub = (id, ignoreAnimation) => {
    const {selectClub} = this.props;
    selectClub(id);
    if (ignoreAnimation) return;
    this.toggleListView();
  };
  clubsListView() {
    const {currentClubID} = this.props;
    const {headerRowHeight, headerScrollBorderWidth} = this.animatedValues();
    const clubsListContainerStyle = {
      ...styles.clubsListContainer,
      height: headerRowHeight,
    };
    const borderRender = {
      ...styleApp.fullSize,
      borderColor: colors.off,
      borderBottomWidth: headerScrollBorderWidth,
    };
    return (
      <Animated.View style={clubsListContainerStyle}>
        <Animated.View style={borderRender}>
          {this.headerTitle()}
          <ClubList
            selectClub={this.selectClub}
            selectedClubID={currentClubID}
          />
        </Animated.View>
      </Animated.View>
    );
  }
  offsetAnimation() {
    const {headerRowHeight} = this.animatedValues();
    const offsetContainerStyle = {
      height: headerRowHeight,
      marginTop: -heightHeaderHome + 30,
    };
    return <Animated.View style={offsetContainerStyle} />;
  }
  render() {
    const {loader, navigation, infoUser, text} = this.props;
    return (
      <View style={styles.headerContainer}>
        <HeaderBackButton
          textHeader={text}
          inputRange={[250, 250]}
          loader={loader}
          initialBorderColorIcon={'transparent'}
          initialBackgroundColor={colors.white}
          initialTitleOpacity={0}
          initialBorderWidth={1}
          initialBorderColorHeader={'transparent'}
          icon1={'shopping-cart'}
          typeIcon1={'font'}
          sizeIcon1={21}
          colorIcon1={colors.greyDarker}
          clickButton1={() => {
            navigation.navigate('Bookings');
          }}
          typeIcon11={'font'}
          sizeIcon11={17}
          colorIcon11={colors.greyDarker}
          backgroundColorIcon11={'transparent'}
          icon2={infoUser?.picture ? infoUser?.picture : 'user'}
          sizeIcon2={infoUser.picture ? 45 : 23}
          clickButton2={() => navigation.navigate('VideoLibrary')}
          typeIcon2={infoUser.picture ? 'image' : 'font'}
          colorIcon2={colors.greyDarker}
          badgeIcon1={<BookingsBadge />}
          button2Guided={{
            text: 'Access your GameFare video library',
            type: 'overlay',
            interaction: 'videoLibrary',
            onPress: () => navigation.navigate('VideoLibrary'),
            style: styleApp.fullSize,
          }}
        />
        {this.clubsListView()}
        {this.offsetAnimation()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 11,
  },
  clubsListContainer: {
    position: 'absolute',
    top: heightHeaderHome + marginTopApp,
    width: '100%',
    zIndex: 10,
    backgroundColor: colors.white,
    borderColor: colors.off,
    overflow: 'hidden',
  },
});

const mapStateToProps = (state, props) => {
  return {
    infoUser: userInfoSelector(state),
  };
};

export default connect(mapStateToProps)(ClubsHeader);
