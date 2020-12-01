import React, {Component} from 'react';
import {Animated, View, Text, TextInput, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';

import {bindClub} from '../../../database/firebase/bindings';
import {clubSelector} from '../../../../store/selectors/clubs';
import {boolShouldComponentUpdate} from '../../../functions/redux';

class CardClub extends Component {
  static propTypes = {
    navigation: PropTypes.object,
    id: PropTypes.string,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount = () => {
    const {id} = this.props;
    bindClub(id);
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
  render() {
    const {club} = this.props;
    if (!club) return <View />;
    const {title, description} = club.info; 
    return (
      <View style={[styleApp.cardArchive, styleApp.center]}>
        <Text style={[styleApp.textBold, {color: colors.white}]}>{title}</Text>
        <Text style={[styleApp.smallText, {color: colors.white}]}>
          {description}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state, props) => {
  return {
    club: clubSelector(state, props),
  };
};

export default connect(mapStateToProps)(CardClub);
