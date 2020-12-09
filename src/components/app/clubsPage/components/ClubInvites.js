import React, {Component} from 'react';
import {Animated, View} from 'react-native';
import {connect} from 'react-redux';
import {object} from 'prop-types';

import {goBack} from '../../../../../NavigationService';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {heightHeaderHome} from '../../../style/sizes';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import {userInfoSelector} from '../../../../store/selectors/user';
import {userClubInvitesSelector} from '../../../../store/selectors/clubs';
import {FlatListComponent} from '../../../layout/Views/FlatList';
import CardClub from './CardClub';

class ClubInvites extends Component {
  static propTypes = {
    navigation: object,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidUpdate(prevProps) {
    const {clubInvites} = this.props;
    const {clubInvites: prevClubInvites} = prevProps;
    if (clubInvites.length === 0 && prevClubInvites !== 0) {
      goBack();
    }
  }
  renderClub = ({item: {id: clubID}}) => {
    return <CardClub id={clubID} displayAsInvitation />;
  };
  render() {
    const {navigation, clubInvites} = this.props;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          marginTop={10}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Club Invites'}
          inputRange={[0, 10]}
          initialBorderColorIcon={'transparent'}
          initialBackgroundColor={colors.white}
          initialTitleOpacity={1}
          initialBorderWidth={1}
          initialBorderColorHeader={'transparent'}
          icon1={'times'}
          sizeIcon1={17}
          clickButton1={navigation.goBack}
        />
        <FlatListComponent
          styleContainer={{
            ...styleApp.marginView,
            paddingTop: heightHeaderHome + 20,
          }}
          list={clubInvites}
          lengthList={clubInvites.length}
          cardList={this.renderClub}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    infoUser: userInfoSelector(state),
    clubInvites: userClubInvitesSelector(state),
  };
};

export default connect(mapStateToProps)(ClubInvites);
