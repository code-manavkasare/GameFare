import React, {Component} from 'react';
import {Animated, View, TextInput, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {object} from 'prop-types';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {heightHeaderModal} from '../../../style/sizes';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import ScrollView from '../../../layout/scrollViews/ScrollView2';
import {createPost} from '../../../functions/clubs';
import Button from '../../../layout/buttons/Button';
import {navigate} from '../../../../../NavigationService';
import CardArchive from '../../coachFlow/GroupsPage/components/StreamView/footer/components/CardArchive';
import KeyboardAwareButton from '../../../layout/buttons/KeyboardAwareButton';

class CreatePost extends Component {
  static propTypes = {
    navigation: object,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      video: undefined,
      text: '',
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  createPost = async () => {
    const {navigation, route} = this.props;
    const {clubID} = route.params;
    const {text, video} = this.state;
    await this.setState({loader: true});
    await createPost({text, video, clubID});
    navigation.goBack();
  };
  attachVideo = () => {
    navigate('SelectVideosFromLibrary', {
      selectableMode: true,
      selectOnly: true,
      selectOne: true,
      navigateBackAfterConfirm: true,
      modalMode: true,
      confirmVideo: async (selectedVideos) => {
        if (selectedVideos.length > 0) {
          this.setState({video: selectedVideos[0]});
        }
      },
    });
  };
  addVideoButton = () => {
    const {video} = this.state;
    return (
      <Button
        backgroundColor="primary"
        onPressColor={colors.primaryLight}
        enabled={true}
        text={!video ? 'Attach a Video' : 'Change Video'}
        styleButton={{height: 45}}
        click={this.attachVideo}
      />
    );
  };
  createPostForm = () => {
    const {text, video} = this.state;
    return (
      <View>
        {video ? (
          <CardArchive
            style={[styles.fullCardArchive, {height: 250}]}
            id={video}
            noUpdateStatusBar={true}
          />
        ) : null}
        <View style={[styleApp.marginView, {marginTop: 15}]}>
          {this.addVideoButton()}
          <TextInput
            style={styles.textInput}
            placeholder="Write a caption"
            multiline={true}
            autoCorrect={true}
            underlineColorAndroid="rgba(0,0,0,0)"
            blurOnSubmit={true}
            returnKeyType={'done'}
            placeholderTextColor={colors.greyDark}
            ref={(input) => {
              this.firstnameInput = input;
            }}
            inputAccessoryViewID={'text'}
            onChangeText={(text) => this.setState({text})}
            value={text}
          />
          <View style={{height: 30}} />
        </View>
      </View>
    );
  };
  confirmButton = () => {
    const {video, loader} = this.state;
    return (
      <KeyboardAwareButton
        disabled={!video}
        loader={loader}
        click={this.createPost}
        styleFooter={styleApp.footerModal}
        text={'Post to Club'}
        styleButton={{height: 55}}
        nativeID="text"
        backgroundColor="primary"
        onPressColor={colors.primaryLight}
      />
    );
  };
  render() {
    const {navigation} = this.props;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          marginTop={10}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Create a Post'}
          inputRange={[10, 20]}
          initialBorderColorIcon={'transparent'}
          initialBackgroundColor={'transparent'}
          initialTitleOpacity={1}
          initialBorderWidth={1}
          initialBorderColorHeader={'transparent'}
          icon1={'times'}
          sizeIcon1={17}
          clickButton1={navigation.goBack}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.createPostForm}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={heightHeaderModal + 5}
          offsetBottom={0}
          showsVerticalScrollIndicator={true}
        />
        {this.confirmButton()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textInput: {
    ...styleApp.textField,
    height: 100,
    paddingTop: 10,
    marginTop: 25,
  },
});

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps)(CreatePost);
