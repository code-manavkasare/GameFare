import React, {Component} from 'react';
import {connect} from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import {connectionTypeAction} from '../../actions';

class ConnectionTypeProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.unsubscribe = null;
  }
  componentDidMount() {
    const {connectionTypeAction} = this.props;
    this.unsubscribe = NetInfo.addEventListener((state) => {
      connectionTypeAction('setConnectionType', state.type);
    });
  }
  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
  render = () => null
}

const mapStateToProps = (state) => {
  return {
    connectionType: state.connectionType.type,
  };
};

export default connect(
  mapStateToProps,
  {connectionTypeAction},
)(ConnectionTypeProvider);