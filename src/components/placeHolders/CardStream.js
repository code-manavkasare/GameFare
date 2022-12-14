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
    const {style, onPress} = this.props;
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={30} style={{}}>
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={[colors.placeHolder1, colors.placeHolder2]}
                  style={[styles.roundImage]}
                />
              </Col>
              <Col size={55} style={[styleApp.center2, {paddingRight: 6}]}>
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={[colors.placeHolder1, colors.placeHolder2]}
                  style={{height: 20, width: '60%', borderRadius: 3}}
                />
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={[colors.placeHolder1, colors.placeHolder2]}
                  style={{
                    height: 15,
                    width: '80%',
                    marginTop: 5,
                    borderRadius: 2,
                  }}
                />
              </Col>
              <Col size={20} style={styleApp.center3}>
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={[colors.placeHolder1, colors.placeHolder2]}
                  style={{height: 20, width: 20, borderRadius: 10}}
                />
              </Col>
            </Row>
          );
        }}
        click={() => (onPress ? onPress() : true)}
        color="white"
        style={[
          styleApp.marginView,
          style,
          {
            flex: 1,
            paddingTop: 15,
            paddingBottom: 15,
            borderBottomWidth: 0,
            borderColor: colors.off,
          },
        ]}
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
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 0,
    marginLeft: 6,

    borderColor: colors.borderColor,
  },
});
