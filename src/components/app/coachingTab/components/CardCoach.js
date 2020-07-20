import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Text, StyleSheet, View, Image} from 'react-native';
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

import {PriceView, BadgesView} from './ComponentsCard';

class CardCoach extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  card = () => {
    const {coach} = this.props;
    const {badges, lastname, firstname, hourlyRate} = coach.info;
    return (
      <ButtonColor
        view={() => {
          return (
            <Row style={{flex: 1}}>
              <Col size={20} style={styleApp.center2}>
                <ImageUser
                  user={coach}
                  onClick={() => true}
                  styleImgProps={styles.imgUser}
                />
              </Col>
              <Col size={60} style={[styleApp.center2]}>
                <Row style={{height: 30}}>
                  <Col>
                    <Text style={[styleApp.title, {fontSize: 18}]}>
                      {firstname} {lastname}
                    </Text>
                  </Col>
                </Row>

                {BadgesView({badges})}
              </Col>

              <Col size={10} style={styleApp.center3}>
                {PriceView({hourlyRate: hourlyRate})}
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
        style={[styleApp.cardConversation, {height: 120}]}
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
