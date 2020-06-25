import React, {Component} from 'react';
import {Text, View, StyleSheet, Dimensions} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import database from '@react-native-firebase/database';

import {createCoachSession, timeout} from '../../../../functions/coach';
import {coachAction} from '../../../../../actions/coachActions';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import {width, heightHeaderStream, marginTopApp} from '../../../../style/sizes';
import ButtonColor from '../../../../layout/Views/Button';
import Loader from '../../../../layout/loaders/Loader';
import AllIcons from '../../../../layout/icons/AllIcons';

import Mixpanel from 'react-native-mixpanel';
import {mixPanelToken} from '../../../../database/firebase/tokens';
Mixpanel.sharedInstanceWithToken(mixPanelToken);

class HeaderListStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }

  header = () => {
    const {
      userConnected,
      navigation,
      coachAction,
      closeSession,
      hideButtonNewSession,
    } = this.props;
    const {loader} = this.state;
    return (
      <Row style={styles.header}>
        <Col size={85} style={styleApp.center2}>
          <Text style={[styleApp.title, {fontSize: 18}]}>
            Stream your performance
          </Text>
        </Col>

        {!hideButtonNewSession && (
          <Col size={15} style={styleApp.center3}>
            <ButtonColor
              view={() => {
                return loader ? (
                  <Loader size={35} color={colors.white} />
                ) : (
                  <AllIcons
                    name="plus"
                    color={colors.white}
                    size={18}
                    type="font"
                  />
                );
              }}
              color={colors.green}
              style={styles.buttonNewSession}
              click={async () => {
                if (!userConnected) return navigation.navigate('SignIn');
                const {userID, infoUser, coachAction, sessionInfo} = this.props;
                const {objectID: prevObjectID} = sessionInfo;
                await this.setState({loader: true});

                const currentOpenSession = sessionInfo.objectID;
                if (currentOpenSession) {
                  await closeSession(currentOpenSession);
                  // we await a bit so that the stream is 100% sure detroyed.
                  timeout(300);
                }
                const objectID = await createCoachSession({
                  id: userID,
                  info: infoUser,
                });
                await coachAction('setSessionInfo', {
                  objectID: objectID,
                  autoOpen: true,
                  // prevObjectID: 'teub',
                });
                Mixpanel.trackWithProperties('Create new session ' + objectID, {
                  userID,
                  objectID,
                });

                await database()
                  .ref(`users/${userID}/coachSessions/${objectID}`)
                  .set({
                    id: objectID,
                    timestamp: Date.now(),
                  });

                this.setState({loader: false});
              }}
              onPressColor={colors.greenClick}
            />
          </Col>
        )}
      </Row>
    );
  };

  render() {
    return this.header();
  }
}

const styles = StyleSheet.create({
  header: {
    marginTop: marginTopApp,
    height: heightHeaderStream,
    borderBottomWidth: 1,
    borderColor: colors.off,
    paddingLeft: '5%',
    paddingRight: '5%',
  },
  buttonNewSession: {
    ...styleApp.center,
    borderRadius: 22.5,
    height: 45,
    width: 45,
  },
  rowButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // marginTop: 20,
    width: width,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    userConnected: state.user.userConnected,
    sessionInfo: state.coach.sessionInfo,
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(HeaderListStream);
