import React, {Component} from 'react';
import {connect} from 'react-redux';
import branch from 'react-native-branch';
import database from '@react-native-firebase/database';
import {store} from '../../../reduxStore';
import {setSession, setSessionBinded} from '../../actions/coachSessionsActions';
import {createCoachSessionFromUserIDs, addMembersToSessionByIDs, bindSession, sessionOpening} from '../functions/coach';
import {shareCloudVideo} from '../database/firebase/videosManagement';
import {
  getArchivesFromBranchParams,
  getSessionFromBranchParams,
} from '../database/branch';
import {navigate} from '../../../NavigationService';

const testParams = {
  type: 'session',
  sentBy: 'AwNBbmiKJ1U9jKrOE8JbiHRdGtX2',
  sessionID: 'abc12345',
};

class BranchManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      branchParams: null,
      executedBranchInstruction: false,
    };
  }
  componentDidMount() {
    branch.subscribe(({error, params, url}) => {
      if (error) {
        console.log('Error from branch:', error);
        return;
      }
      // params will never be null if error is null
      this.setState({branchParams: params});
    });
    //setTimeout(() => this.setState({branchParams: testParams}), 500);
  }

  componentDidUpdate(prevProps) {
    const {branchParams, executedBranchInstruction} = this.state;
    const {user} = this.props;
    const {userConnected, userID} = user;
    if (
      branchParams &&
      !executedBranchInstruction &&
      userConnected &&
      userID !== ''
    ) {
      this.executeBranchInstruction();
    }
  }

  async executeBranchInstruction() {
    const {branchParams} = this.state;
    const {user} = this.props;
    const {userID} = user;
    const {type, sentBy} = branchParams;
    this.setState({executedBranchInstruction: true});
    switch (type) {
      case 'invite': {
        const session = await createCoachSessionFromUserIDs(sentBy, [userID]);
        navigate('Conversation', {coachSessionID: session.objectID});
        break;
      }
      case 'session': {
        const sessionID = getSessionFromBranchParams(branchParams);
        if (sessionID) {
          this.handleSessionInvite(sessionID, userID, sentBy);
        }
        break;
      }
      case 'archives': {
        const archives = getArchivesFromBranchParams(branchParams);
        if (archives) {
          archives.forEach((archiveID) =>
            shareCloudVideo(userID, archiveID, sentBy),
          );
        }
        break;
      }
      default: {}
    }
  }

  async handleSessionInvite(sessionID, userID, sentBy) {
    database()
      .ref(`coachSessions/${sessionID}`)
      .once('value', async (snapshot) => {
        const coachSessionFirebase = snapshot.val();
        if (coachSessionFirebase) {
          await store.dispatch(setSession(coachSessionFirebase));
          await store.dispatch(setSessionBinded({id: sessionID, isBinded: false}));
          await bindSession(sessionID);
          await addMembersToSessionByIDs(sessionID, [userID]);
          if (coachSessionFirebase.members[sentBy] && coachSessionFirebase.members[sentBy].isConnected) {
            sessionOpening(coachSessionFirebase);
          } else {
            navigate('Conversation', {coachSessionID: sessionID});
          }
        } else {
          const session = await createCoachSessionFromUserIDs(sentBy, [userID], sessionID);
          navigate('Conversation', {coachSessionID: session.objectID});
        }
      });
  }

  render = () => null;
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(
  mapStateToProps,
  {},
)(BranchManager);
