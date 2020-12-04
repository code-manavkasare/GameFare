import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {string} from 'prop-types';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';

import {bindPost} from '../../../database/firebase/bindings';
import {postSelector} from '../../../../store/selectors/posts';
import {boolShouldComponentUpdate} from '../../../functions/redux';
import CardArchive from '../../coachFlow/GroupsPage/components/StreamView/footer/components/CardArchive';
import CardUser from '../../../layout/cards/CardUser';
import {FormatDate} from '../../../functions/date';

class CardClub extends Component {
  static propTypes = {
    id: string,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount = () => {
    const {id} = this.props;
    id && bindPost(id);
  };
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'CardClub',
    });
  }
  captionView = () => {
    const {post} = this.props;
    const {text, timestamp} = post;
    return (
      <View style={styles.captionView}>
        {text ? <Text style={styles.caption}>{text}</Text> : null}
        <Text style={styles.date}>
          <FormatDate date={timestamp} />
        </Text>
      </View>
    );
  };
  render() {
    const {post} = this.props;
    if (!post) return null;
    const {video, userID} = post;
    return (
      <View style={styleApp.cardPost}>
        <CardUser
          id={userID}
          style={styles.cardUser}
          styleText={styleApp.textBold}
        />
        <CardArchive
          style={styleApp.fullCardArchive}
          id={video}
          noUpdateStatusBar={true}
          hideInformation
        />
        {this.captionView()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cardUser: {...styleApp.marginView, marginBottom: 0, marginTop: -10},
  captionView: {...styleApp.marginView, marginTop: 15},
  caption: {...styleApp.text},
  date: {
    ...styleApp.textBold,
    marginTop: 5,
    fontSize: 14,
    color: colors.greyDark,
  },
});

const mapStateToProps = (state, props) => {
  return {
    post: postSelector(state, props),
  };
};

export default connect(mapStateToProps)(CardClub);
