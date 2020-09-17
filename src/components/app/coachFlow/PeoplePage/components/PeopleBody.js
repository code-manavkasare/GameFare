import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  Animated,
  RefreshControl,
} from 'react-native';

import {connect} from 'react-redux';
import {Row} from 'react-native-easy-grid';

import {navigate} from '../../../../../../NavigationService';
import CardStreamView from '../../GroupsPage/components/CardStreamView';
import {rowTitle} from '../../../TeamPage/components/elements';
import {FlatListComponent} from '../../../../layout/Views/FlatList';
import {newSession} from '../../../../functions/coach';
import {shareVideosWithTeams} from '../../../../functions/videoManagement';
import styleApp from '../../../../style/style';
import colors from '../../../../style/colors';
import sizes from '../../../../style/sizes';
import Button from '../../../../layout/buttons/Button';
import AllIcon from '../../../../layout/icons/AllIcons';
import {native} from '../../../../animations/animations';

class ListStreams extends Component {
  constructor(props) {
    super(props);
    this.itemsRef = [];
    this.searchBarOpacity = new Animated.Value(1);
  }
  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }
  sessionsArray = () => {
    let {coachSessions} = this.props;
    if (!coachSessions) {
      return [];
    }
    return Object.values(coachSessions).sort(function(a, b) {
      return b.timestamp - a.timestamp;
    });
  };
  displaySearchBar = (val) => {
    Animated.timing(this.searchBarOpacity, native(val, 0, 0)).start();
  };
  searchBar = () => {
    const {openSearch} = this.props;
    const searchBarStyle = {
      ...styleApp.center2,
      paddingLeft: 25,
      height: 50,
      width: '100%',
      borderRadius: 15,
      backgroundColor: colors.greyLight,
      marginVertical: 20,
      opacity: this.searchBarOpacity,
    };
    const textStyle = {
      ...styleApp.textBold,
      color: colors.greyDark,
      marginLeft: 20,
    };
    const rowStyle = {
      height: '100%',
      ...styleApp.center4,
    };
    return (
      <Animated.View
        ref={(view) => {
          this.searchBarRef = view;
        }}
        style={searchBarStyle}>
        <TouchableWithoutFeedback
          style={styleApp.fullView}
          onPress={() => {
            this.searchBarRef.measure((fx, fy, width, height, px, py) => {
              this.displaySearchBar(0);
              openSearch(py);
            });
          }}>
          <Row style={rowStyle}>
            <AllIcon
              name={'search'}
              size={13}
              color={colors.greyDark}
              type="font"
            />
            <Text style={textStyle}>Search</Text>
          </Row>
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  };
  list = () => {
    const styleViewLiveLogo = {
      ...styleApp.center,
      backgroundColor: colors.off,
      height: 45,
      width: 45,
      borderRadius: 22.5,
      borderWidth: 1,
      borderColor: colors.grey,
      marginTop: -100,
      marginLeft: 65,
    };
    let coachSessions = this.sessionsArray();
    const {
      AnimatedHeaderValue,
      userConnected,
      permissionsCamera,
      mostRecent,
      sharingVideos,
    } = this.props;
    if (mostRecent) {
      coachSessions = coachSessions.slice(0, 3);
    }
    if (!userConnected || !permissionsCamera || !coachSessions) {
      return null;
    }
    const racketStyle = {height: 80, width: 80, marginTop: 30};
    const liveStyle = {height: 27, width: 27};
    // if (Object.values(coachSessions).length === 0) {
    //   return (
    //     <View style={[styleApp.marginView, styleApp.center]}>
    //       <View style={[styleApp.center, {marginBottom: 80}]}>
    //         <Image
    //           source={require('../../../../../img/images/racket.png')}
    //           style={racketStyle}
    //         />
    //         <View style={styleViewLiveLogo}>
    //           <Image
    //             source={require('../../../../../img/images/live-news.png')}
    //             style={liveStyle}
    //           />
    //         </View>
    //       </View>

    //       <Button
    //         text={'Start a video chat'}
    //         icon={{
    //           name: 'plus',
    //           size: 18,
    //           type: 'font',
    //           color: colors.white,
    //         }}
    //         backgroundColor={'green'}
    //         onPressColor={colors.greenLight}
    //         click={async () => newSession()}
    //       />
    //       <View style={{height: 20}} />
    //       <Button
    //         text={'Find a coach'}
    //         icon={{
    //           name: 'whistle',
    //           size: 27,
    //           type: 'moon',
    //           color: colors.white,
    //         }}
    //         backgroundColor={'blue'}
    //         onPressColor={colors.blueLight}
    //         click={() => navigate('Coaches')}
    //       />
    //     </View>
    //   );
    // }
    return (
      <FlatListComponent
        list={coachSessions}
        cardList={({item: session}) => (
          <CardStreamView
            coachSessionID={session.id}
            key={session.id}
            clickSideEffect={
              sharingVideos
                ? () => shareVideosWithTeams(sharingVideos, [session.id])
                : null
            }
            scale={1}
            onRef={(ref) => this.itemsRef.push(ref)}
            minimal
          />
        )}
        numColumns={1}
        inverted={false}
        incrementRendering={6}
        initialNumberToRender={8}
        paddingBottom={sizes.heightFooter + sizes.marginBottomApp}
        header={() => {
          return (
            <View>
              {rowTitle({
                icon: {
                  name: 'user-friends',
                  type: 'font',
                  // alt name: 'user',
                  // alt type: 'moon',
                  color: colors.title,
                  size: 23,
                },
                title: 'People',
                hideDividerHeader: true,
              })}
              {this.searchBar()}
              <Text
                style={{
                  ...styleApp.textBold,
                  marginTop: 20,
                  marginLeft: 5,
                  fontSize: 23,
                }}>
                Recent
              </Text>
            </View>
          );
        }}
        AnimatedHeaderValue={AnimatedHeaderValue}
      />
    );
  };

  render() {
    return this.list();
  }
}

const mapStateToProps = (state) => {
  return {
    coachSessions: state.user.infoUser.coachSessions,
    userConnected: state.user.userConnected,
    sessionInfo: state.coach.sessionInfo,
  };
};

export default connect(
  mapStateToProps,
  {},
)(ListStreams);
