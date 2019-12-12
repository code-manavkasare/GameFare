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
import {historicSearchAction} from '../../../actions/historicSearchActions';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import HeaderHome from '../../layout/headers/HeaderHome';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import MyGroups from './MyGroups';
import GroupsAround from './GroupsAround';

import ScrollView2 from '../../layout/scrollViews/ScrollView';
import AllIcons from '../../layout/icons/AllIcons';
const {height, width} = Dimensions.get('screen');
import StatusBar from '@react-native-community/status-bar';
import ButtonAdd from '../../app/elementsHome/ButtonAdd';

import sizes from '../../style/sizes';
import isEqual from 'lodash.isequal';

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      loader: false,
      unreadMessages: 3,
    };
    this.translateXVoile = new Animated.Value(width);
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.opacityVoile = new Animated.Value(0.3);
  }
  async componentDidMount() {
    StatusBar.setHidden(false, 'slide');
    StatusBar.setBarStyle('dark-content', true);
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
    setTimeout(function() {
      that.setState({loader: false});
    }, 400);
  }
  getAnimateHeader() {
    return this.scrollViewRef.getAnimateHeader();
  }
  messagePageView() {
    return (
      <View style={{paddingTop: 30, minHeight: height / 1.5}}>
        <MyGroups
          navigate={this.navigate.bind(this)}
          navigate1={(val, data) => this.props.navigation.navigate(val, data)}
          loader={this.state.loader}
          onRef={ref => (this.myGroupsRef = ref)}
        />

        <GroupsAround
          navigate={this.navigate.bind(this)}
          navigate1={(val, data) => this.props.navigation.navigate(val, data)}
          loader={this.state.loader}
          onRef={ref => (this.groupsAroundRef = ref)}
        />
      </View>
    );
  }
  async refresh() {
    // this.eventGroupsRef.reload()
    this.myGroupsRef.reload();
    this.groupsAroundRef.reload();
    return true;
  }
  setLocation(location) {
    this.props.historicSearchAction('setLocationSearch', location);
  }
  render() {
    return (
      <View style={styleApp.stylePage}>
        <HeaderHome
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          close={() =>
            this.props.navigation.navigate(
              this.props.navigation.getParam('pageFrom'),
            )
          }
          textHeader={'Organize your event'}
          inputRange={[0, sizes.heightHeaderHome + 0]}
          initialBorderColorIcon={colors.off}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1="arrow-left"
          league={false}
          sportSelected={this.props.sportSelected}
          sports={this.props.sports}
          icon2={'map-marker-alt'}
          sizeIcon2={20}
          typeIcon2={'font'}
          clickButton2={() =>
            this.props.navigation.navigate('Location', {
              pageFrom: 'ListGroups',
              onGoBack: data => this.setLocation(data),
            })
          }
          clickButton1={() =>
            this.props.navigation.navigate(
              this.props.navigation.getParam('pageFrom'),
            )
          }
        />

        <ScrollView2
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.messagePageView()}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderFilter - 30}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottom={0}
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
          ]}
        />
        <ButtonAdd
          translateXVoile={this.translateXVoile}
          opacityVoile={this.opacityVoile}
          new={val => {
            if (val == 'event')
              return this.props.navigation.navigate('CreateEvent0', {
                pageFrom: 'ListGroups',
              });
            return this.props.navigation.navigate('CreateGroup0', {
              pageFrom: 'ListGroups',
            });
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    height: 40,
    width: 120,
    backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voile: {
    position: 'absolute',
    height: height,
    backgroundColor: colors.title,
    width: width,
    opacity: 0.4,
    // zIndex:220,
  },
});

const mapStateToProps = state => {
  return {
    sports: state.globaleVariables.sports.list,
    sportSelected: state.historicSearch.sport,
  };
};

export default connect(mapStateToProps, {historicSearchAction})(HomeScreen);
