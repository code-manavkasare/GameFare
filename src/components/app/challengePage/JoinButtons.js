import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {groupsAction} from '../../../actions/groupsActions';
import {messageAction} from '../../../actions/messageActions';
import {Col, Row, Grid} from 'react-native-easy-grid';

import Button from '../../layout/buttons/Button';
import colors from '../../style/colors';
import NavigationService from '../../../../NavigationService';
import {
  isUserAlreadyMember,
  isUserContactUser,
  isUserCaptainOfTeam,
} from '../../functions/createChallenge';

import styleApp from '../../style/style';

class JoinButtons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  componentDidMount() {}

  displayButton(challenge) {
    const {userID, userConnected} = this.props;
    return (
      !isUserAlreadyMember(challenge, userID, userConnected) &&
      !(challenge.info.organizer === userID)
    );
  }
  clickButton(challenge) {
    const {userID, userConnected} = this.props;
    if (!userConnected) return NavigationService.navigate('SignIn');
    if (isUserContactUser(challenge, userID))
      return NavigationService.navigate('JoinAsContact', {
        challenge: challenge,
      });
    return NavigationService.navigate('SummaryChallenge', {
      challenge: challenge,
      subscribe: true,
    });
  }
  joinButton(challenge) {
    const displayButton = this.displayButton(challenge);

    if (!displayButton) return null;
    return (
      <Row style={{marginTop: 20}}>
        <Col style={styleApp.center2}>
          <Button
            icon={'next'}
            backgroundColor={'green'}
            onPressColor={colors.greenLight}
            styleButton={{height: 45}}
            disabled={false}
            text={'Accept challenge'}
            loader={false}
            click={() => this.clickButton(challenge)}
          />
        </Col>
      </Row>
    );
  }
  render() {
    const {challenge} = this.props;
    return this.joinButton(challenge);
  }
}

const styles = StyleSheet.create({
  buttonJoin: {
    borderColor: colors.off,
    height: 40,
    width: 90,
    borderRadius: 20,
    borderWidth: 1,
  },
  buttonLeave: {
    borderColor: colors.off,
    height: 40,
    width: 100,
    borderRadius: 20,
    borderWidth: 1,
  },
});

const mapStateToProps = (state) => {
  return {
    userConnected: state.user.userConnected,
    infoUser: state.user.infoUser.userInfo,
    userID: state.user.userID,
  };
};

export default connect(
  mapStateToProps,
  {groupsAction, messageAction},
)(JoinButtons);
