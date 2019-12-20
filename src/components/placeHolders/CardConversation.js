import React, {PureComponent} from 'react';
import {
  View,
  Text,
  Dimensions,
  Image,
  ScrollView,
  Animated,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Col, Row, Grid} from 'react-native-easy-grid';

import styleApp from '../style/style';
import colors from '../style/colors';
import ButtonColor from '../layout/Views/Button';
import AllIcons from '../layout/icons/AllIcons';

export default class CardConversation extends PureComponent {
  cardConversation() {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={20} style={styleApp.center2}>
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={[colors.placeHolder1, colors.placeHolder2]}
                  style={[styles.roundImage, {borderWidth: 0}]}
                />
              </Col>
              <Col size={70} style={[styleApp.center2, {paddingLeft: 5}]}>
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={[colors.placeHolder1, colors.placeHolder2]}
                  style={{height: 20, width: '60%'}}
                />
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={[colors.placeHolder1, colors.placeHolder2]}
                  style={{height: 15, width: '80%', marginTop: 5}}
                />
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
        click={() => true}
        color="white"
        style={styleApp.cardConversation}
        onPressColor={colors.off}
      />
    );
  }
  render() {
    return this.cardConversation();
  }
}

const styles = StyleSheet.create({
  roundImage: {
    ...styleApp.center,
    backgroundColor: colors.off2,
    width: 55,
    height: 55,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: colors.borderColor,
  },
});
