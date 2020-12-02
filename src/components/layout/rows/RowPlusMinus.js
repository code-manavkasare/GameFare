import React, {Component} from 'react';
import {Text, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import {Col, Row} from 'react-native-easy-grid';

import ButtonColor from '../Views/Button';
import AllIcons from '../icons/AllIcons';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import NavigationService from '../../../../NavigationService';

export default class RowPlusMinus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  row() {
    const {title, alert, value, increment, add, textValue} = this.props;
    return (
      <Row style={{marginTop: 20}}>
        <Col style={styleApp.center2} size={30}>
          <Text style={styleApp.text}>{title}</Text>
        </Col>
        <Col
          activeOpacity={0.7}
          onPress={() => alert && NavigationService.navigate('Alert', alert)}
          style={styleApp.center2}
          size={5}>
          <AllIcons
            type={'font'}
            name={'info-circle'}
            color={colors.secondary}
            size={17}
          />
        </Col>
        <Col style={styleApp.center3} size={25}>
          <ButtonColor
            view={() => {
              return (
                <AllIcons
                  name="minus"
                  type="font"
                  color={colors.title}
                  size={15}
                />
              );
            }}
            click={() =>
              add && value !== increment.min && add(value - increment.step)
            }
            color={colors.off}
            style={styles.buttonPlus}
            onPressColor={colors.grey}
          />
        </Col>
        <Col style={styleApp.center3} size={25}>
          <ButtonColor
            view={() => {
              return (
                <AllIcons
                  name="plus"
                  type="font"
                  color={colors.title}
                  size={15}
                />
              );
            }}
            click={() =>
              add && value !== increment.max && add(value + increment.step)
            }
            color={colors.off}
            style={styles.buttonPlus}
            onPressColor={colors.grey}
          />
        </Col>
        <Col style={styleApp.center3} size={25}>
          <Text style={[styleApp.textBold, {fontSize: 19}]}>{textValue}</Text>
        </Col>
      </Row>
    );
  }
  render() {
    return this.row();
  }
}

const styles = StyleSheet.create({
  buttonPlus: {height: 45, width: '80%', borderRadius: 22.5},
});

RowPlusMinus.propTypes = {
  title: PropTypes.string.isRequired,
  alert: PropTypes.object,
  add: PropTypes.func,
  value: PropTypes.number.isRequired,
  increment: PropTypes.object.isRequired,
  textValue: PropTypes.string,
};
