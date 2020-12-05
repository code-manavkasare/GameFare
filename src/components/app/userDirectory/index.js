import React, {Component} from 'react';
import {View, Animated} from 'react-native';

import styleApp from '../../style/style';

import HeaderUserDirectory from './components/HeaderUserDirectory';
import BodyUserDirectory from './components/BodyUserDirectory';
import SearchInput from '../../layout/textField/SearchInput';

export default class userDirectoryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      action: props.route?.params?.action ?? 'call',
      archivesToShare: props.route?.params?.archivesToShare ?? [],
      sessionToInvite: props.route?.params?.sessionToInvite ?? '',
      onConfirm: props.route?.params?.onConfirm ?? null,
      branchLink: props.route?.params?.branchLink ?? null,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  render() {
    const {
      action,
      archivesToShare,
      sessionToInvite,
      onConfirm,
      branchLink,
    } = this.state;
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
          archivesToShare={archivesToShare}
          sessionToInvite={sessionToInvite}
          onConfirm={onConfirm}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
        />
      </View>
    );
  }
}
