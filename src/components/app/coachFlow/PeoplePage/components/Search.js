import React, {Component} from 'react';
import {View, Animated, Text, TextInput} from 'react-native';
import {connect} from 'react-redux';
import SearchResults from './SearchResults';
import AllIcon from '../../../../layout/icons/AllIcons';
import ButtonColor from '../../../../layout/Views/Button';
import {Row} from 'react-native-easy-grid';
import styleApp from '../../../../style/style';
import colors from '../../../../style/colors';
import sizes from '../../../../style/sizes';
import {navigate} from '../../../../../../NavigationService';
import {native} from '../../../../animations/animations';

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      yOffset: 0,
    };
    this.revealSearchMenu = new Animated.Value(0);
    this.popSearchBar = new Animated.Value(0);
  }

  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }

  animate(val, y) {
    const {onClose} = this.props;
    const visible = !this.state.visible;
    if (!visible) {
      this.textInputRef?.clear();
      this.textInputRef?.blur();
    }
    if (y) {
      const yOffset = Math.floor(y - 30 - sizes.marginTopApp);
      this.setState({yOffset});
    }
    Animated.timing(
      this.popSearchBar,
      native(val, 0, val === 1 ? 0 : 350),
    ).start();
    Animated.timing(this.revealSearchMenu, native(val)).start(() => {
      this.setState({visible});
      if (!visible) {
        this.textInputRef?.clear();
        this.resultsRef?.search('');
        onClose();
      } else {
        this.textInputRef?.focus();
        this.resultsRef?.search('');
      }
    });
  }

  search = (text) => {
    this.resultsRef?.search(text);
  };

  resetInvites = () => {
    this.resultsRef?.resetInvites();
  };

  searchBar = () => {
    const {visible} = this.state;
    const searchBarStyle = {
      ...styleApp.center2,
      paddingLeft: 25,
      height: 50,
      opacity: this.popSearchBar,
      width: '90%',
      borderRadius: 15,
      backgroundColor: colors.greyLight,
      marginVertical: 20,
      marginTop: sizes.marginTopApp + 30,
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
      <Animated.View style={searchBarStyle}>
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
      </Animated.View>
    );
  };

  render() {
    const {visible, yOffset} = this.state;
    const {invite} = this.props;
    const translateY = this.revealSearchMenu.interpolate({
      inputRange: [0, 1],
      outputRange: [yOffset, 50],
    });
    const containerStyle = {
      ...styleApp.fullSize,
      position: 'absolute',
      backgroundColor: 'transparent',
      transform: [{translateY}],
    };
    const backdropStyle = {
      ...styleApp.fullSize,
      position: 'absolute',
      backgroundColor: colors.white,
      zIndex: -1,
      opacity: this.revealSearchMenu,
    };
    return (
      <Animated.View
        pointerEvents={visible ? 'auto' : 'none'}
        style={containerStyle}>
        {this.searchBar()}
        <Animated.View style={backdropStyle}>
          <SearchResults
            onRef={(ref) => {
              this.resultsRef = ref;
            }}
            invite={invite}
          />
        </Animated.View>
      </Animated.View>
    );
  }
}

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
)(Search);
