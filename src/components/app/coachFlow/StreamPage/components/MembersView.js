import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';

import ImageUser from '../../../../layout/image/ImageUser';
import {coachAction} from '../../../../../actions/coachActions';

import sizes from '../../../../style/sizes';
import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';

class MembersView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  cardMember(member, i) {
    return (
      <Row key={i} style={styles.button}>
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
    backgroundColor: colors.transparentGrey,
    borderRadius: 4,
    left: 20,

    zIndex: 5,
    top: sizes.heightHeaderHome + 10,
    width: 130,
  },
  button: {
    flex: 1,
    width: '100%',
    paddingLeft: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps, {coachAction})(MembersView);
