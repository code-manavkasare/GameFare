import React, {Component} from 'react';
import {View} from 'react-native';
import {connect} from 'react-redux';
import {object, bool} from 'prop-types';
import Animated from 'react-native-reanimated';

import styleApp from '../../style/style';
import ClubsHeader from './components/ClubsHeader';
import PostFeed from './components/PostFeed';
import Button from '../../layout/buttons/Button';
import colors from '../../style/colors';

class ClubsPage extends Component {
  static propTypes = {
    navigation: object,
    infoUser: object,
    userConnected: bool,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      currentClubID: undefined,
    };
    this.AnimatedScrollValue = new Animated.Value(0);
  }
  changeFocusedClub = (clubID) => {
    this.setState({currentClubID: clubID});
  };
  book = () => {
    const {navigation} = this.props;
    const {currentClubID} = this.state;
    navigation.navigate('Club', {
      screen: 'BookService',
      params: {id: currentClubID},
    });
  };
  feedView() {
    const {currentClubID} = this.state;
    if (!currentClubID) return null;
    return (
      <View>
        <PostFeed
          currentClubID={currentClubID}
          AnimatedScrollValue={this.AnimatedScrollValue}
        />
        <View style={[styleApp.footerBook, styleApp.marginView]}>
          <Button
            backgroundColor="primary"
            onPressColor={colors.primaryLight}
            enabled={true}
            text={'Book'}
            styleButton={styleApp.shade}
            icon={{
              name: 'store-alt',
              size: 24,
              type: 'font',
              color: colors.white,
            }}
            click={this.book}
          />
        </View>
      </View>
    );
  }
  render() {
    const {navigation} = this.props;
    return (
      <View style={styleApp.stylePage}>
        <ClubsHeader
          AnimatedScrollValue={this.AnimatedScrollValue}
          navigation={navigation}
          selectClub={this.changeFocusedClub}
        />
        {this.feedView()}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps)(ClubsPage);
