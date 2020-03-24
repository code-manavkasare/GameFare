import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';

import CardSelect from '../../layout/cards/CardSelect';

import ScrollView from '../../layout/scrollViews/ScrollView';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import {coachAction} from '../../../actions/coachActions';
import Video from 'react-native-af-video-player';

import sizes from '../../style/sizes';
import colors from '../../style/colors';
import styleApp from '../../style/style';

class CoachingType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      options: [
        {
          value: 'live',
          label: 'Live session',
          action: 'StreamPageCoaching',
          icon: {name: 'play', type: 'font'},
        },
        {
          value: 'post',
          label: 'Post game review',
          action: 'StreamPageCoaching',
          icon: {name: 'undo-alt', type: 'font'},
        },
      ],
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  recordType() {
    const {navigate} = this.props.navigation;
    const {coachSession} = this.props.coach;
    const {options} = this.state;
    const {coachAction} = this.props;
    const {typeCoaching} = coachSession;
    const archive =
      'https://s3.amazonaws.com/tokbox.com.archive2/46561852/eb81264e-0684-4f03-9976-2f5bc32ce214/archive.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20200324T080338Z&X-Amz-SignedHeaders=host&X-Amz-Expires=600&X-Amz-Credential=AKIAT5VIDVNM7GIYBDFL%2F20200324%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=1302d2df2c4e4ed836835aaaf0448e81d31e3422b41796dec0c78e6659e3ba3a';
    return (
      <View>
        <View style={styleApp.marginView}>
          <Text style={[styleApp.title, {marginBottom: 15}]}>
            Et voila marroco
          </Text>
        </View>
        <Video
          hideFullScreenControl={true}
          url={archive}
          style={[styleApp.fullSize]}
        />
      </View>
    );
  }

  render() {
    const {goBack, dismiss} = this.props.navigation;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          icon1="arrow-left"
          initialTitleOpacity={1}
          icon2={null}
          clickButton1={() => dismiss()}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.recordType()}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    coach: state.coach,
  };
};

export default connect(mapStateToProps, {coachAction})(CoachingType);
