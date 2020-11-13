import React, {Component} from 'react';
import NetInfo from '@react-native-community/netinfo';

import {sentryAddBreadcrumb} from '../functions/logs.js';
import {store} from '../../store/reduxStore';
import {setConnectionType} from '../../store/actions/connectionTypeActions';
import {logMixpanel} from '../functions/logs';

export default class ConnectionTypeProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.unsubscribe = null;
  }
  componentDidMount() {
    this.unsubscribe = NetInfo.addEventListener((state) => {
      sentryAddBreadcrumb('networkInfo', `connectionType : ${state.type}`);
      store.dispatch(setConnectionType(state.type));
      logMixpanel({
        label: 'Change network: ' + state.type,
        params: {type: state.type},
      });
    });
  }
  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
  render = () => null;
}
