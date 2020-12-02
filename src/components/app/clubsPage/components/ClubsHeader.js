import React, {Component} from 'react';
import {bool, any, object, string} from 'prop-types';
import {View, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import Animated from 'react-native-reanimated';

import colors from '../../../style/colors';
import {heightHeaderHome, marginTopApp} from '../../../style/sizes';
import {rowTitle} from '../../TeamPage/components/elements';
import {reanimatedTiming} from '../../../animations/animations';

import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import {boolShouldComponentUpdate} from '../../../functions/redux';
import {userInfoSelector} from '../../../../store/selectors/user';
import ClubList from './ClubList';

const ROW_HEIGHT = 60;
const EXPANDED_ROW_HEIGHT = 180;
class ClubsHeader extends Component {
  static propTypes = {
    loader: bool,
    AnimatedHeaderValue: any,
    navigation: object,
    infoUser: object,
    text: string,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {listVisible: false};
    this.headerAnimatedValue = new Animated.Value(0);
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
    const headerHeight = Animated.interpolate(headerAnimatedValue, {
      inputRange: [0, 1],
      outputRange: [ROW_HEIGHT, EXPANDED_ROW_HEIGHT],
    });
    return {
      headerHeight,
    };
  };
  expandListView = () => {
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
    return rowTitle({
      hideDividerHeader: true,
      title: 'Clubs',
      titleColor: colors.greyDarker,
      titleStyle: {
        fontWeight: '800',
        fontSize: 23,
      },
      containerStyle: {
        paddingHorizontal: '5%',
        height: ROW_HEIGHT,
      },
      clickOnRow: true,
      button: {
        click: this.expandListView,
        icon: {
          type: 'font',
          color: colors.greyDarker,
          name: listVisible ? 'chevron-up' : 'chevron-down',
        },
        color: 'transparent',
        onPressColor: 'transparent',
        fontSize: 12,
        style: {
          height: 25,
          width: 25,
        },
      },
    });
  };
  clubsListView() {
    const {headerHeight} = this.animatedValues();
    const {selectClub} = this.props;
    const clubsListContainerStyle = {
      ...styles.clubsListContainer,
      height: headerHeight,
      zIndex: 10,
    };
    return (
      <Animated.View style={clubsListContainerStyle}>
        {this.headerTitle()}
        <ClubList selectClub={selectClub} />
      </Animated.View>
    );
  }
  render() {
    const {
      loader,
      AnimatedHeaderValue,
      navigation,
      infoUser,
      text,
    } = this.props;
    return (
      <View style={styles.headerContainer}>
        <HeaderBackButton
          AnimatedHeaderValue={AnimatedHeaderValue}
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
          backgroundColorIcon1={'transparent'}
          clickButton1={() => {
            /// navigate to requests page
          }}
          // icon11={'dollar-sign'}
          typeIcon11={'font'}
          sizeIcon11={17}
          colorIcon11={colors.greyDarker}
          backgroundColorIcon11={'transparent'}
          clickButton11={() => {
            /// navigate to services page
          }}
          icon2={infoUser?.picture ? infoUser?.picture : 'user'}
          sizeIcon2={infoUser.picture ? 45 : 23}
          clickButton2={() => navigation.navigate('VideoLibrary')}
          typeIcon2={infoUser.picture ? 'image' : 'font'}
        />
        {this.clubsListView()}
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
    zIndex: 5,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.greyLight,
    overflow: 'hidden',
  },
});

const mapStateToProps = (state) => {
  return {
    infoUser: userInfoSelector(state),
  };
};

export default connect(mapStateToProps)(ClubsHeader);
