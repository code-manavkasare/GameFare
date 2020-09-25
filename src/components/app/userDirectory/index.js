import React, {Component} from 'react';
import {View, Animated} from 'react-native';

import styleApp from '../../style/style';

import {getSelectionActionDecorations} from '../../functions/utility';

import HeaderUserDirectory from './components/HeaderUserDirectory';
import BodyUserDirectory from './components/BodyUserDirectory';

export default class userDirectoryPage extends Component {
  constructor(props) {
    super(props);
    const action = props.route?.params?.action ?? 'call';
    const {actionText} = getSelectionActionDecorations(action);
    this.state = {
      action,
      actionText,
      archivesToShare: props.route?.params?.archivesToShare ?? [],
      branchLink: props.route?.params?.branchLink ?? null,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  render() {
    const {action, actionText, archivesToShare, branchLink} = this.state;
    const {goBack} = this.props.navigation;
    return (
      <View style={styleApp.stylePage}>
        <HeaderUserDirectory
          branchLink={branchLink}
          goBack={() => goBack()}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
        />
        <BodyUserDirectory
          action={action}
          actionText={actionText}
          archivesToShare={archivesToShare}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
        />
      </View>
    );
  }
}
