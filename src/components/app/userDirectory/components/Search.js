import React, {Component} from 'react';
import {View, Animated, Text, TextInput, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import sizes from '../../../style/sizes';

import AllIcon from '../../../layout/icons/AllIcons';
import ButtonColor from '../../../layout/Views/Button';

class SearchInput extends Component {
  static propTypes = {
    search: PropTypes.func.isRequired,
  }
  
  constructor(props) {
    super(props);
    this.state = {};
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
    const {visible} = this.state;
    const searchBarStyle = {
      ...styleApp.center2,
      paddingLeft: 25,
      height: 50,
      opacity: 1,
      width: '90%',
      borderRadius: 15,
      backgroundColor: colors.greyLight,
      marginVertical: 20,
      // marginTop: sizes.marginTopApp + 0,
      marginHorizontal: '5%',
    };
    const textStyle = {
      ...styleApp.textBold,
      color: colors.title,
      marginLeft: 20,
      width: '100%',
      height: '100%',
    };
    const rowStyle = {
      height: '100%',
      ...styleApp.center4,
    };
    const buttonContainerStyle = {
      opacity: this.revealSearchMenu,
      position: 'absolute',
      right: 10,
    };
    const buttonStyle = {
      height: 30,
      width: 30,
    };
    return (
      <View style={searchBarStyle}>
        <Row style={rowStyle}>
          <AllIcon
            name={'search'}
            size={13}
            color={colors.greyDark}
            type="font"
          />
          <TextInput
            editable={visible}
            style={textStyle}
            placeholder={'Search'}
            placeholderTextColor={colors.greyDark}
            returnKeyType={'done'}
            autoCompleteType={'name'}
            blurOnSubmit={true}
            ref={(input) => {
              this.textInputRef = input;
            }}
            clearButtonMode={'never'}
            underlineColorAndroid="rgba(0,0,0,0)"
            autoCorrect={true}
            onChangeText={(text) => {
              this.search(text);
            }}
            onSubmitEditing={(evt) => {
              const {text} = evt.nativeEvent;
              if (text === '') {
                this.animate(0);
              }
            }}
          />
        </Row>
        <Animated.View style={buttonContainerStyle}>
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
              if (this.resultsRef?.state?.input !== '') {
                this.search('');
                this.textInputRef?.clear();
                this.textInputRef?.focus();
              } else {
                this.animate(0);
              }
            }}
            onPressColor={'transparent'}
            style={buttonStyle}
          />
        </Animated.View>
      </View>
    );
  };

  render() {
    return this.searchBar();
  }
}

const styles = StyleSheet.create({
  
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
