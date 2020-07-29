import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import database from '@react-native-firebase/database';

import {coachAction} from '../../.././../../actions/coachActions';
import {navigate} from '../../../../../../NavigationService';

import {sessionOpening, getMember} from '../../../../functions/coach';
import {
  imageCardTeam,
  sessionTitle,
  sessionDate,
  viewLive,
} from '../../../TeamPage/components/elements';
import CoachPopups from './StreamView/components/CoachPopups';

import ButtonColor from '../../../../layout/Views/Button';
import Loader from '../../../../layout/loaders/Loader';
import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';

class CardStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      session: false,
      loading: true,
    };
  }

  componentDidMount() {
    this.props.onRef(this);
    this.loadCoachSession();
  }

  async loadCoachSession() {
    const {coachSessionID, coachAction} = this.props;
    database()
      .ref(`coachSessions/${coachSessionID}`)
      .on(
        'value',
        async function(snap) {
          let session = snap.val();
          const {currentSessionID} = this.props;
          if (!session) return null;

          if (currentSessionID === coachSessionID)
            await coachAction('setCurrentSession', session);

          coachAction('setAllSessions', {
            [coachSessionID]: session,
          });
          this.setState({
            session: session,
            loading: false,
            error: false,
          });
        }.bind(this),
      );
  }

  async openStream(forceOpen) {
    const {session} = this.state;
    sessionOpening(session);
  }

  loading() {
    return <View>{/* <Loader size={55} color={colors.greyDark} /> */}</View>;
  }

  async hangup() {
    const {coachAction} = this.props;
    await coachAction('endCurrentSession');
  }

  cardStream() {
    const {coachSessionID, currentSessionID, userID} = this.props;
    const {loading, session} = this.state;
    const activeSession = coachSessionID === currentSessionID;

    let member = getMember(session, userID);
    if (!member) member = {};

    return (
      <Animated.View style={styles.card}>
        <ButtonColor
          color={colors.white}
          onPressColor={colors.off}
          click={() => navigate('TeamPage', {coachSessionID: coachSessionID})}
          style={[styleApp.fullSize, {paddingTop: 10, paddingBottom: 10}]}
          view={() => {
            return loading ? (
              this.loading()
            ) : (
              <Row style={{paddingTop: 5, paddingBottom: 10}}>
                <Col size={30}>{imageCardTeam(session)}</Col>
                <Col size={60} style={styleApp.center2}>
                  {sessionTitle(session)}
                  {sessionDate(session)}
                </Col>
                <Col size={15} style={styleApp.center}>
                  {viewLive(session)}
                </Col>
              </Row>
            );
          }}
        />

        <CoachPopups
          isConnected={member.isConnected && activeSession}
          session={session}
          members={session.members}
          card={true}
          coachSessionID={coachSessionID}
          member={getMember(session, userID)}
          open={this.openStream.bind(this)}
          close={this.hangup.bind(this)}
          onRef={(ref) => (this.coachPopupsRef = ref)}
        />
      </Animated.View>
    );
  }
  render() {
    return this.cardStream();
  }
}

const styles = StyleSheet.create({
  card: {
    width: '100%',

    backgroundColor: colors.white,
    flex: 1,
  },
  button: {
    height: 45,
    width: 45,
    borderRadius: 25,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 9,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    currentSessionID: state.coach.currentSessionID,
    userConnected: state.user.userConnected,
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(CardStream);
