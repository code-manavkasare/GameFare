import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {Col, Row, Grid} from 'react-native-easy-grid';

import Button from '../buttons/Button';
import ButtonColor from '../Views/Button';
import colors from '../../style/colors';
import AllIcons from '../../layout/icons/AllIcons';
import styleApp from '../../style/style';

export default class Alert extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  async clickButton(val) {
    const {onGoBack} = this.props;
    onGoBack(val);
  }
  button(valClick, text, icon) {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col style={styleApp.center2} size={13}>
                <AllIcons
                  name={icon}
                  type="font"
                  color={colors.title}
                  size={20}
                />
              </Col>
              <Col style={styleApp.center2} size={77}>
                <Text style={styleApp.text}>{text}</Text>
              </Col>
              <Col size={10} style={styleApp.center3}>
                <AllIcons
                  type="mat"
                  name="keyboard-arrow-right"
                  size={17}
                  color={colors.greyDark}
                />
              </Col>
            </Row>
          );
        }}
        click={() => this.clickButton(valClick)}
        color="white"
        style={styles.buttonList}
        onPressColor={colors.off}
      />
    );
  }
  render() {
    const {close} = this.props;
    return (
      <View>
        {this.button('take', 'Take Photo', 'camera')}
        {this.button('pick', 'Choose from Library', 'image')}

        <View style={styleApp.marginView}>
          <Button
            backgroundColor={'green'}
            disabled={false}
            styleButton={{marginTop: 10}}
            onPressColor={colors.greenClick}
            text={'Close'}
            click={() => close()}
            loader={this.state.loader}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonList: {
    height: 55,
    width: '100%',
    marginLeft: 0,
    paddingLeft: 20,
    paddingRight: 20,
    borderTopWidth: 0,
    borderColor: colors.off,
  },
});
