import React from 'react';
import {connect} from 'react-redux';
import {View, Text, Dimensions, Animated, TouchableOpacity} from 'react-native';

import FadeInView from 'react-native-fade-in-view';

import HeaderHome from '../layout/headers/HeaderHome';
import NewEvents from './elementsHome/NewEvents';
import GroupsAround from './elementsActivity/GroupsAround';
import styleApp from '../style/style';
import colors from '../style/colors';
import Switch from '../layout/switch/Switch';
import {historicSearchAction} from '../../actions/historicSearchActions';

import ScrollView2 from '../layout/scrollViews/ScrollView2';
const {height, width} = Dimensions.get('screen');

import sizes from '../style/sizes';
import isEqual from 'lodash.isequal';

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      listEvents: [],
      listGroups: [],
      loaderEvents: true,
      loaderGroups: true,
      loader: false,
      showMap: false,
      groups: false,
    };
    this.translateXVoile = new Animated.Value(width);
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.translateXEvents = new Animated.Value(0);
    this.translateXGroups = new Animated.Value(width);
    this.opacityVoile = new Animated.Value(0.3);
  }
  navigate(val, data) {
    this.props.navigation.push(val, data);
  }
  async componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.sports, nextProps.sports)) {
      await this.setState({loader: true});
      this.setState({loader: false});
    }
  }
  async changeSport(val) {
    await this.setState({loader: true});
    var that = this;
    setTimeout(function() {
      that.setState({loader: false});
    }, 400);
  }
  getAnimateHeader() {
    return this.scrollViewRef.getAnimateHeader();
  }
  switch(textOn, textOff, state, click) {
    return (
      <Switch
        textOn={textOn}
        textOff={textOff}
        finalColorOn={colors.primary}
        translateXTo={width / 2 - 20}
        height={50}
        state={this.state[state]}
        setState={(val) => click(val)}
      />
    );
  }
  homePageView() {
    const {
      groups,
      listEvents,
      listGroups,
      loaderEvents,
      loaderGroups,
    } = this.state;
    return (
      <View style={{paddingTop: 10, minHeight: height / 1.5}}>
        <View style={styleApp.marginView}>
          {this.switch('Events', 'Groups', 'groups', async (val) => {
            await this.setState({groups: val});
            if (val) {
              await this.translateXEvents.setValue(-width);
              await this.translateXGroups.setValue(0);
            } else {
              await this.translateXEvents.setValue(0);
              await this.translateXGroups.setValue(width);
            }
            return true;
          })}
        </View>

        {!groups ? (
          <FadeInView duration={300}>
            <NewEvents
              navigate={this.navigate.bind(this)}
              setState={async (state) => await this.setState(state)}
              listEvents={listEvents}
              loader={loaderEvents}
              navigate1={(val, data) =>
                this.props.navigation.navigate(val, data)
              }
              onRef={(ref) => (this.eventGroupsRef = ref)}
            />
          </FadeInView>
        ) : (
          <FadeInView duration={300}>
            <GroupsAround
              navigate={this.navigate.bind(this)}
              setState={async (state) => await this.setState(state)}
              listGroups={listGroups}
              loader={loaderGroups}
              navigate1={(val, data) =>
                this.props.navigation.navigate(val, data)
              }
              onRef={(ref) => (this.groupsAroundRef = ref)}
            />
          </FadeInView>
        )}
      </View>
    );
  }
  async refresh() {
    try {
      this.eventGroupsRef.reload();
    } catch (err) {}
    try {
      this.groupsAroundRef.reload();
    } catch (err) {}
    return true;
  }
  render() {
    const {sports} = this.props;
    return (
      <View style={styleApp.stylePage}>
        <HeaderHome
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Organize your event'}
          inputRange={[0, sizes.heightHeaderHome + 0]}
          initialBorderColorIcon={colors.off}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1="arrow-left"
          league={true}
          sports={sports}
          icon2={'map-marker-alt'}
          sizeIcon2={20}
          typeIcon2={'font'}
          clickButton2={() =>
            this.props.navigation.navigate('Location', {
              pageFrom: 'Home',
              setUserLocation: true,
            })
          }
        />

        <ScrollView2
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.homePageView()}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderFilter - 30}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottom={0}
          colorRefresh={colors.title}
          stickyHeaderIndices={[3]}
          refreshControl={true}
          refresh={() => this.refresh()}
          initialColorIcon={colors.title}
          offsetBottom={100}
          showsVerticalScrollIndicator={false}
        />
        <Animated.View
          style={[
            styleApp.voile,
            {
              opacity: this.opacityVoile,
              transform: [{translateX: this.translateXVoile}],
            },
          ]}>
          <TouchableOpacity
            style={styleApp.fullSize}
            onPress={() => this.buttonAddRef.close()}
          />
        </Animated.View>

        {/* <ButtonColor
          view={() => {
            return (
              <Row>
                <Col size={50} style={styleApp.center}>
                  <AllIcons
                    name="map-marker-alt"
                    color={colors.blue}
                    size={16}
                    type="font"
                  />
                </Col>
                <Col size={70} style={styleApp.center2}>
                  <Text style={styleApp.text}> Map</Text>
                </Col>
              </Row>
            );
          }}
          color={'white'}
          style={[styleApp.center, styleApp.shade2, styleApp.buttonMap]}
          click={() => {
            this.props.navigation.navigate('MapPage');
          }}
          onPressColor={colors.off}
        /> */}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userIDSaved,
    blockedUsersID: state.user.infoUser.blockedUsers,
    sports: state.globaleVariables.sports.list,
  };
};

export default connect(
  mapStateToProps,
  {historicSearchAction},
)(HomeScreen);
