import React, {Component} from 'react';
import {View, Animated} from 'react-native';
import {connect} from 'react-redux';

import styleApp from '../../../style/style';
import {heightHeaderHome} from '../../../style/sizes';

import tabsGroups from '../../../navigation/MainApp/components/GroupsPage';
import HeaderListStream from './components/HeaderListStream';
import {userIDSelector} from '../../../../store/selectors/user';
import {numberSessionsRequestsSelector} from '../../../../store/selectors/sessions';

class StreamTab extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  render() {
    const {navigation, numberSessionsRequests} = this.props;
    const tabBarVisible = numberSessionsRequests !== 0;
    return (
      <View style={styleApp.stylePage}>
        <HeaderListStream
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          onRef={(ref) => (this.HeaderRef = ref)}
          navigation={navigation}
        />
        <View
          style={{
            height: tabBarVisible ? heightHeaderHome : 0,
          }}
        />

        {tabsGroups({
          tabBarVisible,
          AnimatedHeaderValue:
            numberSessionsRequests === 0 && this.AnimatedHeaderValue,
          numberSesionRequests: numberSessionsRequests,
        })}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userID: userIDSelector(state),
    numberSessionsRequests: numberSessionsRequestsSelector(state),
  };
};

export default connect(mapStateToProps)(StreamTab);
