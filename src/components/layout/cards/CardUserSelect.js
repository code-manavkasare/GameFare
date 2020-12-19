import React, {Component} from 'react';
import {StyleSheet, Text, View, Animated} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';

import {native} from '../../animations/animations';
import ButtonColor from '../Views/Button';
import colors from '../../style/colors';
import AllIcon from '../../layout/icons/AllIcons';
import AsyncImage from '../image/AsyncImage';
import styleApp from '../../style/style';
import {silentFriendsSelector} from '../../../store/selectors/user';

class CardUserSelect extends Component {
  static propTypes = {
    user: PropTypes.shape({
      id: PropTypes.string,
      info: PropTypes.object,
    }).isRequired,
    onClick: PropTypes.func.isRequired,
    selected: PropTypes.bool,
  };

  static defaultProps = {
    selected: false,
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
    const {user, onClick, silentFriends, isUserSelected, children} = this.props;
    const {isPrivate} = user.info;
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
    const privateUser = isPrivate && !silentFriends[user.id];

    return (
      <ButtonColor
        view={() => {
          return (
            <View style={styleApp.fullSize}>
              <Animated.View style={selectionOverlayStyle} />
              {children ?? (
                <Row>
                  <Col size={25} style={styleApp.center}>
                    {user.info.picture ? (
                      <AsyncImage
                        style={styles.imgUser}
                        mainImage={user.info.picture}
                        imgInitial={user.info.picture}
                      />
                    ) : (
                      <View style={[styleApp.center, styles.imgUser]}>
                        <Text style={[styleApp.textBold, {fontSize: 13}]}>
                          {user.info.firstname !== ''
                            ? user.info.firstname[0]
                            : ''}
                          {user.info.lastname !== ''
                            ? user.info.lastname[0]
                            : ''}
                        </Text>
                      </View>
                    )}
                  </Col>
                  <Col size={65} style={styleApp.center2}>
                    <Text style={styleApp.text}>
                      {user?.info?.firstname} {user?.info?.lastname}
                    </Text>
                  </Col>
                  <Col size={10} style={styleApp.center2}>
                    {isUserSelected ? (
                      <AllIcon
                        type={'font'}
                        color={colors.green}
                        size={18}
                        name={'check'}
                      />
                    ) : privateUser ? (
                      <AllIcon
                        type={'font'}
                        color={colors.greyDarker}
                        size={18}
                        name={'lock'}
                      />
                    ) : null}
                  </Col>
                </Row>
              )}
            </View>
          );
        }}
        click={() => {
          onClick && onClick(user);
        }}
        color="white"
        style={[styles.cardUser]}
        onPressColor={colors.off2}
      />
    );
  }
}

const styles = StyleSheet.create({
  cardUser: {
    height: 65,
    borderRadius: 15,
    paddingLeft: '5%',
    paddingRight: '5%',
  },
  imgUser: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.off,
  },
});

const mapStateToProps = (state) => {
  return {
    silentFriends: silentFriendsSelector(state),
  };
};

export default connect(mapStateToProps)(CardUserSelect);
