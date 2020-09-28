import React, {Component} from 'react';
import CallDetectorManager from 'react-native-call-detection';
import {closeSession} from '../functions/coach';


export default class CallListener extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasFirebaseBinding: {},
    };
    this.callDetector = null;
  }
  componentDidMount() {
    this.startListener();
  }

  componentWillUnmount() {
    this.callDetector && this.callDetector.dispose();
  }

  startListener() {
    this.callDetector = new CallDetectorManager((event) => {
      if (event === 'Connected') {
        closeSession({noNavigation: true});
      } else {
        // Incoming || Disconnected || Dialing
      }
    });
  }

  render = () => null;

}
