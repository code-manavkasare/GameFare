import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import {Col, Row} from 'react-native-easy-grid';

import Button from '../../../../layout/buttons/Button';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';

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
      error,
      navigation,
      userAction,
    } = this.props;
    return (
      <View
        style={[
          styleApp.center2,
          styleApp.fullSize,
          {backgroundColor: colors.title},
        ]}>
        <Button
          backgroundColor="green"
          onPressColor={colors.greenClick}
          styleButton={styleApp.marginView}
          enabled={true}
          text="Resume session"
          loader={false}
          click={async () => {
            if (!userConnected) return navigation.navigate('SignIn');
            await setState({
              loader: true,
              newSession: false,
              isConnected: false,
            });
            await userAction('hideFooterApp');
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
            if (!userConnected) return navigation.navigate('SignIn');
            await setState({
              loader: true,
              isConnected: false,
            });
            loadCoachSession();
          }}
        />

        {error && (
          <Row style={styles.rowError}>
            <Col style={styleApp.center}>
              <Text style={styles.textError}>{error.message}</Text>
            </Col>
          </Row>
        )}
      </View>
    );
  }

  render() {
    return this.newSessionView();
  }
}

const styles = StyleSheet.create({
  textError: {
    ...styleApp.text,
    color: colors.white,
    fontSize: 15,
  },
  rowError: {
    marginTop: 30,
    height: 40,
  },
});

NewSessionView.propTypes = {
  userConnected: PropTypes.bool,
  currentSessionID: PropTypes.string,
  loadCoachSession: PropTypes.func,
  setState: PropTypes.setState,
};
