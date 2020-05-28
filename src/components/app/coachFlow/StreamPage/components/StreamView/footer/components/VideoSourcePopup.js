import React, {Component} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated, Easing
} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';

import ButtonColor from '../../../../../../../layout/Views/Button';
import AsyncImage from '../../../../../../../layout/image/AsyncImage';

import colors from '../../../../../../../style/colors';
import sizes from '../../../../../../../style/sizes';
import styleApp from '../../../../../../../style/style';

export default class VideoSourcePopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      inValue: new Animated.Value(0),
      contentValue: new Animated.Value(0)
    };
  }

  componentDidMount() {
    this.props.onRef(this);
    console.log(this.props.members)
  }

  open() {
    Animated.timing(this.state.inValue, {
      toValue: 1,
      duration: 150,
      easing: Easing.inOut(Easing.linear),
      useNativeDriver: false
    }).start();
    Animated.timing(this.state.contentValue, {
      toValue: 1,
      duration: 100,
      delay: 50,
      easing: Easing.inOut(Easing.linear),
      useNativeDriver: false
    }).start();
    this.setState({visible: true})
  }

  close() {
    Animated.timing(this.state.inValue, {
      toValue: 0,
      duration: 150,
      easing: Easing.inOut(Easing.linear),
      useNativeDriver: false
    }).start();
    Animated.timing(this.state.contentValue, {
      toValue: 0,
      duration: 50,
      easing: Easing.inOut(Easing.linear),
      useNativeDriver: false
    }).start();
    this.setState({visible: false})
  }

  render() {
    const {visible, inValue, contentValue} = this.state;
    const {members} = this.props;
    const animatedViewBottom = inValue.interpolate({
      inputRange: [0, 1],
      outputRange: [120, 100 + sizes.offsetFooterStreaming]
    })
    const animatedWidth = inValue.interpolate({
      inputRange: [0, 1],
      outputRange: [sizes.width - 200, sizes.width - 160]
    })
    
    return (
      <Animated.View 
        pointerEvents={visible?"auto":"none"} 
        style={[styles.square, styleApp.center, {opacity: inValue, bottom:animatedViewBottom, width: animatedWidth}]}
      >
        <Animated.Text style={[styleApp.text, styles.text, {opacity: contentValue}]}>Choose a video source</Animated.Text>
        <Animated.View style={[styleApp.divider2, {marginTop: 10, marginBottom: 5, opacity: contentValue}]} />
        {Object.values(members).map((member, i) => {
          if (member.isConnected) {
            const {firstname, lastname, picture} = member.info;
            return (
              <Animated.View style={{width:'100%', opacity:contentValue}}>
              <ButtonColor
                view={() => {
                  return (
                    <Row>
                      <Col size={1} style={styleApp.center2}>
                        {member.info.picture ? (
                          <AsyncImage
                            style={styles.imgUser}
                            mainImage={picture}
                            imgInitial={picture}
                          />
                        ) : (
                          <View style={[styleApp.center, styles.imgUser]}>
                            <Text style={[styleApp.text, {fontSize: 12}]}>
                              {firstname[0]}
                              {lastname !== '' ? lastname[0] : ''}
                            </Text>
                          </View>
                        )}
                      </Col>

                      <Col size={2} style={styleApp.center2}>
                        <Text style={styleApp.text}>
                          {firstname} {lastname}
                        </Text>
                      </Col>
                    </Row>
                  );
                }}
                click={() => this.props.selectMember(member)}
                key={i}
                color="white"
                style={[styles.cardUser]}
                onPressColor={colors.off2}
              />
              </Animated.View>
            );
          }
        })}
        <View style={styles.triangle} />
        <TouchableWithoutFeedback onPress={() => this.close()}>
          <View pointerEvents={visible?"auto":"none"} style={styles.fullPage} />
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  }
}

const triangleBase = 21;

const styles = StyleSheet.create({
  square: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    zIndex:2
  },
  triangle: {
    borderLeftWidth: triangleBase / 1.5,
    borderRightWidth: triangleBase / 1.5,
    borderTopWidth: triangleBase,
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.white,
    position: 'absolute',
    bottom: -triangleBase,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    zIndex:1
  },
  cardUser: {
    height: 55,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 10
  },
  imgUser: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.off,
  },
  fullPage: {
    position: 'absolute',
    width: sizes.width,
    height: 200000,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
  text: {
    marginTop: 15,
    marginHorizontal: 'auto',
    textAlign: 'center',
    fontWeight:'bold'
  },
});

VideoSourcePopup.propTypes = {
  members: PropTypes.array.isRequired,
  selectMember: PropTypes.func,
  close: PropTypes.func,
};
