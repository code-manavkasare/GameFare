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
import ButtonColor from '../../../../layout/Views/Button';
import AllIcon from '../../../../layout/icons/AllIcons';
import {native} from '../../../../animations/animations';
import {
  imageCardTeam,
  sessionTitle,
  viewLive,
} from '../../../TeamPage/components/elements';

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
    return Object.values(coachSessions)
      .sort(function(a, b) {
        return b.timestamp - a.timestamp;
      })
      .filter((s) => {
        return s?.id !== undefined;
      });
  };
  displaySearchBar = (val) => {
    Animated.timing(this.searchBarOpacity, native(val, 0, 0)).start();
  };
  sessionInvitation = () => {
    const {currentSessionID, currentSession} = this.props;
    const sessionMenuStyle = {
      ...styleApp.center2,
      width: '100%',
      borderRadius: 15,
      marginVertical: 10,
    };
    const mainContainer = {
      ...styleApp.center2,
      borderWidth: 2,
      ...styleApp.shadowWeak,
      borderColor: colors.greyLight,
      backgroundColor: colors.white,
      width: '100%',
      borderRadius: 15,
      minHeight: 70,
    };
    const currentSessionView = {
      // ...styleApp.shadowWeak,
      ...styleApp.center4,
      paddingTop: 15,
      paddingVertical: 5,
      marginTop: 0,
      marginBottom: 10,
      height:
        currentSession?.members !== undefined &&
        Object.values(currentSession.members).length > 2
          ? 90
          : 90,
      width: 110,
      // currentSession?.members !== undefined &&
      // Object.values(currentSession.members).length > 2
      //   ? '70%'
      //   : '50%',
      // borderRadius: 15,
      // borderColor: colors.greyLight,
      // borderWidth: 2,
      // backgroundColor: colors.white,
    };
    const textStyle = {
      ...styleApp.textBold,
      color: colors.greyDarker,
      fontSize: 16,
      // width: 150,
      position: 'absolute',
      left: currentSessionID ? 105 : 15,
    };
    const inviteButtonStyle = {
      ...styleApp.center,
      position: 'absolute',
      width: 40,
      height: 40,
      right: 15,
      borderRadius: 20,
    };
    const searchButtonStyle = {
      ...inviteButtonStyle,
      right: 70,
    };
    return (
      <View style={sessionMenuStyle}>
        <View style={mainContainer}>
          <Text style={textStyle}>
            Invite to {currentSessionID ? 'call' : 'a GameFare Call'}
          </Text>
          {currentSessionID &&
            viewLive(currentSession, {
              position: 'absolute',
              left: -5,
              top: -5,
              zIndex: 2,
            })}
          {currentSessionID && (
            <View style={currentSessionView}>
              {imageCardTeam(currentSession, undefined, true)}
              {/* {sessionTitle(
                currentSession,
                {
                  marginTop: 10,
                  fontSize: 14,
                  textAlign: 'center',
                  width: '70%',
                },
                false,
              )} */}
            </View>
          )}
          <ButtonColor
            color={colors.greyLight}
            onPressColor={colors.grey}
            click={this.search}
            style={searchButtonStyle}
            view={() => {
              return (
                <AllIcon
                  solid
                  name={'search'}
                  size={17}
                  color={colors.greyDarker}
                  type="font"
                />
              );
            }}
          />
          <ButtonColor
            color={colors.blue}
            onPressColor={colors.blueLight}
            click={async () => {
              // TODO
              // BRANCH SHARE LINK
            }}
            style={inviteButtonStyle}
            view={() => {
              return (
                <AllIcon
                  solid
                  name={'link'}
                  size={17}
                  color={colors.white}
                  type="font"
                />
              );
            }}
          />
        </View>
      </View>
    );
  };
  search = () => {
    const {openSearch} = this.props;
    this.searchBarRef.measure((...callback) => {
      const yOffset = callback[5];
      this.displaySearchBar(0);
      openSearch(yOffset);
    });
  };
  searchBar = () => {
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
          onPress={this.search}>
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
  resetInvites = () => {
    this.itemsRef.map((ref) => {
      ref?.toggleSelected(0);
    });
  };
  list = () => {
    const {invite} = this.props;
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
    const cardStreamContainerStyle = {
      width: '90%',
      marginLeft: '5%',
      borderRadius: 15,
      overflow: 'hidden',
    };
    // const racketStyle = {height: 80, width: 80, marginTop: 30};
    // const liveStyle = {height: 27, width: 27};
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
          <View style={cardStreamContainerStyle}>
            <CardStreamView
              coachSessionID={session.id}
              key={session.id}
              clickSideEffect={
                sharingVideos
                  ? () => shareVideosWithTeams(sharingVideos, [session.id])
                  : null
              }
              invite={invite}
              scale={1}
              onRef={(ref) => this.itemsRef.push(ref)}
              recentView
              style={{borderRadius: 15, paddingVertical: 0, marginVertical: 5}}
            />
          </View>
        )}
        numColumns={1}
        inverted={false}
        incrementRendering={6}
        initialNumberToRender={8}
        paddingBottom={sizes.heightFooter + sizes.marginBottomApp}
        header={() => {
          const recentTextStyle = {
            ...styleApp.textBold,
            marginTop: 20,
            marginLeft: 5,
            fontSize: 23,
          };
          const icon = {
            name: 'video',
            type: 'font',
            color: colors.title,
            size: 23,
          };
          return (
            <View>
              {rowTitle({
                icon,
                title: 'Video Call',
                hideDividerHeader: true,
              })}
              {this.searchBar()}
              {this.sessionInvitation()}
              <Text style={recentTextStyle}>Recent</Text>
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
    currentSessionID: state.coach.currentSessionID,
    currentSession: state.coachSessions[state.coach.currentSessionID],
  };
};

export default connect(
  mapStateToProps,
  {},
)(ListStreams);
