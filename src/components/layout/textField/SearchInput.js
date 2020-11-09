import React, {Component} from 'react';
import {View, Animated, Text, TextInput, StyleSheet} from 'react-native';
import {Row, Col} from 'react-native-easy-grid';
import PropTypes from 'prop-types';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';

import AllIcon from '../icons/AllIcons';
import ButtonColor from '../Views/Button';

export default class SearchInput extends Component {
  static propTypes = {
    search: PropTypes.func.isRequired,
    autofocus: PropTypes.bool,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
  };
  static defaultProps = {
    autoFocus: false,
  };
  constructor(props) {
    super(props);
    this.state = {
      empty: true,
    };
    this.textInputRef = null;
  }

  search = (text) => {
    const {empty} = this.state;
    if (empty && text !== '') {
      this.setState({empty: false});
    } else if (text === '') {
      this.setState({empty: true});
    }
    this.props.search(text);
  };

  searchBar = () => {
    const {empty} = this.state;
    const {autoFocus, onFocus, onBlur} = this.props;
    return (
      <View style={styles.searchBarStyle}>
        <Row >
          <Col size={15} style={styleApp.center}>
            <AllIcon
              name={'search'}
              size={15}
              color={colors.greyDark}
              type="font"
            />
          </Col>
          <Col size={65}>
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
              onFocus={() => {
                onFocus && onFocus();
              }}
              onBlur={() => {
                onBlur && onBlur();
              }}
            />
          </Col>
          <Col size={5} />
          <Col size={10} style={styleApp.center}>
            <Animated.View style={styles.buttonContainerStyle}>
              <ButtonColor
                view={() => {
                  return (
                    !empty && (
                      <AllIcon
                        type={'font'}
                        color={colors.title}
                        size={13}
                        name={'times'}
                      />
                    )
                  );
                }}
                color={'transparent'}
                click={() => {
                  this.search('');
                  this.textInputRef?.clear();
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
    height: 50,
    opacity: 1,
    width: '102%',
    borderRadius: 15,
    backgroundColor: colors.greyLight,
    marginVertical: 10,
    marginLeft: '-2%',
    marginHorizontal: '5%',
  },
  textStyle: {
    ...styleApp.textBold,
    color: colors.title,
    width: '100%',
    height: '100%',
  },
  buttonContainerStyle: {
    opacity: 1, 
    right: 10,
  },
  buttonStyle: {
    height: 30,
    width: 30,
  },
});

