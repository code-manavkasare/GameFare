import React, {Component} from 'react';
import {View, Animated} from 'react-native';

import styleApp from '../../style/style';

import HeaderSearch from './components/HeaderSearch';
import SearchBody from './components/SearchBody';
import SearchInput from '../../layout/textField/SearchInput';

export default class searchPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchFor: props.route?.params?.searchFor ?? 'users',
      action: props.route?.params?.action ?? 'call',
      archivesToShare: props.route?.params?.archivesToShare ?? [],
      sessionToInvite: props.route?.params?.sessionToInvite ?? '',
      onConfirm: props.route?.params?.onConfirm ?? null,
      branchLink: props.route?.params?.branchLink ?? null,
      selectOne: props.route?.params?.selectOne ?? false,
      defaultList: props.route?.params?.defaultList ?? false,
      defaultHeader: props.route?.params?.defaultHeader ?? false,
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
      searchFor,
      selectOne,
      defaultList,
      defaultHeader,
    } = this.state;
    const {goBack} = this.props.navigation;
    return (
      <View style={styleApp.stylePage}>
        <HeaderSearch
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          searchBar={
            <SearchInput
              searchFor={searchFor}
              autoFocus={!defaultList}
              search={(text) => this.searchBodyRef.setState({searchText: text})}
            />
          }
          branchLink={branchLink}
          goBack={() => goBack()}
        />
        <SearchBody
          searchFor={searchFor}
          action={action}
          onRef={(ref) => {
            this.searchBodyRef = ref;
          }}
          selectOne={selectOne}
          archivesToShare={archivesToShare}
          sessionToInvite={sessionToInvite}
          onConfirm={onConfirm}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          defaultList={defaultList}
          defaultHeader={defaultHeader}
        />
      </View>
    );
  }
}
