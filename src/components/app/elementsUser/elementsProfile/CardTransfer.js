import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {connect} from 'react-redux';
import moment from 'moment';
const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';

import styleApp from '../../../style/style';
import ButtonColor from '../../../layout/Views/Button';
import colors from '../../../style/colors';
import {FormatDate} from '../../../functions/date';

export default class CardTransfer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  async componentDidMount() {}
  signTransfer(transfer) {
    if (transfer.type === 'minus') return '-';
    return '+';
  }
  render() {
    const {transfer} = this.props;
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={30} style={styleApp.center}>
                <Text
                  style={[
                    styleApp.title,
                    {
                      color:
                        transfer.type === 'minus' ? colors.red : colors.green,
                      fontSize: 19,
                    },
                  ]}>
                  {this.signTransfer(transfer)}${transfer?.invoice?.totalPrice}
                </Text>
              </Col>
              <Col size={60} style={styleApp.center2}>
                <Text style={[styleApp.titleSmall, {fontSize: 16}]}>
                  {transfer.title}
                </Text>
                <Text style={[styleApp.subtitle, {marginTop: 4, fontSize: 14}]}>
                  <FormatDate date={moment(transfer.date).toDate()} />
                </Text>
              </Col>
              <Col size={10} style={styleApp.center}>
                {/* <AllIcons
                  name="keyboard-arrow-down"
                  color={colors.grey}
                  size={20}
                  type="mat"
                /> */}
              </Col>
            </Row>
          );
        }}
        click={() => true}
        color="white"
        style={{
          //  flex: 1,
          height: 80,
          paddingTop: 10,
          paddingBottom: 10,
        }}
        onPressColor={colors.off}
      />
    );
  }
}
