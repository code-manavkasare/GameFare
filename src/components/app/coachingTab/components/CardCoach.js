import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Text, StyleSheet} from 'react-native';
import StatusBar from '@react-native-community/status-bar';
import {Col, Row, Grid} from 'react-native-easy-grid';

import {navigate} from '../../../../../NavigationService';

import {coachAction} from '../../../../actions/coachActions';
import {layoutAction} from '../../../../actions/layoutActions';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import AllIcons from '../../../layout/icons/AllIcons';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import ButtonColor from '../../../layout/Views/Button';
import ImageUser from '../../../layout/image/ImageUser';

class CardCoach extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }

  card = () => {
    const {coach} = this.props;
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={20} style={styleApp.center2}>
                <ImageUser
                  user={coach}
                  onClick={() => true}
                  styleImgProps={styles.imgUser}
                />
              </Col>
              <Col
                size={60}
                style={[styleApp.center2, {paddingLeft: 5, paddingRight: 5}]}>
                <Text style={[styleApp.title, {fontSize: 18}]}>
                  {coach.info.firstname} {coach.info.lastname}
                </Text>
                <Text style={[styleApp.subtitle, {fontSize: 15}]}>
                  {coach.info.currencyRate} ${coach.info.hourlyRate} / hour
                </Text>
              </Col>
              <Col size={10} style={styleApp.center3}>
                <AllIcons
                  name="keyboard-arrow-right"
                  type="mat"
                  size={20}
                  color={colors.grey}
                />
              </Col>
            </Row>
          );
        }}
        click={() => navigate('ProfilePage', {user: coach})}
        color={colors.white}
        style={styleApp.cardConversation}
        onPressColor={colors.off}
      />
    );
  };

  render() {
    return this.card();
  }
}

const styles = StyleSheet.create({
  imgUser: {
    height: 55,
    width: 55,
    borderRadius: 30,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(
  mapStateToProps,
  {coachAction, layoutAction},
)(CardCoach);
