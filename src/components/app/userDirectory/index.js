import React, {Component} from 'react';
import {View, Animated} from 'react-native';

import styleApp from '../../style/style';

import {getSelectionActionDecorations} from '../../functions/utility';

import HeaderUserDirectory from './components/HeaderUserDirectory';
import BodyUserDirectory from './components/BodyUserDirectory';
import SearchInput from '../../layout/textField/SearchInput';

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
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          searchBar={
            <SearchInput
              autoFocus
              search={(text) =>
                this.bodyUserDirectoryRef.setState({searchText: text})
              }
            />
          }
          branchLink={branchLink}
          goBack={() => goBack()}
        />
        <BodyUserDirectory
          action={action}
          onRef={(ref) => {
            this.bodyUserDirectoryRef = ref;
          }}
          actionText={actionText}
          archivesToShare={archivesToShare}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
        />
      </View>
    );
  }
}
