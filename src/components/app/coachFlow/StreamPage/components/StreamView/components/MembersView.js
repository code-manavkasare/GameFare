import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';

import ImageUser from '../../../../../../layout/image/ImageUser';
import styleApp from '../../../../../../style/style';
import {coachAction} from '../../../../../../../actions/coachActions';

import {
  marginTopApp,
  heightHeaderHome,
  marginTopAppLandscape,
} from '../../../../../../style/sizes';
import {navigate} from '../../../../../../../../NavigationService';
import AddFlagButton from '../footer/components/AddFlagButton';

class MembersView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  cardMember(member) {
    const {coachSessionID} = this.props;
    return (
      <Row key={member.id} style={styles.cardMember}>
        <Col size={50} style={styleApp.center2}>
          <ImageUser
            styleImgProps={{height: 45, width: 45, borderRadius: 30}}
            user={member}
          />
        </Col>
        <Col size={50} style={styleApp.center}>
          <AddFlagButton coachSessionID={coachSessionID} member={member} />
        </Col>
      </Row>
    );
  }
  membersView() {
    const {userID, members, hide, currentScreenSize} = this.props;
    console.log('members view', members, hide);
    if (!members || hide) return null;
    const membersDisplay = Object.values(members).filter(
      (member) => member.isConnected && member.id !== userID,
    );
    const {portrait} = currentScreenSize;
    let marginTop = marginTopApp;
    if (!portrait) marginTop = marginTopAppLandscape;
    console.log('membersDisplay', membersDisplay);
    return (
      <View style={[styles.listMembers, {top: heightHeaderHome + marginTop}]}>
        {membersDisplay.map((member) => this.cardMember(member))}
      </View>
    );
  }
  render() {
    return this.membersView();
  }
}

const styles = StyleSheet.create({
  listMembers: {
    flex: 1,
    position: 'absolute',
    left: '5%',
    zIndex: 6,
  },
  cardMember: {
    height: 35,
    width: 110,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    currentScreenSize: state.layout.currentScreenSize,
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(MembersView);
