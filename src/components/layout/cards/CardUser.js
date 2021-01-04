import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import {string, object, bool, func} from 'prop-types';

import {navigate} from '../../../../NavigationService';
import ButtonColor from '../Views/Button';
import colors from '../../style/colors';
import styleApp from '../../style/style';
import ImageUser from '../image/ImageUser';
import {infoUserByIdSelector} from '../../../store/selectors/user';
import {bindUserInfo, unbindUserInfo} from '../../database/firebase/bindings';
import PlaceHolder from '../../placeHolders/CardUser';
import AllIcon from '../icons/AllIcons';

class CardUser extends Component {
  static propTypes = {
    id: string,
    style: object,
    styleText: object,
    imgOnly: bool,
    hideProfileInitials: bool,
    icon: object,
    onPress: func,
    textOnly: bool,
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
    const {
      infoUser,
      styleImg,
      imgOnly,
      hideProfileInitials,
      profileInitialsStyle,
    } = this.props;
    return (
      <ImageUser
        info={infoUser}
        styleImgProps={styleImg}
        disableClick={imgOnly}
        hideProfileInitials={hideProfileInitials}
        profileInitialsStyle={profileInitialsStyle}
      />
    );
  };
  text = () => {
    const {infoUser, styleText} = this.props;
    const {firstname, lastname} = infoUser;
    const textStyle = {
      ...styleApp.textBold,
      fontSize: 17,
      ...styleText,
    };
    return (
      <Text style={textStyle} numberOfLines={1} ellipsizeMode="tail">
        {firstname} {lastname}
      </Text>
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
      textOnly,
      icon,
      onPress,
    } = this.props;
    if (!infoUser) return <PlaceHolder style={containerStyle} />;
    if (imgOnly) return this.imgUser();
    if (textOnly) return this.text();
    const containerStyle = {
      ...styles.cardUser,
      ...style,
    };
    const smallTextStyle = {
      ...styleApp.textBold,
      ...styleText,
      fontSize: 12,
      opacity: 0.6,
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
                  {prefix ? <Text style={smallTextStyle}>{prefix}</Text> : null}
                  {this.text()}
                  {suffix ? <Text style={smallTextStyle}>{suffix}</Text> : null}
                </Col>
                <Col size={10} style={styleApp.center}>
                  {icon ? (
                    <AllIcon
                      type={icon.type ?? 'font'}
                      name={icon.name ?? 'chevron-right'}
                      color={icon.color ?? colors.greyMidDark}
                      size={icon.size ?? 13}
                    />
                  ) : null}
                </Col>
              </Row>
            </View>
          );
        }}
        click={!onPress ? () => navigate('ProfilePage', {id}) : onPress}
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
