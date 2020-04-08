import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import FadeInView from 'react-native-fade-in-view';
import isEqual from 'lodash.isequal';
const {height, width} = Dimensions.get('screen');

import {historicSearchAction} from '../../../actions/historicSearchActions';

import HeaderHome from '../../layout/headers/HeaderHome';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import {
  heightFooter,
  heightHeaderFilter,
  heightHeaderHome,
} from '../../../components/style/sizes';
import MyGroups from './MyGroups';

import MyEvents from '../elementsHome/MyEvents';
import Switch from '../../layout/switch/Switch';

import ScrollView2 from '../../layout/scrollViews/ScrollView2';
import ButtonAdd from '../../app/elementsHome/ButtonAdd';
import Button from '../../layout/buttons/Button';

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      loader: false,
      groups: false,
    };
    this.translateXVoile = new Animated.Value(width);
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.opacityVoile = new Animated.Value(0.3);
  }
  navigate(val, data) {
    this.props.navigation.push(val, data);
  }
  async componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.sports, nextProps.sports)) {
      await this.setState({
        loader: true,
        filterSports: nextProps.sportSelected,
      });
      this.setState({loader: false});
    }
  }
  async changeSport(val) {
    await this.setState({loader: true, filterSports: val});
    var that = this;
    setTimeout(function () {
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
  ActivityTab(userConnected) {
    const {groups} = this.state;
    return (
      <View style={{paddingTop: 10, minHeight: height / 1.5}}>
        {userConnected ? (
          <View>
            <View style={styleApp.marginView}>
              {this.switch('My events', 'My groups', 'groups', async (val) => {
                await this.setState({groups: val});
                return true;
              })}
            </View>

            {!groups ? (
              <FadeInView duration={300}>
                <MyEvents
                  location={this.state.location}
                  search={this.state.search}
                  key={2}
                  onRef={(ref) => (this.myEventsRef = ref)}
                  setState={(data) => this.setState(data)}
                  loader={this.state.loader}
                  navigate={this.navigate.bind(this)}
                  navigate1={(val, data) =>
                    this.props.navigation.navigate(val, data)
                  }
                />
              </FadeInView>
            ) : (
              <FadeInView duration={300}>
                <MyGroups
                  navigate={this.navigate.bind(this)}
                  navigate1={(val, data) =>
                    this.props.navigation.navigate(val, data)
                  }
                  loader={this.state.loader}
                  onRef={(ref) => (this.myGroupsRef = ref)}
                />
              </FadeInView>
            )}
          </View>
        ) : (
          this.logoutView()
        )}
      </View>
    );
  }
  async refresh() {
    try {
      this.myGroupsRef.reload();
    } catch (err) {}

    try {
      this.myEventsRef.reload();
    } catch (err) {}
  }
  setLocation(location) {
    this.props.navigation.navigate('ListGroups');

    this.props.historicSearchAction('setLocationSearch', location);
  }
  logoutView() {
    return (
      <View style={[styleApp.marginView, {marginTop: 20}]}>
        <View style={styleApp.center}>
          <Image
            style={{height: 85, width: 85, marginBottom: 30}}
            source={require('../../../img/images/juice.png')}
          />
          <Text style={[styleApp.text, {marginBottom: 30}]}>
            Sign in to see your activity.
          </Text>
        </View>

        <Button
          text="Sign in"
          click={() => this.props.navigation.navigate('SignIn')}
          backgroundColor={'green'}
          onPressColor={colors.greenClick}
        />
      </View>
    );
  }
  render() {
    const {userConnected} = this.props;
    return (
      <View style={styleApp.stylePage}>
        {userConnected && (
          <HeaderHome
            AnimatedHeaderValue={this.AnimatedHeaderValue}
            textHeader={'Organize your event'}
            hideButton2={true}
            inputRange={[0, heightHeaderHome + 0]}
            initialBorderColorIcon={colors.off}
            initialBackgroundColor={'white'}
            initialTitleOpacity={1}
            icon1="arrow-left"
            league={true}
            sportSelected={this.props.sportSelected}
            sports={this.props.sports}
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
        )}

        <ScrollView2
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.ActivityTab(userConnected)}
          marginBottomScrollView={heightFooter}
          marginTop={heightHeaderFilter - 30}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          colorRefresh={colors.title}
          stickyHeaderIndices={[3]}
          refreshControl={true}
          refresh={() => this.refresh()}
          offsetBottom={120}
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
        <ButtonAdd
          translateXVoile={this.translateXVoile}
          opacityVoile={this.opacityVoile}
          onRef={(ref) => (this.buttonAddRef = ref)}
          typeButton={'group'}
          pageTo="CreateGroup0"
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    sports: state.globaleVariables.sports.list,
    sportSelected: state.historicSearch.sport,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps, {historicSearchAction})(HomeScreen);
