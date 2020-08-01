import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';

import ButtonColor from '../Views/Button';
import colors from '../../style/colors';
import AllIcons from '../../layout/icons/AllIcons';
import AsyncImage from '../image/AsyncImage';
import styleApp from '../../style/style';

export default class CardContactSelect extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {contact, selected, select} = this.props;
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={15} style={styleApp.center2}>
                {contact.picture ? (
                  <AsyncImage
                    style={styles.imgContact}
                    mainImage={contact.picture}
                    imgInitial={contact.picture}
                  />
                ) : (
                  <View style={[styleApp.center, styles.imgContact]}>
                    <Text style={[styleApp.text, {fontSize: 12}]}>
                      {contact.firstname[0]}
                      {contact.lastname !== '' ? contact.lastname[0] : ''}
                    </Text>
                  </View>
                )}
              </Col>

              <Col size={75} style={styleApp.center2}>
                <Text style={styleApp.text}>
                  {contact.firstname} {contact.lastname}
                </Text>
              </Col>
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
        click={() => select(contact)}
        color="white"
        style={[
          styles.cardContact,
        ]}
        onPressColor={colors.off2}
      />
    );
  }
}

const styles = StyleSheet.create({
  cardContact: {
    height: 55,
    paddingLeft: '5%',
    paddingRight: '5%',
  },
  imgContact: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.off,
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
