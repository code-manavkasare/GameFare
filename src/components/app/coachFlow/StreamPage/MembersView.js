import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image} from 'react-native';
import {connect} from 'react-redux';
import firebase from 'react-native-firebase';

import NavigationService from '../../../../../NavigationService';

import ButtonColor from '../../../layout/Views/Button';
import AllIcons from '../../../layout/icons/AllIcons';
import ImageUser from '../../../layout/image/ImageUser';
import {coachAction} from '../../../../actions/coachActions';
import {Col, Row} from 'react-native-easy-grid';

import sizes from '../../../style/sizes';
import colors from '../../../style/colors';
import styleApp from '../../../style/style';

class MembersView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  cardMember(member, i) {
    return (
      <Row key={i} style={{paddingTop: 5, paddingBottom: 5}}>
        <Col style={styleApp.center2} size={40}>
          <ImageUser user={member} />
        </Col>
        <Col style={styleApp.center2} size={60}>
          <Text style={[styleApp.text, {color: colors.white}]}>
            {member.info.firstname}
          </Text>
        </Col>
      </Row>
    );
  }
  membersView() {
    const {userID, session} = this.props;
    if (!session) return null;
    const members = Object.values(session.members).filter(
      (member) => member.id !== userID && member.isConnected,
    );
    return (
      <View style={styles.colButtonsRight}>
        {members.map((member, i) => this.cardMember(member, i))}
      </View>
    );
  }
  render() {
    const {session} = this.props;
    if (!session) return null;
    return this.membersView(session);
  }
}

const styles = StyleSheet.create({
  colButtonsRight: {
    flex: 1,
    position: 'absolute',
    left: 20,
    zIndex: 5,
    top: sizes.heightHeaderHome + 10,
    width: 130,
  },
  button: {height: 65, width: '100%'},
  textButton: {
    fontSize: 11,
    marginTop: 7,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    settings: state.coach.settings,
  };
};

export default connect(mapStateToProps, {coachAction})(MembersView);
