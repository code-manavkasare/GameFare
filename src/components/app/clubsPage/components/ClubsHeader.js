import React, {Component} from 'react';
import {bool, any, object, string, func} from 'prop-types';
import {View, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import Animated from 'react-native-reanimated';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import {heightHeaderHome, marginTopApp} from '../../../style/sizes';
import {rowTitle} from '../../TeamPage/components/elements';
import {reanimatedTiming} from '../../../animations/animations';

import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import {boolShouldComponentUpdate} from '../../../functions/redux';
import {userInfoSelector} from '../../../../store/selectors/user';
import ClubList from './ClubList';
import {
  clubSelector,
  userClubInvitesSelector,
} from '../../../../store/selectors/clubs';

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
    const {currentClub, clubInvites} = this.props;
    const title = currentClub?.info?.title;
    return rowTitle({
      hideDividerHeader: true,
      title: listVisible || !title ? 'Clubs' : title,
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
        click: this.toggleListView,
        icon: {
          type: 'font',
          color:
            listVisible || !clubInvites.length
              ? colors.greyDarker
              : colors.primary,
          name: listVisible
            ? 'chevron-up'
            : clubInvites.length
            ? 'circle'
            : 'chevron-down',
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
  selectClub = (id) => {
    const {selectClub} = this.props;
    selectClub(id);
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
          backgroundColorIcon1={'transparent'}
          clickButton1={() => {
            navigation.navigate('Bookings');
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
    currentClub: clubSelector(state, {id: props.currentClubID}),
    clubInvites: userClubInvitesSelector(state),
  };
};

export default connect(mapStateToProps)(ClubsHeader);
