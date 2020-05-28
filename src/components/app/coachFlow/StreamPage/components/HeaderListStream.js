import React, {Component} from 'react';
import {Text, View, StyleSheet, Dimensions} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import database from '@react-native-firebase/database';

import {createCoachSession} from '../../../../functions/coach';
import {coachAction} from '../../../../../actions/coachActions';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import {width, heightHeaderStream} from '../../../../style/sizes';
import ButtonColor from '../../../../layout/Views/Button';
import Loader from '../../../../layout/loaders/Loader';
import AllIcons from '../../../../layout/icons/AllIcons';

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
                const {userID, infoUser, coachAction} = this.props;
                await this.setState({loader: true});
                const objectID = await createCoachSession({
                  id: userID,
                  info: infoUser,
                });
                await coachAction('setSessionInfo', {
                  objectID: objectID,
                  autoOpen: true,
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
    height: heightHeaderStream,
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
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(HeaderListStream);
