import React, {Component} from 'react';
import {connect} from 'react-redux';
import {coachSessionsAction} from '../../../actions';

class CurrentSessionBinder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      boundSessionID: null,
    };
  }

  componentDidMount() {
    const {currentSessionID, coachSessionsAction} = this.props;
    if (currentSessionID) {
      coachSessionsAction('bindSession', currentSessionID);
      this.setState({boundSessionID: currentSessionID});
    }
  }

  componentDidUpdate(prevProps) {
    const {currentSessionID} = this.props;
    const {currentSessionID: prevSessionID} = prevProps;
    if (currentSessionID !== prevSessionID) {
      this.updateCurrentBinding(currentSessionID);
    }
  }

  componentWillUnmount() {
    const {boundSessionID, coachSessionsAction} = this.props;
    if (boundSessionID) {
      coachSessionsAction('unbindSession', boundSessionID);
    }
  }

  updateCurrentBinding(sessionID) {
    const {coachSessionsAction} = this.props;
    const {boundSessionID} = this.state;
    if (boundSessionID === sessionID) {
      console.log('ERROR: CurrentSessionBindManager instructed to bind the same session twice.');
      return;
    }
    if (boundSessionID) {
      coachSessionsAction('unbindSession', boundSessionID);
    }
    if (sessionID) {
      coachSessionsAction('bindSession', sessionID);
      this.setState({boundSessionID: sessionID});
    } else {
      this.setState({boundSessionID: null});
    }
  }

  render = () => null;
}

const mapStateToProps = (state) => {
  return {
    currentSessionID: state.coach.currentSessionID,
  };
};

export default connect(
  mapStateToProps,
  {coachSessionsAction},
)(CurrentSessionBinder);
