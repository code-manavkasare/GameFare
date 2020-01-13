import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  InputAccessoryView,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';
import BackButton from '../../../layout/buttons/BackButton';
import Button from '../../../layout/buttons/Button';
import ButtonColor from '../../../layout/Views/Button';
import LinearGradient from 'react-native-linear-gradient';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

import ScrollView from '../../../layout/scrollViews/ScrollView';
import ExpandableCard from '../../../layout/cards/ExpandableCard';
import Switch from '../../../layout/switch/Switch';
import AllIcons from '../../../layout/icons/AllIcons';
import AsyncImage from '../../../layout/image/AsyncImage';
import PlaceHolder from '../../../placeHolders/CardEvent';
import {indexGroups} from '../../../database/algolia';

import sizes from '../../../style/sizes';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';

export default class AddGroups extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listGroups: [],
      groups: {},
      search: '',
      loader: true,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  static navigationOptions = ({navigation}) => {
    return {
      title: 'Add groups',
      headerStyle: styleApp.styleHeader,
      headerTitleStyle: styleApp.textHeader,
      headerLeft: () => (
        <BackButton
          name="keyboard-arrow-left"
          color={colors.title}
          type="mat"
          click={() => navigation.goBack()}
        />
      ),
    };
  };
  componentDidMount() {
    this.initiaLoad();
  }
  async initiaLoad() {
    var groups = this.props.navigation.getParam('groups');
    indexGroups.clearCache();
    var listGroups = await indexGroups.search({
      filters: 'info.organizer:' + this.props.navigation.getParam('userID'),
      query: '',
    });
    await this.setState({
      loader: false,
      listGroups: listGroups.hits,
      groups: groups,
    });
    return true;
  }
  async searchGroups(text) {
    indexGroups.clearCache();
    var listGroups = await indexGroups.search({
      filters: 'info.organizer:' + this.props.navigation.getParam('userID'),
      query: text,
    });
    await this.setState({listGroups: listGroups.hits, search: text});
    return true;
  }
  searchBar() {
    return (
      <TouchableOpacity
        style={[
          {
            borderBottomWidth: 0.3,
            borderColor: colors.borderColor,
            paddingTop: 20,
            paddingBottom: 20,
            backgroundColor: 'white',
          },
        ]}
        activeOpacity={0.7}
        onPress={() => this.inputRef.focus()}>
        <Row>
          <Col size={15} style={styleApp.center}>
            <AllIcons name="search" type="mat" size={20} color={colors.title} />
          </Col>
          <Col size={70} style={styleApp.center2}>
            <TextInput
              style={styleApp.input}
              placeholder={'Search for a group'}
              returnKeyType={'done'}
              blurOnSubmit={true}
              autoFocus={false}
              ref={(input) => {
                this.inputRef = input;
              }}
              underlineColorAndroid="rgba(0,0,0,0)"
              autoCorrect={true}
              inputAccessoryViewID={'text'}
              onChangeText={(text) => this.searchGroups(text)}
              // value={this.state.search}
            />
          </Col>
          <Col
            size={15}
            style={styleApp.center}
            activeOpacity={0.7}
            onPress={() => this.searchGroups('')}>
            {this.state.search != '' ? (
              <AllIcons
                name="times-circle"
                type="font"
                size={13}
                color={colors.titles}
              />
            ) : null}
          </Col>
        </Row>
      </TouchableOpacity>
    );
  }
  selectGroup(group) {
    var groups = this.state.groups;
    if (
      Object.values(groups).filter(
        (group1) => group1.objectID === group.objectID,
      ).length == 0
    ) {
      groups = {
        ...groups,
        [group.objectID]: group,
      };
    } else {
      delete groups[group.objectID];
    }
    this.setState({groups: groups});
  }
  placeHolder() {
    return (
      <View style={[styles.rowGroup, {flex: 1}]}>
        <Row style={{marginLeft: 20, width: width - 40}}>
          <Col size={15} style={styleApp.center2}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={[colors.placeHolder1, colors.placeHolder2]}
              style={{width: '100%', height: 40, borderRadius: 6}}
            />
          </Col>
          <Col size={75} style={[styleApp.center2, {paddingLeft: 15}]}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={[colors.placeHolder1, colors.placeHolder2]}
              style={{width: '60%', height: 14, borderRadius: 2}}
            />
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={[colors.placeHolder1, colors.placeHolder2]}
              style={{width: '10%', height: 8, borderRadius: 2, marginTop: 3}}
            />
          </Col>
        </Row>
      </View>
    );
  }
  rowGroup(group, i) {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row
              style={{
                paddingTop: 10,
                paddingLeft: 20,
                paddingRight: 20,
                paddingBottom: 10,
              }}>
              <Col size={15} style={styleApp.center2}>
                <AsyncImage
                  style={{width: '100%', height: 40, borderRadius: 3}}
                  mainImage={group.pictures[0]}
                  imgInitial={group.pictures[0]}
                />
              </Col>
              <Col size={75} style={[styleApp.center2, {paddingLeft: 15}]}>
                <Text style={styleApp.text}>{group.info.name}</Text>
                <Text style={[styleApp.smallText, {fontSize: 12}]}>
                  {group.info.sport.charAt(0).toUpperCase() +
                    group.info.sport.slice(1)}
                </Text>
              </Col>
              <Col size={10} style={styleApp.center3}>
                {Object.values(this.state.groups).filter(
                  (group1) => group1.objectID == group.objectID,
                ).length != 0 ? (
                  <AllIcons
                    name="check"
                    type="mat"
                    size={20}
                    color={colors.green}
                  />
                ) : null}
              </Col>
            </Row>
          );
        }}
        click={() => this.selectGroup(group)}
        color="white"
        style={[styles.rowGroup, {flex: 1}]}
        onPressColor={colors.off}
      />
    );
  }
  listGroupPage() {
    return (
      <View>
        {this.searchBar()}
        {this.listGroups()}
      </View>
    );
  }
  listGroups() {
    if (this.state.loader)
      return (
        <View>
          {this.placeHolder()}
          {this.placeHolder()}
          {this.placeHolder()}
          {this.placeHolder()}
          {this.placeHolder()}
          {this.placeHolder()}
        </View>
      );
    if (this.state.listGroups.length == 0)
      return (
        <Text style={[styleApp.text, {marginTop: 20, paddingLeft: 20}]}>
          You haven't created any groups yet. Please create one first.
        </Text>
      );
    return (
      <View>
        {this.state.listGroups.map((group, i) => this.rowGroup(group, i))}
      </View>
    );
  }
  submit() {
    return this.props.navigation.state.params.onGoBack(this.state.groups);
  }
  textButton() {
    if (
      Object.values(this.state.groups).length == 1 ||
      Object.values(this.state.groups).length == 0
    )
      return 'Add ' + Object.values(this.state.groups).length + ' group';
    return 'Add ' + Object.values(this.state.groups).length + ' groups';
  }
  render() {
    return (
      <View
        style={{
          backgroundColor: 'white',
          flex: 1,
          borderLeftWidth: 1,
          borderColor: colors.off,
        }}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1="arrow-left"
          icon2={null}
          clickButton1={() => this.props.navigation.goBack()}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.listGroupPage.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={true}
        />

        <View style={styleApp.footerBooking}>
          <View style={{marginLeft: 20, width: width - 40}}>
            <Button
              backgroundColor={'green'}
              onPressColor={colors.greenClick}
              text={this.textButton()}
              click={() => this.submit()}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  rowGroup: {
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 0.3,
    borderColor: colors.borderColor,
  },
});
