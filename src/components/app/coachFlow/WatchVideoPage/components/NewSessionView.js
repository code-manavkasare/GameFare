import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import {Col, Row} from 'react-native-easy-grid';

import Button from '../../../../layout/buttons/Button';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import {timeout} from '../../../../functions/coach';
import {heightFooter} from '../../../../style/sizes';
import {footerRef} from '../../../../../../NavigationService';

export default class NewSessionView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  buttonCurrentSession() {
    const {
      currentSessionID,
      loadCoachSession,
      userConnected,
      navigation,
      layoutAction,
      setState,
    } = this.props;
    if (currentSessionID === '') return null;
    return (
      <Button
        backgroundColor="green"
        onPressColor={colors.greenClick}
        //   styleButton={[styleApp.marginView, {paddingBottom: 20}]}
        enabled={true}
        styleButton={{marginBottom: 20}}
        text="Resume session"
        loader={false}
        click={async () => {
          if (!userConnected) return navigation.navigate('SignIn');
          // footerRef.translateFooter(false);
          await layoutAction('setLayout', {isFooterVisible: false});
          await timeout(100);
          await setState({
            loader: true,
            displayHomeView: false,
          });
          loadCoachSession(currentSessionID);
        }}
      />
    );
  }
  buttonNewSession() {
    const {
      loadCoachSession,
      userConnected,
      navigation,
      userAction,
      currentSessionID,
      setState,
      layoutAction,
      endCoachSession,
    } = this.props;
    return (
      <Button
        backgroundColor="primary"
        onPressColor={colors.primaryLight}
        //  styleButton={styleApp.marginView}
        enabled={true}
        text="New session"
        loader={false}
        click={async () => {
          if (!userConnected) return navigation.navigate('SignIn');
          await layoutAction('setLayout', {isFooterVisible: false});
          await timeout(100);
          await endCoachSession(currentSessionID);
          await setState({
            loader: true,
            displayHomeView: false,
          });

          loadCoachSession();
        }}
      />
    );
  }
  listSessions() {
    const {error} = this.props;
    return (
      <View style={styles.page}>
        <View style={styleApp.marginView}>
          {this.buttonCurrentSession()}

          {this.buttonNewSession()}
        </View>

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
    return this.listSessions();
  }
}

const styles = StyleSheet.create({
  page: {
    ...styleApp.center2,
    ...styleApp.fullSize,
    backgroundColor: colors.title,
    paddingBottom: heightFooter,
    position: 'absolute',
    zIndex: 20,
  },
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
