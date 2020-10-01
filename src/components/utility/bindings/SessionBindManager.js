import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindSession, unbindSession} from '../../database/firebase/bindings';

class SessionBindManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasFirebaseBinding: {},
    };
  }
  componentDidMount() {
    this.updateBindings(this.props.bindCounts);
  }

  componentDidUpdate(prevProps) {
    const {bindCounts: prevBindCounts} = prevProps;
    const {bindCounts} = this.props;
    if (bindCounts && prevBindCounts) {
      const matchedBindCounts = Object.keys(bindCounts).reduce(
        (prevMatched, id) => {
          return prevMatched && prevBindCounts[id] === bindCounts[id];
        },
        true,
      );
      if (!matchedBindCounts) {
        this.updateBindings(bindCounts);
      }
    }
  }

  updateBindings(newBindCounts) {
    if (newBindCounts) {
      let hasFirebaseBinding = {...this.state.hasFirebaseBinding};
      Object.keys(newBindCounts).forEach((id) => {
        const count = newBindCounts[id];
        if ((!count || count === 0) && hasFirebaseBinding[id]) {
          hasFirebaseBinding[id] = false;
          unbindSession(id);
        } else if (count && count > 0 && !hasFirebaseBinding[id]) {
          hasFirebaseBinding[id] = true;
          bindSession(id);
        }
      });
      this.setState({hasFirebaseBinding});
    }
  }

  render = () => null;
}

const mapStateToProps = (state) => {
  return {
    bindCounts: state.bindedSessions,
  };
};

export default connect(
  mapStateToProps,
  {},
)(SessionBindManager);
