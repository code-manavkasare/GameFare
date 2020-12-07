import React, {Component} from 'react';
import {StyleSheet, Text, View, Animated} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import {string, object} from 'prop-types';

import {navigate} from '../../../../NavigationService';
import ButtonColor from '../Views/Button';
import colors from '../../style/colors';
import AllIcon from '../../layout/icons/AllIcons';
import styleApp from '../../style/style';
import ImageUser from '../image/ImageUser';
import {infoUserByIdSelector} from '../../../store/selectors/user';
import {fetchUser} from '../../functions/users';
import {bindUserInfo, unbindUserInfo} from '../../database/firebase/bindings';

class CardUser extends Component {
  static propTypes = {
    id: string,
    style: object,
    styleText: object,
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount = () => {
    const {id} = this.props;
    bindUserInfo(id);
  };
  componentWillUnmount = () => {
    const {id} = this.props;
    unbindUserInfo(id);
  };
  render() {
    const {infoUser, onClick, style, styleText, id} = this.props;
    if (!infoUser) return null;
    const {picture, firstname, lastname} = infoUser;
    const containerStyle = {
      ...styles.cardUser,
      ...style,
    };
    const textStyle = {
      ...styleApp.text,
      ...styleText,
    };
    return (
      <ButtonColor
        view={() => {
          return (
            <View style={styleApp.fullSize}>
              <Row>
                <Col size={15} style={styleApp.center2}>
                  <ImageUser info={infoUser} />
                </Col>
                <Col size={65} style={styleApp.center2}>
                  <Text style={textStyle}>
                    {firstname} {lastname}
                  </Text>
                </Col>
                <Col size={10} style={styleApp.center2} />
              </Row>
            </View>
          );
        }}
        click={() => navigate('ProfilePage', {id})}
        color={colors.white}
        style={containerStyle}
        onPressColor={colors.off2}
      />
    );
  }
}

const styles = StyleSheet.create({
  cardUser: {
    height: 65,
  },
  imgUser: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.off,
  },
});

const mapStateToProps = (state, props) => {
  return {
    infoUser: infoUserByIdSelector(state, {id: props.id}),
  };
};

export default connect(mapStateToProps)(CardUser);
