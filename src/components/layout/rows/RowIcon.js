import React, {Component} from 'react';
import {Text, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import {Col, Row} from 'react-native-easy-grid';

import ButtonColor from '../Views/Button';
import AllIcons from '../icons/AllIcons';

import colors from '../../style/colors';
import styleApp from '../../style/style';

export default class RowPlusMinus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  row() {
    const {label, click, icon, colorText} = this.props;
    const {size, name, color, type} = icon;
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={15} style={styleApp.center2}>
                <AllIcons
                  name={name}
                  type={type}
                  color={colorText}
                  size={size}
                />
              </Col>
              <Col size={85} style={styleApp.center2}>
                <Text style={[styleApp.text, {color: colorText}]}>{label}</Text>
              </Col>
            </Row>
          );
        }}
        click={() => click()}
        color={colors.white}
        style={styles.buttonPlus}
        onPressColor={colors.off}
      />
    );
  }
  render() {
    return this.row();
  }
}

const styles = StyleSheet.create({
  buttonPlus: {
    height: 50,
    width: '100%',
    paddingLeft: '5%',
    paddingRight: '5%',
  },
});

RowPlusMinus.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.object,
  click: PropTypes.func,
};
