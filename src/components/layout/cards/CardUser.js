import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import {string, object, bool} from 'prop-types';

import {navigate} from '../../../../NavigationService';
import ButtonColor from '../Views/Button';
import colors from '../../style/colors';
import styleApp from '../../style/style';
import ImageUser from '../image/ImageUser';
import {infoUserByIdSelector} from '../../../store/selectors/user';
import {bindUserInfo, unbindUserInfo} from '../../database/firebase/bindings';

class CardUser extends Component {
  static propTypes = {
    id: string,
    style: object,
    styleText: object,
    imgOnly: bool,
    hideProfileInitials: bool,
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
  imgUser = () => {
    const {infoUser, styleImg, imgOnly, hideProfileInitials} = this.props;
    return (
      <ImageUser
        info={infoUser}
        styleImgProps={styleImg}
        disableClick={imgOnly}
        hideProfileInitials={hideProfileInitials}
      />
    );
  };
  render() {
    const {
      infoUser,
      style,
      styleText,
      id,
      suffix,
      prefix,
      imgOnly,
    } = this.props;
    if (!infoUser) return null;
    if (imgOnly) return this.imgUser();
    const {firstname, lastname} = infoUser;
    const containerStyle = {
      ...styles.cardUser,
      ...style,
    };
    const textStyle = {
      ...styleApp.textBold,
      ...styleText,
      fontSize: 17,
    };
    return (
      <ButtonColor
        view={() => {
          return (
            <View style={styleApp.fullSize}>
              <Row>
                <Col size={15} style={styleApp.center2}>
                  {this.imgUser()}
                </Col>
                <Col size={65} style={styleApp.center2}>
                  <Text
                    style={textStyle}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {prefix}
                    {firstname} {lastname}
                    {suffix}
                  </Text>
                </Col>
                <Col size={10} style={styleApp.center2} />
              </Row>
            </View>
          );
        }}
        click={() => navigate('ProfilePage', {id})}
        color={'transparent'}
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
