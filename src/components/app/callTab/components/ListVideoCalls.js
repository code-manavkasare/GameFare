import React, {Component} from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import {connect} from 'react-redux';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import sizes from '../../../style/sizes';

import {FlatListComponent} from '../../../layout/Views/FlatList';

import CardStreamView from '../../coachFlow/GroupsPage/components/CardStreamView';

class ListVideoCalls extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  sessionsArray = () => {
    const {coachSessions} = this.props;
    if (!coachSessions) {
      return [];
    }
    return Object.values(coachSessions)
      .sort(function(a, b) {
        return b.timestamp - a.timestamp;
      })
      .filter((s) => {
        return s?.id;
      });
  };

  // sessionInvitation = () => {
  //   const {currentSessionID, currentSession} = this.props;
  //   const sessionMenuStyle = {
  //     ...styleApp.center2,
  //     width: '100%',
  //     borderRadius: 15,
  //     marginVertical: 10,
  //   };
  //   const mainContainer = {
  //     ...styleApp.center2,
  //     borderWidth: 2,
  //     ...styleApp.shadowWeak,
  //     borderColor: colors.greyLight,
  //     backgroundColor: colors.white,
  //     width: '100%',
  //     borderRadius: 15,
  //     minHeight: 70,
  //   };
  //   const currentSessionView = {
  //     // ...styleApp.shadowWeak,
  //     ...styleApp.center4,
  //     paddingTop: 15,
  //     paddingVertical: 5,
  //     marginTop: 0,
  //     marginBottom: 10,
  //     height:
  //       currentSession?.members !== undefined &&
  //       Object.values(currentSession.members).length > 2
  //         ? 90
  //         : 90,
  //     width: 110,
  //     // currentSession?.members !== undefined &&
  //     // Object.values(currentSession.members).length > 2
  //     //   ? '70%'
  //     //   : '50%',
  //     // borderRadius: 15,
  //     // borderColor: colors.greyLight,
  //     // borderWidth: 2,
  //     // backgroundColor: colors.white,
  //   };
  //   const textStyle = {
  //     ...styleApp.textBold,
  //     color: colors.greyDarker,
  //     fontSize: 16,
  //     // width: 150,
  //     position: 'absolute',
  //     left: currentSessionID ? 105 : 15,
  //   };

  //   return (
  //     <View style={sessionMenuStyle}>
  //       <View style={mainContainer}>
  //         <Text style={textStyle}>
  //           Invite to {currentSessionID ? 'call' : 'a GameFare Call'}
  //         </Text>
  //         {currentSessionID &&
  //           viewLive(currentSession, {
  //             position: 'absolute',
  //             left: -5,
  //             top: -5,
  //             zIndex: 2,
  //           })}
  //         {currentSessionID && (
  //           <View style={currentSessionView}>
  //             {imageCardTeam(currentSession, undefined, true)}
  //             {/* {sessionTitle(
  //               currentSession,
  //               {
  //                 marginTop: 10,
  //                 fontSize: 14,
  //                 textAlign: 'center',
  //                 width: '70%',
  //               },
  //               false,
  //             )} */}
  //           </View>
  //         )}
  //         <ButtonColor
  //           color={colors.greyLight}
  //           onPressColor={colors.grey}
  //           click={this.search}
  //           style={styles.searchButtonStyle}
  //           view={() => {
  //             return (
  //               <AllIcon
  //                 solid
  //                 name={'search'}
  //                 size={17}
  //                 color={colors.greyDarker}
  //                 type="font"
  //               />
  //             );
  //           }}
  //         />
  //       </View>
  //     </View>
  //   );
  // };

  render() {
    const coachSessions = this.sessionsArray();
    const {
      userConnected,
      onClick,
      selectedSessions,
      hideCallButton,
      AnimatedHeaderValue
    } = this.props;
    if (!userConnected || coachSessions.length === 0) {
      return null;
    }
    return (
      <FlatListComponent
        list={coachSessions}
        cardList={({item: session}) => (
          <View style={styles.cardStreamContainerStyle}>
            <CardStreamView
              coachSessionID={session.id}
              key={session.id}
              onClick={(session) => onClick(session)}
              selected={selectedSessions[session.id] ? true : false}
              hideCallButton={hideCallButton}
              scale={1}
              recentView
              style={styles.cardStreamStyle}
            />
          </View>
        )}
        incrementRendering={6}
        initialNumberToRender={8}
        AnimatedHeaderValue={AnimatedHeaderValue}
        paddingBottom={sizes.heightFooter + sizes.marginBottomApp}
      />
    );  }
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
)(ListVideoCalls);
