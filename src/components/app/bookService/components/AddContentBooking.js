import React, {Component} from 'react';
import {Animated, View, TextInput, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {object} from 'prop-types';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {heightHeaderModal} from '../../../style/sizes';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import ScrollView from '../../../layout/scrollViews/ScrollView';
import {addContentToBooking} from '../../../functions/booking';
import Button from '../../../layout/buttons/Button';
import {navigate} from '../../../../../NavigationService';
import CardArchive from '../../coachFlow/GroupsPage/components/StreamView/footer/components/CardArchive';

export default class AddContentBooking extends Component {
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
  addContentToBooking = async () => {
    const {route} = this.props;
    const {bookingID} = route.params;
    const {text, video} = this.state;
    await this.setState({loader: true});
    await addContentToBooking({text, video, bookingID});
    this.next();
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
          {this.confirmButton()}
        </View>
      </View>
    );
  };
  confirmButton = () => {
    const {text, video, loader} = this.state;
    return (
      <View style={{marginTop: 20}}>
        <Button
          backgroundColor="primary"
          onPressColor={colors.primaryLight}
          enabled={true}
          disabled={!video}
          text={'Finalize booking'}
          styleButton={{height: 55}}
          loader={loader}
          click={this.addContentToBooking}
        />
      </View>
    );
  };
  next = async () => {
    const {navigation} = this.props;
    await navigation.navigate('ClubsPage');
    navigation.navigate('Bookings');
  };
  render() {
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          marginTop={10}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Add content to your booking'}
          inputRange={[10, 20]}
          initialBorderColorIcon={'transparent'}
          initialBackgroundColor={'transparent'}
          initialTitleOpacity={1}
          initialBorderWidth={1}
          initialBorderColorHeader={'transparent'}
          icon2={'text'}
          text2="Skip"
          sizeIcon1={17}
          clickButton2={this.next}
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
