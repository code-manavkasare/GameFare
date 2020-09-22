import React, {Component} from 'react';
import {
  Share,
  View,
  Text,
  Image,
  StyleSheet,
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
            style={styles.searchButtonStyle}
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
        </View>
      </View>
    );
  };

  branchLinkButton = () => {
    const {branchLink, makeNewBranchLink} = this.props;
    if (branchLink) {
      return (
        <ButtonColor
          color={colors.blue}
          onPressColor={colors.blueLight}
          click={async () => {
            await Share.share({url: branchLink});
            makeNewBranchLink();
          }}
          style={styles.inviteButtonStyle}
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
      );
    } else {
      return null;
    }
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
    return (
      <Animated.View
        ref={(view) => {
          this.searchBarRef = view;
        }}
        style={[styles.searchBarStyle, {opacity: this.searchBarOpacity}]}>
        <TouchableWithoutFeedback
          style={styleApp.fullView}
          onPress={this.search}>
          <Row style={styles.searchRowStyle}>
            <AllIcon
              name={'search'}
              size={13}
              color={colors.greyDark}
              type="font"
            />
            <Text style={styles.searchTextStyle}>Search</Text>
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
    let coachSessions = this.sessionsArray();
    const {
      invite,
      AnimatedHeaderValue,
      userConnected,
      permissionsCamera,
      mostRecent,
      sharingVideos,
      titleText,
      titleIcon,
      hideCallButton,
      hideGroups,
    } = this.props;
    if (mostRecent) {
      coachSessions = coachSessions.slice(0, 3);
    }
    if (!userConnected || !permissionsCamera || !coachSessions) {
      return null;
    }
    return (
      <FlatListComponent
        list={hideGroups ? [] : coachSessions}
        cardList={({item: session}) => (
          <View style={styles.cardStreamContainerStyle}>
            <CardStreamView
              coachSessionID={session.id}
              key={session.id}
              clickSideEffect={
                sharingVideos
                  ? () => shareVideosWithTeams(sharingVideos, [session.id])
                  : null
              }
              invite={invite}
              hideCallButton={hideCallButton}
              scale={1}
              onRef={(ref) => this.itemsRef.push(ref)}
              recentView
              style={styles.cardStreamStyle}
            />
          </View>
        )}
        numColumns={1}
        inverted={false}
        incrementRendering={6}
        initialNumberToRender={8}
        paddingBottom={sizes.heightFooter + sizes.marginBottomApp}
        header={() => {
          const icon = {
            name: titleIcon,
            type: 'font',
            color: colors.title,
            size: 23,
          };
          return (
            <View>
              {this.searchBar()}
              {/* {this.sessionInvitation()} */}
              {!hideGroups && (
                <Text style={styles.recentTextStyle}>Recent</Text>
              )}
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

const styles = StyleSheet.create({
  inviteButtonStyle: {
    ...styleApp.center,
    position: 'absolute',
    width: 40,
    height: 40,
    right: 15,
    borderRadius: 20,
  },
  searchBarStyle: {
    ...styleApp.center2,
    paddingLeft: 25,
    height: 50,
    width: '100%',
    borderRadius: 15,
    backgroundColor: colors.greyLight,
    marginVertical: 20,
  },
  searchButtonStyle: {
    ...styleApp.center,
    position: 'absolute',
    width: 40,
    height: 40,
    right: 70,
    borderRadius: 20,
  },
  searchTextStyle: {
    ...styleApp.textBold,
    color: colors.greyDark,
    marginLeft: 20,
  },
  searchRowStyle: {
    height: '100%',
    ...styleApp.center4,
  },
  styleViewLiveLogo: {
    ...styleApp.center,
    backgroundColor: colors.off,
    height: 45,
    width: 45,
    borderRadius: 22.5,
    borderWidth: 1,
    borderColor: colors.grey,
    marginTop: -100,
    marginLeft: 65,
  },
  recentTextStyle: {
    ...styleApp.textBold,
    marginTop: 10,
    marginLeft: 5,
    fontSize: 23,
  },
  cardStreamContainerStyle: {
    width: '90%',
    marginLeft: '5%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  cardStreamStyle: {borderRadius: 15, paddingVertical: 0, marginVertical: 5},
});

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
