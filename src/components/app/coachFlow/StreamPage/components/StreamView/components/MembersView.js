import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';

import ImageUser from '../../../../../../layout/image/ImageUser';
import {coachAction} from '../../../../../../../actions/coachActions';

import {
  marginTopApp,
  heightHeaderHome,
  marginTopAppLandscape,
} from '../../../../../../style/sizes';
import {navigate} from '../../../../../../../../NavigationService';

class MembersView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  cardMember(member, i) {
    return (
      <ImageUser
        key={member.id}
        user={member}
        styleImgProps={{height: 50, width: 50, borderRadius: 25}}
        onClick={() => navigate('ProfilePage', {user: member})}
      />
    );
  }
  membersView() {
    const {userID, members, hide, currentScreenSize} = this.props;
    if (!members || hide) return null;
    const membersDisplay = Object.values(members).filter(
      (member) => member.id !== userID && member.isConnected,
    );
    const {portrait} = currentScreenSize;
    let marginTop = marginTopApp;
    if (!portrait) marginTop = marginTopAppLandscape;
    return (
      <View style={[styles.listMembers, {top: heightHeaderHome + marginTop}]}>
        {membersDisplay.map((member, i) => this.cardMember(member, i))}
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
    zIndex: 2,
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
