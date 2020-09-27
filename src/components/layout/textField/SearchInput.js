import React, {Component} from 'react';
import {View, Animated, Text, TextInput, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {Row, Col} from 'react-native-easy-grid';
import PropTypes from 'prop-types';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';

import AllIcon from '../icons/AllIcons';
import ButtonColor from '../Views/Button';

class SearchInput extends Component {
  static propTypes = {
    search: PropTypes.func.isRequired,
    autofocus: PropTypes.bool,
  };
  static defaultProps = {
    autoFocus: false,
  };
  constructor(props) {
    super(props);
    this.state = {};
    this.textInputRef = null;
  }

  componentDidMount() {
    const {onRef} = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  search = (text) => {
    this.props.search(text);
  };

  searchBar = () => {
    const {autoFocus, onFocus} = this.props;
    return (
      <View style={styles.searchBarStyle}>
        <Row style={styles.rowStyle}>
          <Col size={10} style={styleApp.center}>
            <AllIcon
              name={'search'}
              size={13}
              color={colors.greyDark}
              type="font"
            />
          </Col>
          <Col size={70}>
            <TextInput
              style={styles.textStyle}
              placeholder={'Search for users'}
              placeholderTextColor={colors.greyDark}
              returnKeyType={'done'}
              autoCompleteType={'name'}
              blurOnSubmit={true}
              ref={(textInputRef) => {
                this.textInputRef = textInputRef;
                if (autoFocus && textInputRef) {
                  textInputRef.focus();
                }
              }}
              clearButtonMode={'never'}
              underlineColorAndroid="rgba(0,0,0,0)"
              autoCorrect={true}
              onChangeText={(text) => {
                this.search(text);
              }}
            />
          </Col>
          <Col size={10} style={styleApp.center}>
            <Animated.View style={styles.buttonContainerStyle}>
              <ButtonColor
                view={() => {
                  return (
                    <AllIcon
                      type={'font'}
                      color={colors.title}
                      size={13}
                      name={'times'}
                    />
                  );
                }}
                color={'transparent'}
                click={() => {
                  this.search('');
                  this.textInputRef?.clear();
                  this.textInputRef?.focus();
                }}
                onPressColor={'transparent'}
                style={styles.buttonStyle}
              />
            </Animated.View>
          </Col>
        </Row>
      </View>
    );
  };

  render() {
    return this.searchBar();
  }
}

const styles = StyleSheet.create({
  searchBarStyle: {
    ...styleApp.center2,
    // paddingLeft: 25,
    height: 50,
    opacity: 1,
    width: '102%',
    borderRadius: 15,
    backgroundColor: colors.greyLight,
    marginVertical: 10,
    // marginTop: sizes.marginTopApp + 0,
    marginLeft: '-2%',
    marginHorizontal: '5%',
  },
  textStyle: {
    ...styleApp.textBold,
    color: colors.title,
    // paddingLeft: 20,
    width: '100%',
    height: '100%',
  },
  rowStyle: {
    // height: '100%',
    // ...styleApp.center4,
  },
  buttonContainerStyle: {
    opacity: 1,
    // position: 'absolute',
    right: 10,
  },
  buttonStyle: {
    height: 30,
    width: 30,
  },
});

const mapStateToProps = (state) => {
  return {
    coachSessions: state.user.infoUser.coachSessions,
    userConnected: state.user.userConnected,
    sessionInfo: state.coach.sessionInfo,
  };
};

export default connect(
  mapStateToProps,
  {},
)(SearchInput);
