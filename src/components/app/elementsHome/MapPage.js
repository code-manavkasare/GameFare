import {connect} from 'react-redux';
import MapView, {Marker} from 'react-native-maps';
import {Col, Row} from 'react-native-easy-grid';
import {View, Animated, Text, Dimensions, StyleSheet} from 'react-native';
import React, {Component} from 'react';

import {eventsAction} from '../../../actions/eventsActions';
import {historicSearchAction} from '../../../actions/historicSearchActions';
import {getEventPublic} from '../../database/algolia';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import ScrollViewX from '../../layout/scrollViews/ScrollViewX';
import colors from '../../style/colors';
import styleApp from '../../style/style';
import AllIcons from '../../layout/icons/AllIcons';
import CardEvent from './CardEventSM';
import ButtonColor from '../../layout/Views/Button';

const {height, width} = Dimensions.get('screen');

class MapPage extends Component {
  constructor(props) {
    super(props);
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  state = {
    loader: false,
    mapCenter: {
      lat: this.props.searchLocation.lat,
      lng: this.props.searchLocation.lng,
    },
    selectedMarkerObjectID: false,
    eventsArray: [],
    filters: {},
    filtersNumber: 0,
    stopScrollListening: false,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.searchLocation !== prevProps.searchLocation) {
      await this.setState({stopScrollListening: true});
      await this.getEvents();
      this.initialiseToFirstMarker();

      if (!this.state.eventsArray[0]) {
        const {lat, lng} = this.props.searchLocation;
        this.map.animateToRegion({
          latitude: lat,
          longitude: lng,
        });
      }
    }
  }

  async componentDidMount() {
    const allPublicEvents = this.props.publicEvents.map(
      (event) => this.props.allEvents[event],
    );
    await this.setState({eventsArray: allPublicEvents});
    this.initialiseToFirstMarker();
  }

  initialMarker = () => {
    const firstSelectedMarker = this.state.eventsArray[0].objectID;
    this.setState({selectedMarkerObjectID: firstSelectedMarker});
  };

  animateMapToInitialMarker = () => {
    const {lat, lng} = this.state.eventsArray[0].location;
    const {latitudeDelta, longitudeDelta} = this.state;
    this.map.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta,
      longitudeDelta,
    });
  };

  initialiseToFirstMarker = () => {
    if (this.state.eventsArray[0]) {
      this.animateMapToInitialMarker();
      this.initialMarker();
      this.scrollViewXRef.scrollTo(0);
    }
  };

  getEvents = async () => {
    this.setState({loader: true});
    const {searchLocation, sportSelected, leagueSelected} = this.props;
    const NewEventsList = await getEventPublic(
      searchLocation,
      sportSelected,
      leagueSelected,
      this.state.filters,
      this.props.userID,
    );
    this.setState({eventsArray: Object.values(NewEventsList), loader: false});
  };

  listEvents = (events) => {
    return events.map((event, i) => (
      <CardEvent
        size={'SM'}
        userCard={false}
        key={i}
        index={i}
        league={this.props.leagueSelected}
        loadData={false}
        homePage={true}
        item={event}
        data={event}
        pagingEnabled={true}
      />
    ));
  };

  onMarkerSelect = async (eventData) => {
    await this.srollListToEventSelected(eventData);
    const {lat: latitude, lng: longitude} = eventData.location;
    this.setState({
      selectedMarkerObjectID: eventData.objectID,
    });
    this.map.animateToRegion({
      latitude,
      longitude,
    });
  };

  onMarkerDeselect = () => {
    this.setState({selectedMarkerObjectID: false});
  };

  hideScrollViewX = () => {
    if (this.state.showScrollViewX) {
      this.setState({showScrollViewX: false});
    }
  };

  srollListToEventSelected = async (eventData) => {
    await this.setState({stopScrollListening: true});
    const numPageEvent = this.state.eventsArray.indexOf(eventData);
    this.scrollViewXRef.scrollTo(numPageEvent * width);
  };

  applyFilters = async (filters) => {
    await this.setState({
      filters: filters,
      filtersNumber: Object.keys(filters).length,
    });
    await this.getEvents();
    this.initialiseToFirstMarker();
  };

  onScrollViewX = async (data) => {
    const contentOffsetX = data.nativeEvent.contentOffset.x;
    const pageNum = Math.floor(contentOffsetX / width);

    if (pageNum >= 0 && !this.state.stopScrollListening) {
      const {lat, lng} = this.state.eventsArray[pageNum].location;

      this.map.animateToRegion({
        latitude: lat,
        longitude: lng,
      });

      this.setState({
        selectedMarkerObjectID: this.state.eventsArray[pageNum].objectID,
      });
    }

    //Recalibrate last event Card when scrolled away
    if (
      pageNum + 1 === this.state.eventsArray.length &&
      !this.state.stopScrollListening
    ) {
      await this.setState({stopScrollListening: true});
      this.scrollViewXRef.scrollTo(pageNum * width);
    }
  };

  onScrollEndScrollViewX = () => {
    this.setState({stopScrollListening: false});
  };

  render() {
    const {lat: latCenter, lng: lngCenter} = this.state.mapCenter;
    const {latitudeDelta, longitudeDelta} = this.state;

    return (
      <View style={{height: height, width: width}}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          inputRange={[5, 10]}
          loader={this.state.loader}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'transparent'}
          initialTitleOpacity={1}
          icon1={'times'}
          icon2={'map-marker-alt'}
          sizeIcon2={20}
          typeIcon2={'font'}
          clickButton1={() => this.props.navigation.goBack()}
          clickButton2={() =>
            this.props.navigation.navigate('Location', {
              pageFrom: 'MapPage',
              setUserLocation: true,
            })
          }
        />

        <MapView
          ref={(ref) => {
            this.map = ref;
          }}
          style={{height: height, width: width, position: 'absolute'}}
          initialRegion={{
            latitude: latCenter,
            longitude: lngCenter,
            latitudeDelta,
            longitudeDelta,
          }}
          loadingEnabled={true}
          onPanDrag={this.hideScrollViewX()}>
          {this.state.eventsArray.map((marker, i) => {
            const {lat: latitude, lng: longitude} = marker.location;
            return (
              <Marker
                coordinate={{latitude, longitude}}
                description={marker.description}
                key={marker.objectID}
                onSelect={() => this.onMarkerSelect(marker, i)}
                // onDeselect={() => this.onMarkerDeselect()}
              >
                <View>
                  <AllIcons
                    name="map-marker-alt"
                    color={
                      this.state.selectedMarkerObjectID === marker.objectID
                        ? colors.green
                        : colors.blue
                    }
                    size={25}
                    type="font"
                  />
                </View>
              </Marker>
            );
          })}
        </MapView>

        <View
          style={{
            position: 'absolute',
            bottom: 35,
            backgroundColor: 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            alignContent: 'center',
          }}>
          <ButtonColor
            view={() => {
              return (
                <Row>
                  <Col size={120} style={styleApp.center}>
                    <Text style={styleApp.text}>
                      Filters {''}
                      <Text>({this.state.filtersNumber})</Text>
                    </Text>
                  </Col>
                </Row>
              );
            }}
            color={'white'}
            style={[
              styleApp.center,
              styleApp.shade2,
              stylesMapPage.filterButton,
            ]}
            click={() =>
              this.props.navigation.navigate('MapFiltersModals', {
                pageFrom: 'MapPage',
                filters: this.state.filters,
                onGoBack: (filters) => this.applyFilters(filters),
              })
            }
            onPressColor={colors.off}
          />

          <ScrollViewX
            onScrollViewX={this.onScrollViewX}
            onScrollEndScrollViewX={this.onScrollEndScrollViewX}
            backgroundTransparent={true}
            loader={this.state.loader}
            placeHolder={[styleApp.cardEventSM, stylesMapPage.cardEventMap]}
            events={this.state.eventsArray}
            height={180}
            messageNoEvent={'No event found around'}
            content={(events) => this.listEvents(events)}
            onRef={(ref) => (this.scrollViewXRef = ref)}
            pagingEnabled={true}
          />
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    searchLocation: state.historicSearch.searchLocation,
    publicEvents: state.events.publicEvents,
    allEvents: state.events.allEvents,
    leagueSelected: state.historicSearch.league,
    sportSelected: state.historicSearch.sport,
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps, {historicSearchAction, eventsAction})(
  MapPage,
);

export const stylesMapPage = StyleSheet.create({
  filterButton: {
    borderColor: colors.off,
    height: 40,
    width: 105,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    zIndex: 40,
  },
  cardEventMap: {
    width: width - 40,
    marginRight: 40,
  },
});
