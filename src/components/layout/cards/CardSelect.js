import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import PropTypes from 'prop-types';

import {Col, Row} from 'react-native-easy-grid';
import ButtonColor from '../Views/Button';
import colors from '../../style/colors';
import AllIcons from '../../layout/icons/AllIcons';
import Loader from '../../layout/loaders/Loader'
import styleApp from '../../style/style';


export default class CardUserSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  async clickCard(option) {
    const {click:clickOption} = option
    const {click:clickProps,next} = this.props

    await clickProps(option,promiseDataLoaded)
    const {dataPromise} = this.props
    let promiseDataLoaded = false
    
    if (clickOption) promiseDataLoaded = await clickOption(dataPromise)
    return next(option,promiseDataLoaded)
  }
  card() {
    const {marginOnScrollView, selected, option, iconRight} = this.props;
    const {icon, label,loader,click} = option;

    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={15} style={styleApp.center2}>
                <AllIcons
                  type={icon.type}
                  name={icon.name}
                  size={20}
                  color={colors.title}
                />
              </Col>

              <Col size={75} style={styleApp.center2}>
                <Text style={styleApp.text}>{label}</Text>
              </Col>
              <Col size={10} style={styleApp.center3}>
                {
                loader?
                <Loader size={23} color={'blue'} />
                :iconRight ? (
                  <AllIcons
                    name={iconRight.name}
                    type={iconRight.type}
                    size={23}
                    color={colors.greyDark}
                  />
                ) : (
                  <AllIcons
                    name={selected ? 'check-circle' : 'circle'}
                    type="font"
                    size={23}
                    color={colors.primary}
                  />
                )}
              </Col>
            </Row>
          );
        }}
        click={() => this.clickCard(option,click)}
        color={colors.off2}
        style={[
          styles.cardUser,
          marginOnScrollView && {paddingLeft: 0, paddingRight: 0},
        ]}
        onPressColor={colors.off}
      />
    );
  }
  render() {
    return this.card();
  }
}

CardUserSelect.propTypes = {
  marginOnScrollView: PropTypes.bool,
  selected: PropTypes.bool,
  option: PropTypes.object.isRequired,
  click: PropTypes.func.isRequired,
  iconRight: PropTypes.object,
};

const styles = StyleSheet.create({
  cardUser: {
    height: 55,
    paddingLeft: 20,
    paddingRight: 20,
  },
  imgUser: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.off,
  },
});
