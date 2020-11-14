import React, {Component, memo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {connect} from 'react-redux';

import {navigate} from '../../../../../NavigationService';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import sizes from '../../../style/sizes';

import {FlatListComponent} from '../../../layout/Views/FlatList';
import {boolShouldComponentUpdate} from '../../../functions/redux';

import {viewLive, rowTitle} from '../../TeamPage/components/elements';
import {getSortedSessions} from '../../../functions/coach';
import CardStreamView from '../../coachFlow/GroupsPage/components/CardStreamView';

class ListVideoCalls extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'ListVideoCalls',
    });
  }
  sessionsArray = () => {
    const {coachSessions, currentSessionID} = this.props;
    if (!coachSessions) {
      return [];
    }
    return Object.values(coachSessions)
      .sort(function(a, b) {
        return b.timestamp - a.timestamp;
      })
      .filter((s) => {
        return s && s.id && s.id !== currentSessionID;
      });
  };

  render() {
    const {
      userConnected,
      onClick,
      selectedSessions,
      hideCallButton,
      currentSessionID,
      AnimatedHeaderValue,
      openUserDirectory,
      coachSessions: propSessions,
      headerTitle,
      inlineSearch,
      liveSessionHeader,
      currentSession,
    } = this.props;

    const currentlyInSession =
      currentSessionID && liveSessionHeader && !inlineSearch;
    let coachSessions = getSortedSessions({
      coachSessions: propSessions,
      sortBy: 'lastConnection',
      exclude: [currentSessionID],
    });
    return (
      <FlatListComponent
        list={coachSessions}
        ListEmptyComponent={{
          clickButton: () =>
            !userConnected ? navigate('SignIn') : openUserDirectory(),
          textButton: !userConnected ? 'Sign in' : 'Search',
          text: !userConnected
            ? 'Sign in to start a call'
            : 'Search users or share invite to start a call.',
          iconButton: !userConnected ? 'user' : 'search',
          image: require('../../../../img/images/search.png'),
        }}
        cardList={({item: session}) => {
          return (
            <View style={styles.cardStreamContainerStyle}>
              <CardStreamView
                coachSessionID={session.id}
                key={session.id}
                onClick={(session) => onClick(session)}
                selected={selectedSessions[session.id] ? true : false}
                showCallButton={!hideCallButton}
                scale={1}
                recentView
                style={styles.cardStreamStyle}
              />
              <View style={styles.divider} />
            </View>
          );
        }}
        incrementRendering={6}
        initialNumberToRender={8}
        header={
          <View>
            {rowTitle({
              hideDividerHeader: true,
              title: headerTitle,
              titleColor: colors.black,
              titleStyle: {
                fontWeight: '800',
                fontSize: 23,
              },
              containerStyle: {
                marginBottom: currentlyInSession ? 0 : -10,
              },
            })}
            {currentlyInSession && (
              <View style={styles.sessionMenuStyle}>
                {viewLive(currentSession, {
                  position: 'absolute',
                  left: -5,
                  top: -5,
                  zIndex: 2,
                })}
                <CardStreamView
                  coachSessionID={currentSessionID}
                  onClick={() => navigate('Session')}
                  selected={false}
                  showAddMemberButton
                  scale={1}
                  recentView
                  style={styles.cardStreamStyle}
                />
              </View>
            )}
          </View>
        }
        AnimatedHeaderValue={AnimatedHeaderValue}
        paddingBottom={sizes.heightFooter + sizes.marginBottomApp + 90}
      />
    );
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
    overflow: 'visible',
  },
  cardStreamStyle: {borderRadius: 15, paddingVertical: 0, marginVertical: 5},
  sessionMenuStyle: {
    ...styleApp.center2,
    ...styleApp.shadowWeak,
    width: '100%',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.greyLight,
    backgroundColor: colors.white,
    marginBottom: 5,
  },
  currentSessionView: {
    ...styleApp.center4,
    paddingTop: 15,
    paddingVertical: 5,
    marginTop: 0,
    marginBottom: 10,
    height: 90,
    width: 110,
  },
  liveAddMemberButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: 70,
  },
  divider: {
    width: '115%',
    left: '-7.5%',
    height: 1,
    backgroundColor: colors.greyLighter,
  },
});

const mapStateToProps = (state) => {
  return {
    coachSessions: state.user.infoUser.coachSessions,
    userConnected: state.user.userConnected,
    currentSessionID: state.coach.currentSessionID,
    currentSession: state.coachSessions[state.coach.currentSessionID],
  };
};

export default connect(
  mapStateToProps,
  {},
)(ListVideoCalls);
