import React, {Component} from 'react';
import {Animated, StyleSheet, Text, View, ScrollView} from 'react-native';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {connect} from 'react-redux';

import {blockUnblockUser} from '../../../database/firebase/users';

import AsyncImage from '../../../layout/image/AsyncImage';
import ButtonColor from '../../../layout/Views/Button';
import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import sizes from '../../../style/sizes';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

class ProfilePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      userProfile: {
        info: {
          firstname: '',
          lastname: '',
          picture: false,
        },
        id: '',
      },
      isBlocked: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  componentDidMount = () => {
    const {navigation, infoUser} = this.props;
    const userProfile = navigation.getParam('user');
    let isBlocked = false;
    if (infoUser.blockedUsers && infoUser.blockedUsers[userProfile.id]) {
      isBlocked = true;
    }
    this.setState({userProfile, isBlocked, loader: false});
  };

  blockUnblockUser = async (block) => {
    await blockUnblockUser(block, this.props.userID, this.state.userProfile.id);
    this.setState({isBlocked: block});
  };

  picture = (pictureUrl) => {
    if (pictureUrl) {
      return <AsyncImage style={styles.asyncImage} mainImage={pictureUrl} />;
    } else return <View style={styles.asyncImage}></View>;
  };

  button = (text, color, block) => {
    return (
      <ButtonColor
        view={() => (
          <Text style={[styleApp.text, {color: colors.white}]}>{text}</Text>
        )}
        style={{height: 45, borderRadius: 5}}
        click={() => this.blockUnblockUser(block)}
        color={color}
        onPressColor={color}
      />
    );
  };
  render() {
    const {loader, isBlocked} = this.state;
    const {firstname, lastname, picture} = this.state.userProfile.info;

    return (
      <View style={styles.content}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Profile Page'}
          inputRange={[5, 10]}
          loader={loader}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialBorderColorHeader={colors.grey}
          initialTitleOpacity={1}
          icon1={'arrow-left'}
          clickButton1={() => this.props.navigation.goBack()}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          showsVerticalScrollIndicator={true}>
          <Grid style={{height: 250}}>
            <Row size={8} style={styleApp.center2}>
              {this.picture(picture)}
            </Row>
            <Row size={2} style={styleApp.center2}>
              <Text style={[styleApp.title, {marginBottom: 0, fontSize: 25}]}>
                {firstname} {lastname}
              </Text>
            </Row>
          </Grid>
          {isBlocked
            ? this.button('Unblock User', colors.green, false)
            : this.button('Block User', colors.red, true)}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: '100%',
    paddingLeft: 20,
    paddingRight: 20,
  },
  asyncImage: {
    width: 180,
    height: 180,
    borderColor: colors.off,
    borderRadius: 45,
    position: 'absolute',
    zIndex: 0,
    backgroundColor: colors.grey,
  },
});

const mapStateToProps = (state) => {
  console.log(state);
  return {
    infoUser: state.user.infoUser,
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps)(ProfilePage);
