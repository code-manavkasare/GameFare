import React, {Component} from 'react';
import {Animated, View, Text, StyleSheet} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';

import ButtonColor from '../../../../../layout/Views/Button';
import AsyncImage from '../../../../../layout/image/AsyncImage';

import colors from '../../../../../style/colors';
import sizes from '../../../../../style/sizes';
import styleApp from '../../../../../style/style';

export default class VideoSourcePopup extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {members} = this.props;

    return (
      <View style={[styles.square, styleApp.center]}>
        {members.map((member, i) => {
          if (member.isConnected) {
            const {firstname, lastname, picture} = member.info;
            return (
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
            );
          }
        })}
        <View style={styles.triangle} />
      </View>
    );
  }
}

const triangleBase = 26;

const styles = StyleSheet.create({
  square: {
    position: 'absolute',
    alignSelf: 'center',
    width: sizes.width - 160,
    paddingHorizontal: 10,
    bottom: 100 + sizes.offsetFooterStreaming,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  triangle: {
    borderLeftWidth: triangleBase / 2,
    borderRightWidth: triangleBase / 2,
    borderTopWidth: triangleBase,
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.white,
    position: 'absolute',
    bottom: -triangleBase,
  },
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

VideoSourcePopup.propTypes = {
  members: PropTypes.array.isRequired,
  selectMember: PropTypes.func,
};
