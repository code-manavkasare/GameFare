import React, {Component} from 'react';
import {connect} from 'react-redux';
import branch from 'react-native-branch';
import {store} from '../../store/reduxStore';
import {setSession} from '../../store/actions/coachSessionsActions';
import {
  createCoachSessionFromUserIDs,
  addMembersToSessionByID,
  sessionOpening,
} from '../functions/coach';
import {shareCloudVideo} from '../database/firebase/videosManagement';
import {
  getArchivesFromBranchParams,
  getSessionFromBranchParams,
} from '../database/branch';
import {navigate} from '../../../NavigationService';
import {logMixpanel} from '../functions/logs';
import {boolShouldComponentUpdate} from '../functions/redux';
import {getValueOnce} from '../database/firebase/methods';
import {
  userConnectedSelector,
  userIDSelector,
} from '../../store/selectors/user';

class BranchManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      branchParams: null,
    };
  }
  componentDidMount() {
    branch.subscribe(({error, params, url}) => {
      if (error) {
        console.log('Error from branch:', error);
        return;
      }
      this.setState({branchParams: params});
    });
  }
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'BranchManager',
    });
  }

  componentDidUpdate(prevProps) {
    const {branchParams} = this.state;
    const {userConnected} = this.props;

    if (branchParams) {
      const {type} = branchParams;
      if (!userConnected && type) return navigate('SignIn');
      return this.executeBranchInstruction();
    }
  }

  async executeBranchInstruction() {
    const {branchParams} = this.state;
    const {userID} = this.props;

    const {type, sentBy} = branchParams;
    switch (type) {
      case 'invite': {
        const session = await createCoachSessionFromUserIDs(sentBy, [userID]);
        logMixpanel({
          label: 'Open invite conversation link ' + session.objectID,
        });
        navigate('Conversation', {id: session.objectID});
        break;
      }
      case 'session': {
        const sessionID = getSessionFromBranchParams(branchParams);
        logMixpanel({
          label: 'Open invite session link ' + sessionID,
        });
        if (sessionID) {
          this.handleSessionInvite(sessionID, userID, sentBy);
        }
        break;
      }
      case 'archives': {
        const archives = getArchivesFromBranchParams(branchParams);
        logMixpanel({
          label: 'Open invite videos link ',
          params: {archives},
        });
        if (archives) {
          archives.forEach((archiveID) =>
            shareCloudVideo(userID, archiveID, sentBy),
          );
        }
        break;
      }
      default: {
      }
    }
  }

  async handleSessionInvite(sessionID, userID, sentBy) {
    const coachSessionFirebase = await getValueOnce(
      `coachSessions/${sessionID}`,
    );
    if (coachSessionFirebase) {
      await store.dispatch(setSession(coachSessionFirebase));
      if (sentBy !== userID)
        await addMembersToSessionByID(sessionID, [userID], sentBy);
      if (
        coachSessionFirebase.members[sentBy] &&
        coachSessionFirebase.members[sentBy].isConnected
      ) {
        sessionOpening(coachSessionFirebase);
      } else {
        navigate('Conversation', {id: sessionID});
      }
    } else {
      const session = await createCoachSessionFromUserIDs(
        sentBy,
        [userID],
        sessionID,
      );
      navigate('Conversation', {id: session.objectID});
    }
  }

  render = () => {
    return null;
  };
}

const mapStateToProps = (state) => {
  return {
    userID: userIDSelector(state),
    userConnected: userConnectedSelector(state),
  };
};

export default connect(mapStateToProps)(BranchManager);
