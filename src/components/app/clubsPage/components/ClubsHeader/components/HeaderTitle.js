import {Component} from 'react';
import {string, number, bool} from 'prop-types';
import {connect} from 'react-redux';

import colors from '../../../../../style/colors';
import {rowTitle} from '../../../../TeamPage/components/elements';

import {boolShouldComponentUpdate} from '../../../../../functions/redux';
import {
  clubSelector,
  userClubInvitesSelector,
} from '../../../../../../store/selectors/clubs';

class HeaderTitle extends Component {
  static propTypes = {
    currentClubID: string,
    listVisible: bool,
    rowHeight: number,
  };
  static defaultProps = {};
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'HeaderTitle',
    });
  }
  render() {
    const {
      listVisible,
      currentClub,
      clubInvites,
      rowHeight,
      click,
    } = this.props;
    const title = currentClub?.info?.title;
    return rowTitle({
      hideDividerHeader: true,
      title: listVisible || !title ? 'Clubs' : title,
      titleColor: colors.greyDarker,
      titleStyle: {
        fontWeight: '800',
        fontSize: 23,
      },
      containerStyle: {
        paddingHorizontal: '5%',
        height: rowHeight,
      },
      clickOnRow: true,
      button: {
        click: click ? click : () => {},
        icon: {
          type: 'font',
          color:
            listVisible || !clubInvites.length
              ? colors.greyDarker
              : colors.primary,
          name: listVisible
            ? 'chevron-up'
            : clubInvites.length
            ? 'circle'
            : 'chevron-down',
        },
        color: 'transparent',
        onPressColor: 'transparent',
        fontSize: 12,
        style: {
          height: 25,
          width: 25,
        },
      },
    });
  }
}

const mapStateToProps = (state, props) => {
  return {
    clubInvites: userClubInvitesSelector(state),
    currentClub: clubSelector(state, {id: props.currentClubID}),
  };
};

export default connect(mapStateToProps)(HeaderTitle);
