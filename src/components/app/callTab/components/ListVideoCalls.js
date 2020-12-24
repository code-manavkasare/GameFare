import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {connect} from 'react-redux';

import {navigate} from '../../../../../NavigationService';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {heightFooter, marginBottomApp} from '../../../style/sizes';

import {FlatListComponent} from '../../../layout/Views/FlatList';
import {boolShouldComponentUpdate} from '../../../functions/redux';

import {viewLive, rowTitle} from '../../TeamPage/components/elements';
import CardStreamView from '../../coachFlow/GroupsPage/components/CardStreamView';
import {
  currentSessionIDSelector,
  sessionsSelector,
} from '../../../../store/selectors/sessions';
import {userConnectedSelector} from '../../../../store/selectors/user';

class ListVideoCalls extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.clickCardLive = this.clickCardLive.bind(this);
    this.clickCard = this.clickCard.bind(this);
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

  clickCardLive = () => {
    navigate('Session');
  };
  clickCard = (session) => {
    const {onClick} = this.props;
    onClick(session);
  };
  render() {
    const {
      userConnected,
      selectedSessions,
      hideCallButton,
      currentSessionID,
      AnimatedHeaderValue,
      openSearchPage,
      coachSessions,
      headerTitle,
      inlineSearch,
      liveSessionHeader,
    } = this.props;
    const currentlyInSession =
      currentSessionID && liveSessionHeader && !inlineSearch;
    return (
      <FlatListComponent
        list={coachSessions}
        ListEmptyComponent={{
          clickButton: () =>
            !userConnected ? navigate('SignIn') : openSearchPage(),
          textButton: !userConnected ? 'Sign in' : 'Search',
          text: !userConnected
            ? 'Sign in to start a video call'
            : 'Search for users and start a video call',
          iconButton: !userConnected ? 'user' : 'search',
          icon: 'video',
          image: require('../../../../img/images/search.png'),
        }}
        cardList={({item: session}) => {
          return (
            <View style={styles.cardStreamContainerStyle}>
              <CardStreamView
                coachSessionID={session.id}
                key={session.id}
                onClick={this.clickCard}
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
              titleColor: colors.greyDarker,
              titleStyle: {
                fontWeight: '800',
                fontSize: 23,
              },
              containerStyle: {
                marginBottom: currentlyInSession ? 0 : -10,
              },
            })}
            {currentlyInSession ? (
              <View style={styles.sessionMenuStyle}>
                {/* {viewLive(currentSession, {
                  position: 'absolute',
                  left: -5,
                  top: -5,
                  zIndex: 2,
                })} */}
                <CardStreamView
                  coachSessionID={currentSessionID}
                  onClick={this.clickCardLive}
                  selected={false}
                  showAddMemberButton
                  scale={1}
                  recentView
                  style={styles.cardStreamStyle}
                />
              </View>
            ) : null}
          </View>
        }
        headerStyle={styleApp.marginView}
        AnimatedHeaderValue={AnimatedHeaderValue}
        paddingBottom={heightFooter + marginBottomApp + 90}
      />
    );
  }
}

const styles = StyleSheet.create({
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

  divider: {
    width: '115%',
    left: '-7.5%',
    height: 1,
    backgroundColor: colors.greyLighter,
  },
});

const mapStateToProps = (state) => {
  return {
    coachSessions: sessionsSelector(state, {
      sortBy: 'lastConnection',
      hideCurrentSession: true,
    }),
    userConnected: userConnectedSelector(state),
    currentSessionID: currentSessionIDSelector(state),
  };
};

export default connect(mapStateToProps)(ListVideoCalls);
