import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';

import Button from '../../../../layout/buttons/Button';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import NavigationService from '../../../../../../NavigationService';

export default class NewSessionView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  newSessionView() {
    const {
      currentSessionID,
      loadCoachSession,
      setState,
      userConnected,
    } = this.props;
    return (
      <View style={[styleApp.center2, styleApp.fullSize]}>
        <Button
          backgroundColor="green"
          onPressColor={colors.greenClick}
          styleButton={styleApp.marginView}
          enabled={true}
          text="Resume session"
          loader={false}
          click={async () => {
            if (!userConnected) return NavigationService.navigate('SignIn');
            await setState({
              loader: true,
              newSession: false,
              isConnected: false,
            });
            loadCoachSession(currentSessionID);
          }}
        />
        <View style={{height: 20}} />
        <Button
          backgroundColor="primary"
          onPressColor={colors.primaryLight}
          styleButton={styleApp.marginView}
          enabled={true}
          text="New session"
          loader={false}
          click={async () => {
            console.log('userConnected!!', userConnected);
            if (!userConnected) return NavigationService.navigate('SignIn');
            await this.setState({
              loader: true,
              newSession: false,
              isConnected: false,
            });
            loadCoachSession();
          }}
        />
      </View>
    );
  }

  render() {
    return this.newSessionView();
  }
}

NewSessionView.propTypes = {
  userConnected: PropTypes.bool,
  currentSessionID: PropTypes.string,
  loadCoachSession: PropTypes.func,
  setState: PropTypes.setState,
};
