import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Image,
  Animated,
} from 'react-native';
const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';
import AllIcons from '../../../layout/icons/AllIcons';
import ScrollView from '../../../layout/scrollViews/ScrollView';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import Swiper from 'react-native-swiper';

export default class SwiperLogout extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  async componentDidMount() {}
  swiperGroup() {
    return (
      <Swiper
        style={{height: 270}}
        index={0}
        activeDotStyle={{opacity: 1}}
        dotStyle={{opacity: 1}}
        dotColor={colors.grey}
        showsPagination={true}
        activeDotColor={colors.green}
        loop={false}
        showsButtons={false}>
        <View style={styleApp.center}>
          <Image
            source={require('../../../../img/logout/studying.png')}
            style={{width: 90, height: 90, marginBottom: 10, marginTop: 10}}
          />
          <Text style={styleApp.title}>Create your group</Text>
          <Text style={[styleApp.smallText, {marginTop: 10}]}>
            Pick your sport
          </Text>
          <Text style={[styleApp.smallText, {marginTop: 3}]}>
            Set the name, description...
          </Text>
        </View>
        <View style={styleApp.center}>
          <Image
            source={require('../../../../img/logout/looking.png')}
            style={{width: 50, height: 50, marginBottom: 20, marginTop: 30}}
          />
          <Text style={styleApp.title}>Invite people</Text>
          <Text style={[styleApp.smallText, {marginTop: 10}]}>
            Share it to your friends
          </Text>
          <Text style={[styleApp.smallText, {marginTop: 3}]}>
            Find new aficionados
          </Text>
        </View>
        <View style={styleApp.center}>
          <Image
            source={require('../../../../img/logout/ringing.png')}
            style={{width: 90, height: 90, marginBottom: 20, marginTop: 10}}
          />
          <Text style={styleApp.title}>Communicate</Text>
          <Text style={[styleApp.smallText, {marginTop: 10}]}>
            Inform your community
          </Text>
          <Text style={[styleApp.smallText, {marginTop: 3}]}>
            Post pictures
          </Text>
        </View>
        <View style={styleApp.center}>
          <Image
            source={require('../../../../img/logout/protest.png')}
            style={{width: 80, height: 80, marginBottom: 20, marginTop: 10}}
          />
          <Text style={styleApp.title}>Create events</Text>
          <Text style={[styleApp.smallText, {marginTop: 10}]}>
            Set recurence
          </Text>
          <Text style={[styleApp.smallText, {marginTop: 3}]}>
            Share it with your community
          </Text>
        </View>
      </Swiper>
    );
  }
  swiperEvents() {
    return (
      <Swiper
        height={270}
        index={0}
        activeDotStyle={{opacity: 1}}
        dotStyle={{opacity: 1}}
        dotColor={colors.grey}
        showsPagination={true}
        activeDotColor={colors.green}
        loop={false}
        showsButtons={false}>
        <View style={styleApp.center}>
          <Image
            source={require('../../../../img/logout/protest.png')}
            style={{width: 80, height: 80, marginBottom: 20, marginTop: 10}}
          />
          <Text style={styleApp.title}>Create events</Text>
          <Text style={[styleApp.smallText, {marginTop: 10}]}>
            Pick your sport
          </Text>
          <Text style={[styleApp.smallText, {marginTop: 3}]}>
            Set joining settings, levels...
          </Text>
        </View>
        <View style={styleApp.center}>
          <Image
            source={require('../../../../img/logout/looking.png')}
            style={{width: 50, height: 50, marginBottom: 20, marginTop: 30}}
          />
          <Text style={styleApp.title}>Invite people</Text>
          <Text style={[styleApp.smallText, {marginTop: 10}]}>
            Share it to your friends
          </Text>
          <Text style={[styleApp.smallText, {marginTop: 3}]}>
            Find new aficionados
          </Text>
        </View>
        <View style={styleApp.center}>
          <Image
            source={require('../../../../img/logout/invention.png')}
            style={{width: 50, height: 50, marginBottom: 20, marginTop: 30}}
          />
          <Text style={styleApp.title}>Get pay</Text>
          <Text style={[styleApp.smallText, {marginTop: 10}]}>
            Receive your pay
          </Text>
          <Text style={[styleApp.smallText, {marginTop: 3}]}>
            Link your bank account
          </Text>
        </View>
      </Swiper>
    );
  }
  swiperProfile() {
    return (
      <Swiper
        height={270}
        index={0}
        activeDotStyle={{opacity: 1}}
        dotStyle={{opacity: 1}}
        dotColor={colors.grey}
        showsPagination={true}
        activeDotColor={colors.green}
        loop={false}
        showsButtons={false}>
        <View style={styleApp.center}>
          <Image
            source={require('../../../../img/logout/studying.png')}
            style={{width: 90, height: 90, marginBottom: 10, marginTop: 10}}
          />
          <Text style={styleApp.title}>Create your group</Text>
          <Text style={[styleApp.smallText, {marginTop: 10}]}>
            Pick your sport
          </Text>
          <Text style={[styleApp.smallText, {marginTop: 3}]}>
            Set the name, description...
          </Text>
        </View>
        <View style={styleApp.center}>
          <Image
            source={require('../../../../img/logout/looking.png')}
            style={{width: 50, height: 50, marginBottom: 20, marginTop: 30}}
          />
          <Text style={styleApp.title}>Invite people</Text>
          <Text style={[styleApp.smallText, {marginTop: 10}]}>
            Share it to your friends
          </Text>
          <Text style={[styleApp.smallText, {marginTop: 3}]}>
            Find new aficionados
          </Text>
        </View>
        <View style={styleApp.center}>
          <Image
            source={require('../../../../img/logout/ringing.png')}
            style={{width: 90, height: 90, marginBottom: 20, marginTop: 10}}
          />
          <Text style={styleApp.title}>Communicate</Text>
          <Text style={[styleApp.smallText, {marginTop: 10}]}>
            Inform your community
          </Text>
          <Text style={[styleApp.smallText, {marginTop: 3}]}>
            Post pictures
          </Text>
        </View>
        <View style={styleApp.center}>
          <Image
            source={require('../../../../img/logout/protest.png')}
            style={{width: 80, height: 80, marginBottom: 20, marginTop: 10}}
          />
          <Text style={styleApp.title}>Create events</Text>
          <Text style={[styleApp.smallText, {marginTop: 10}]}>
            Set recurence
          </Text>
          <Text style={[styleApp.smallText, {marginTop: 3}]}>
            Share it with your community
          </Text>
        </View>
        <View style={styleApp.center}>
          <Image
            source={require('../../../../img/logout/looking.png')}
            style={{width: 50, height: 50, marginBottom: 20, marginTop: 30}}
          />
          <Text style={styleApp.title}>Invite people</Text>
          <Text style={[styleApp.smallText, {marginTop: 10}]}>
            Share it to your friends
          </Text>
          <Text style={[styleApp.smallText, {marginTop: 3}]}>
            Find new aficionados
          </Text>
        </View>
        <View style={styleApp.center}>
          <Image
            source={require('../../../../img/logout/invention.png')}
            style={{width: 50, height: 50, marginBottom: 20, marginTop: 30}}
          />
          <Text style={styleApp.title}>Get pay</Text>
          <Text style={[styleApp.smallText, {marginTop: 10}]}>
            Receive your pay
          </Text>
          <Text style={[styleApp.smallText, {marginTop: 3}]}>
            Link your bank account
          </Text>
        </View>
      </Swiper>
    );
  }
  render() {
    return (
      <View style={{height: 270}}>
        {this.props.type == 'groups'
          ? this.swiperGroup()
          : this.props.type == 'events'
          ? this.swiperEvents()
          : this.props.type == 'profile'
          ? this.swiperProfile()
          : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  defaultView: {
    backgroundColor: colors.greenLight,
    borderRadius: 12.5,
    height: 25,
    width: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textDefault: {
    color: colors.greenStrong,
    fontSize: 12,
    fontFamily: 'OpenSans-Bold',
  },
});
