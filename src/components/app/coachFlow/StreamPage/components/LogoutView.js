import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
const {height, width} = Dimensions.get('screen');

import {navigate} from '../../../../../../NavigationService';
import Button from '../../../../layout/buttons/Button';
import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';

export default class LogoutView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  async componentDidMount() {}
  logoutView() {
    const styleViewLiveLogo = {
      ...styleApp.center,
      //  right: width / 2 - 75,
      // top: 10,
      // position: 'absolute',
      backgroundColor: colors.off,
      height: 45,
      width: 45,
      borderRadius: 22.5,
      borderWidth: 1,
      borderColor: colors.grey,
      marginTop: -100,
      marginLeft: 65,
    };
    return (
      <View style={[styleApp.marginView]}>
        <Text
          style={[styleApp.subtitle, {marginBottom: 20, color: colors.title}]}>
          Improve your tennis performance with GameFare! Put up your phone,
          invite your coach or friends to watch and take your game to the next
          level.
        </Text>
        <View style={[styleApp.center, {marginBottom: 100}]}>
          <Image
            source={require('../../../../../img/images/racket.png')}
            style={{height: 80, width: 80, marginTop: 30}}
          />
          <View style={styleViewLiveLogo}>
            <Image
              source={require('../../../../../img/images/live-news.png')}
              style={{
                height: 27,
                width: 27,
              }}
            />
          </View>
        </View>
        <Button
          backgroundColor="green"
          onPressColor={colors.greenLight}
          enabled={true}
          text="Sign in to start"
          styleButton={styles.buttonNewSession}
          loader={false}
          click={async () => navigate('SignIn')}
        />
      </View>
    );
  }
  render() {
    return this.logoutView();
  }
}

const styles = StyleSheet.create({});
