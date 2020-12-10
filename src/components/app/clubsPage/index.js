import React, {Component} from 'react';
import {View} from 'react-native';
import {object, bool} from 'prop-types';
import Animated from 'react-native-reanimated';

import styleApp from '../../style/style';
import ClubsHeader from './components/ClubsHeader';
import ButtonBook from './components/ButtonBook';
import PostFeed from './components/PostFeed';

export default class ClubsPage extends Component {
  static propTypes = {
    navigation: object,
    infoUser: object,
    userConnected: bool,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const {params} = props?.route;
    this.state = {
      currentClubID: params?.clubID ?? undefined,
      lastPropsUpdate: null,
    };
    this.AnimatedScrollValue = new Animated.Value(0);
  }
  static getDerivedStateFromProps = (props, state) => {
    const {currentClubID, lastPropsUpdate} = state;
    const timestamp = props.route.params?.timestamp;
    const clubID = props.route.params?.clubID;

    // store timestamp of branch link click in order to update the clubID only once
    if (lastPropsUpdate !== timestamp) {
      return {currentClubID: clubID, lastPropsUpdate: timestamp};
    }
    return {currentClubID};
  };
  changeFocusedClub = (clubID) => {
    this.setState({currentClubID: clubID});
  };
  feedView() {
    const {currentClubID} = this.state;
    if (!currentClubID) return null;
    return (
      <PostFeed
        currentClubID={currentClubID}
        AnimatedScrollValue={this.AnimatedScrollValue}
      />
    );
  }
  bookButton() {
    const {currentClubID} = this.state;
    if (!currentClubID) return null;
    return <ButtonBook currentClubID={currentClubID} />;
  }
  render() {
    const {navigation} = this.props;
    const {currentClubID} = this.state;
    return (
      <View style={styleApp.stylePage}>
        <ClubsHeader
          AnimatedScrollValue={this.AnimatedScrollValue}
          navigation={navigation}
          selectClub={this.changeFocusedClub}
          currentClubID={currentClubID}
        />
        {this.feedView()}
        {this.bookButton()}
      </View>
    );
  }
}
