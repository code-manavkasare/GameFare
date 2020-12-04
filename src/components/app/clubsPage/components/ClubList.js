import React, {Component} from 'react';
import {Animated} from 'react-native';
import {connect} from 'react-redux';
import {object, string, func} from 'prop-types';

import styleApp from '../../../style/style';
import {userClubsSelector} from '../../../../store/selectors/clubs';
import CardClub from './CardClub';
import {FlatListComponent} from '../../../layout/Views/FlatList';

class ClubList extends Component {
  static propTypes = {
    clubs: object,
    selectClub: func,
    selectedClubID: string,
  };
  static defaultProps = {};

  selectClub = (clubID) => {
    const {selectClub} = this.props;
    return selectClub(clubID);
  };
  renderClub = ({item: {id: clubID}}) => {
    const {selectedClubID} = this.props;
    return (
      <CardClub
        id={clubID}
        selectClub={() => this.selectClub(clubID)}
        selectedClubID={selectedClubID}
      />
    );
  };
  renderAddClub = () => <CardClub addClub />;
  render() {
    const {clubs} = this.props;
    const flatListStyle = {
      paddingHorizontal: '5%',
      width: clubs.length ? clubs.length * 100 + 150 : 0,
    };
    return (
      <FlatListComponent
        styleContainer={flatListStyle}
        horizontal
        showsHorizontalScrollIndicator={false}
        list={clubs}
        lengthList={clubs.length}
        cardList={this.renderClub}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        footer={this.renderAddClub}
        footerStyle={styleApp.fullSize}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    clubs: userClubsSelector(state),
  };
};

export default connect(mapStateToProps)(ClubList);
