import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {groupsAction} from '../../../actions/groupsActions';
const {height, width} = Dimensions.get('screen');
import database from '@react-native-firebase/database';

import colors from '../../style/colors';
import FadeInView from 'react-native-fade-in-view';
import LinearGradient from 'react-native-linear-gradient';

import styleApp from '../../style/style';

class DescriptionView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      description: '',
      initFocus: false,
    };
  }
  componentDidMount() {
    if (!this.props.data.info.description) return this.load();
    return this.setState({loader: false});
  }
  async load() {
    var description = await database()
      .ref('groups/' + this.props.objectID + '/info/description/')
      .once('value');
    description = description.val();
    await this.props.groupsAction('editGroup', {
      ...this.props.data,
      info: {
        ...this.props.data.info,
        description: description,
      },
    });
    await this.setState({loader: false});
    return true;
  }
  async componentWillReceiveProps(nextProps) {}
  descriptionView() {
    return (
      <View style={styleApp.viewHome}>
        <View style={styleApp.marginView}>
          <Text style={[styleApp.text, {marginBottom: 0}]}>Description</Text>

          <View style={[styleApp.divider2, {marginBottom: 10}]} />
          {!this.props.data.info.description ? (
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={[colors.placeHolder1, colors.placeHolder2]}
              style={{
                height: 20,
                borderRadius: 7,
                marginRight: 80,
                marginTop: 10,
                marginLeft: 0,
              }}
            />
          ) : !this.props.editMode ? (
            <FadeInView duration={300} style={{marginTop: 5}}>
              <Text style={styleApp.smallText}>
                {this.props.data.info.description}
              </Text>
            </FadeInView>
          ) : (
            <TouchableOpacity
              style={{marginTop: 5}}
              activeOpacity={0.7}
              onPress={() => this.descRef.focus()}>
              <TextInput
                style={styleApp.smallText}
                multiline={true}
                placeholder={String(this.props.data.info.description)}
                returnKeyType={'done'}
                blurOnSubmit={true}
                onFocus={() => this.props.scrollToDescription()}
                ref={(input) => {
                  this.descRef = input;
                }}
                underlineColorAndroid="rgba(0,0,0,0)"
                autoCorrect={true}
                onChangeText={(text) => this.props.onChangeText(text)}
                value={this.props.value}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
  render() {
    return this.descriptionView();
  }
}

const mapStateToProps = (state) => {
  return {
    userConnected: state.user.userConnected,
  };
};

export default connect(
  mapStateToProps,
  {groupsAction},
)(DescriptionView);
