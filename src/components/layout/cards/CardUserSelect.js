import React, {Component} from 'react';
import {StyleSheet, Text, View, Animated} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';

import {native} from '../../animations/animations';
import ButtonColor from '../Views/Button';
import colors from '../../style/colors';
import AllIcons from '../../layout/icons/AllIcons';
import AsyncImage from '../image/AsyncImage';
import styleApp from '../../style/style';

export default class CardUserSelect extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    selected: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.selectionIndication = new Animated.Value(props.selected ? 1 : 0);
  }

  componentDidUpdate(prevProps) {
    const {selected} = this.props;
    const {selected: prevSelected} = prevProps;
    if (selected && !prevSelected) {
      this.animate(1);
    } else if (!selected && prevSelected) {
      this.animate(0);
    }
  }

  animate(to) {
    Animated.timing(this.selectionIndication, native(to, 250)).start();
  }

  render() {
    const {user, onClick} = this.props;
    const selectionOverlayStyle = {
      width: '100%',
      height: '100%',
      position: 'absolute',
      backgroundColor: colors.white,
      borderColor: colors.green,
      borderWidth: 2,
      borderRadius: 15,
      opacity: this.selectionIndication,
      overflow: 'hidden',
    };
    return (
      <ButtonColor
        view={() => {
          return (
            <View style={styleApp.fullSize}>
              <Animated.View style={selectionOverlayStyle} />
              <Row style={{padding: '5%'}}>
                <Col size={15} style={styleApp.center2}>
                  {user.info.picture ? (
                    <AsyncImage
                      style={styles.imgUser}
                      mainImage={user.info.picture}
                      imgInitial={user.info.picture}
                    />
                  ) : (
                    <View style={[styleApp.center, styles.imgUser]}>
                      <Text style={[styleApp.text, {fontSize: 12}]}>
                        {user?.info?.firstname[0]}
                        {user.info.lastname !== '' ? user.info.lastname[0] : ''}
                      </Text>
                    </View>
                  )}
                </Col>
                <Col size={75} style={styleApp.center2}>
                  <Text style={styleApp.text}>
                    {user?.info?.firstname} {user?.info?.lastname}
                  </Text>
                </Col>
              </Row>
            </View>
          );
        }}
        click={() => onClick(user)}
        color="white"
        style={[styles.cardUser]}
        onPressColor={colors.off2}
      />
    );
  }
}

const styles = StyleSheet.create({
  cardUser: {
    height: 55,
    borderRadius: 15,
    paddingLeft: '5%',
    paddingRight: '5%',
  },
  imgUser: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.off,
  },
});

CardUserSelect.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    info: PropTypes.object,
  }).isRequired,
  usersSelected: PropTypes.object,
  selectUser: PropTypes.func,
  hideIcon: PropTypes.bool,
};
