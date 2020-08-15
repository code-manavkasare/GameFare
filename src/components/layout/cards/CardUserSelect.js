import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';

import ButtonColor from '../Views/Button';
import colors from '../../style/colors';
import AllIcons from '../../layout/icons/AllIcons';
import AsyncImage from '../image/AsyncImage';
import styleApp from '../../style/style';

export default class CardUserSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  cardUser(user, usersSelected) {
    let {marginOnScrollView, hideIcon, captain} = this.props;
    if (!captain) captain = {};
    let userSelected = false;
    let userID = user.id;
    if (!userID) userID = user.objectID;
    if (usersSelected) userSelected = usersSelected[userID];
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={15} style={styleApp.center2}>
                {user.info.picture ? (
                  <AsyncImage
                    style={styles.imgUser}
                    mainImage={user.info.picture}
                    imgInitial={user.info.picture}
                  />
                ) : (
                  <View style={[styleApp.center, styles.imgUser]}>
                    <Text style={[styleApp.text, {fontSize: 12}]}>
                      {user?.info?.firstname[0]}
                      {user.info.lastname !== '' ? user.info.lastname[0] : ''}
                    </Text>
                  </View>
                )}
              </Col>

              <Col size={75} style={styleApp.center2}>
                <Text style={styleApp.text}>
                  {user.info.firstname} {user.info.lastname}
                </Text>
              </Col>
              <Col size={10} style={styleApp.center3}>
                {captain.id === user.objectID ? (
                  <View style={[styleApp.roundView, {width: 100}]}>
                    <Text style={styleApp.text}>Captain</Text>
                  </View>
                ) : (
                  !hideIcon && (
                    <AllIcons
                      name={userSelected ? 'check-circle' : 'circle'}
                      type="font"
                      size={23}
                      color={colors.primary}
                    />
                  )
                )}
              </Col>
            </Row>
          );
        }}
        click={() => this.props.selectUser(userSelected, user, usersSelected)}
        color="white"
        style={[
          styles.cardUser,
          marginOnScrollView && {paddingLeft: 0, paddingRight: 0},
        ]}
        onPressColor={colors.off2}
      />
    );
  }
  render() {
    const {user, usersSelected} = this.props;
    return this.cardUser(user, usersSelected);
  }
}

const styles = StyleSheet.create({
  cardUser: {
    height: 55,
    paddingLeft: '5%',
    paddingRight: '5%',
  },
  imgUser: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.off,
  },
});

CardUserSelect.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    info: PropTypes.object,
  }).isRequired,
  usersSelected: PropTypes.object,
  selectUser: PropTypes.func,
  hideIcon: PropTypes.bool,
};
