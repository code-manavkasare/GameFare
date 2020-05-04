import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';

import ImageUser from '../../../../../../layout/image/ImageUser';
import {coachAction} from '../../../../../../../actions/coachActions';

import sizes, {marginTopApp} from '../../../../../../style/sizes';
import colors from '../../../../../../style/colors';
import styleApp from '../../../../../../style/style';
import {navigate} from '../../../../../../../../NavigationService';

class MembersView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  cardMember(member, i) {
    return (
      <Row key={i} style={styles.button}>
        <Col style={styleApp.center2} size={40}>
          <ImageUser
            user={member}
            onClick={() => {
              console.log('click img user 2');
              navigate('ProfilePage', {user: member});
            }}
          />
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
    const {userID, members, hide, card} = this.props;
    if (!members || hide) return null;
    const membersDisplay = Object.values(members).filter(
      (member) => member.id !== userID && member.isConnected,
    );
    if (card)
      return (
        <View style={styles.rowImgCard}>
          {membersDisplay.map((member, i) => (
            <View key={i} style={styles.colImg}>
              <ImageUser
                user={member}
                onClick={() => {
                  console.log('click img user 1');
                }}
              />
            </View>
          ))}
        </View>
      );
    return (
      <View style={styles.colButtonsRight}>
        {membersDisplay.map((member, i) => this.cardMember(member, i))}
      </View>
    );
  }
  render() {
    return this.membersView();
  }
}

const styles = StyleSheet.create({
  colButtonsRight: {
    flex: 1,
    position: 'absolute',
    backgroundColor: colors.transparentGrey,
    borderRadius: 4,
    left: '5%',

    zIndex: 2,
    top: sizes.heightHeaderHome + marginTopApp + 10,
    width: 130,
  },
  rowImgCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    position: 'absolute',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
  },
  colImg: {
    height: 50,
    width: 50,
    flexDirection: 'column',
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

export default connect(
  mapStateToProps,
  {coachAction},
)(MembersView);
