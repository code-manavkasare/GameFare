import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {Row, Col} from 'react-native-easy-grid';

import {navigate} from '../../../../../NavigationService';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import sizes from '../../../style/sizes';

import {FlatListComponent} from '../../../layout/Views/FlatList';
import ButtonColor from '../../../layout/buttons/Button';
import AllIcons from '../../../layout/icons/AllIcons';

import {viewLive, rowTitle} from '../../TeamPage/components/elements';
import CardStreamView from '../../coachFlow/GroupsPage/components/CardStreamView';

class ListVideoCalls extends Component {
  constructor(props) {
    super(props);
    this.state = {};
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

  currentSessionView = () => {
    const {
      currentSessionID,
      currentSession,
      liveSessionHeader,
      inlineSearch,
    } = this.props;
    const currentlyInSession =
      currentSessionID && liveSessionHeader && !inlineSearch;
    return (
      <View>
        {rowTitle({
          hideDividerHeader: true,
          title: 'Video Calls',
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
    );
  };

  render() {
    const coachSessions = this.sessionsArray();
    const {
      userConnected,
      onClick,
      selectedSessions,
      hideCallButton,
      currentSessionID,
      AnimatedHeaderValue,
      openUserDirectory,
      liveSessionHeader,
      inlineSearch,
    } = this.props;
    if (!userConnected) {
      return null;
    }
    return (
      <FlatListComponent
        list={coachSessions}
        ListEmptyComponent={{
          clickButton: () => openUserDirectory(),
          textButton: 'Search',
          text: 'Search for users to start a call',
          iconButton: 'search',
          image: require('../../../../img/images/search.png'),
        }}
        cardList={({item: session}) => (
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
          </View>
        )}
        incrementRendering={6}
        initialNumberToRender={8}
        header={this.currentSessionView()}
        AnimatedHeaderValue={AnimatedHeaderValue}
        paddingBottom={sizes.heightFooter + sizes.marginBottomApp}
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
    overflow: 'hidden',
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
)(ListVideoCalls);
