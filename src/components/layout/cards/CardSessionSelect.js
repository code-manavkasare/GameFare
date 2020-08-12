import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';

import ButtonColor from '../Views/Button';
import colors from '../../style/colors';
import AllIcons from '../../layout/icons/AllIcons';
import AsyncImage from '../image/AsyncImage';
import styleApp from '../../style/style';

import {
  imageCardTeam,
  sessionTitle,
} from '../../app/TeamPage/components/elements';

export default class CardContactSelect extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {session, selected, select} = this.props;
    return (
    <ButtonColor
        color={colors.white}
        onPressColor={colors.off}
        click={() => select(session)}
        style={[
          styles.cardContact,
        ]}
        view={() => {
          return (
            <Row style={{paddingTop: 10, paddingBottom: 10}}>
              <Col size={30}>
                {imageCardTeam(session)}
              </Col>
              <Col size={55} style={[styleApp.center2, {paddingRight: 6}]}>
                {sessionTitle(session, {}, false)}
              </Col>
              <Col size={10} />
              <Col size={10} style={styleApp.center3}>
                <AllIcons
                  name={selected ? 'check-circle' : 'circle'}
                  type="font"
                  size={23}
                  color={colors.primary}
                />
              </Col>
            </Row>
          );
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
  cardContact: {
    height: 75,
    paddingLeft: '5%',
    paddingRight: '5%',
  },
});

CardContactSelect.propTypes = {
  contact: PropTypes.shape({
    id: PropTypes.string,
    firstname: PropTypes.string,
    lastname: PropTypes.string,
    phoneNumber: PropTypes.string,
  }).isRequired,
  selected: PropTypes.bool,
  select: PropTypes.func,
};
