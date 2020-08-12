import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TextInput,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import StatusBar from '@react-native-community/status-bar';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import {
  heightHeaderHome,
  marginTopApp,
} from '../../style/sizes';

import {createShareVideosBranchUrl} from '../../database/branch';
import {shareVideosWithPeople, shareVideosWithTeam} from '../../functions/videoManagement';
import {openSession} from '../../functions/coach';
import AllIcons from '../../layout/icons/AllIcons';
import ButtonColor from '../../layout/Views/Button';
import ShareVideoHeader from './components/ShareVideoHeader';
import ShareVideoPreview from './components/ShareVideoPreview';

class ShareVideoPage extends React.Component {
  constructor(props) {
    super(props);
    this.focusListener = null;
  }
  async componentDidMount() {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      StatusBar.setBarStyle('light-content', true);
    });
  }
  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener();
    }
  }
  close() {
    this.props.navigation.pop();
  }
  async shareWithFriends() {
    const {navigation, route, user} = this.props;
    const {firebaseVideos, localVideos} = route.params;
    const {push, navigate} = navigation;
    let branchLink = '';
    if (firebaseVideos.length > 0) {
      const branchMetadata = firebaseVideos.reduce((result, video) => {
        return {
          ...result,
          [video.id]: video,
        };
      });
      branchLink = await createShareVideosBranchUrl(branchMetadata);
    }
    push('PickMembers', {
      allowSelectMultiple: true,
      selectFromSessions: false,
      selectFromGamefare: true,
      displayCurrentUser: false,
      noUpdateStatusBar: true,
      titleHeader: 'Select members to share with',
      noNavigation: true,
      branchLink,
      onSelectMembers: async (members, sessions) => {
        const {objectID} = await openSession(user, members);
        shareVideosWithTeam(localVideos, firebaseVideos, objectID);
        navigate('Conversation', {coachSessionID: objectID});
      }
    });
  }
  shareWithTeams() {
    const {navigation, route, user} = this.props;
    const {firebaseVideos, localVideos} = route.params;
    const {push, pop, navigate} = navigation;
    push('PickMembers', {
      allowSelectMultiple: true,
      selectFromSessions: true,
      selectFromGamefare: false,
      displayCurrentUser: false,
      noUpdateStatusBar: true,
      titleHeader: 'Select teams to share with',
      noNavigation: true,
      onSelectMembers: async (members, sessions) => {
        for (const {objectID} of Object.values(sessions)) {
          shareVideosWithTeam(localVideos, firebaseVideos, objectID);
        }
        if (Object.keys(sessions).length === 1) {
          navigate('Conversation', {coachSessionID: Object.values(sessions)[0].objectID});
        } else {
         pop(2);
        }
      }
    });
  }
  button(words, icon, action) {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={85} style={[styleApp.center2, {paddingLeft: 10}]}>
                <Text style={styleApp.textBold}>{words}</Text>
              </Col>
              <Col size={15} style={styleApp.center}>
                <AllIcons
                  name={icon}
                  color={colors.greyDark}
                  size={16}
                  type="font"
                />
              </Col>
            </Row>
          );
        }}
        click={() => action()}
        color="white"
        style={[
          {
            flex: 1,
            borderRadius: 3,
            height: 40,
          },
        ]}
        onPressColor={colors.off}
      />
    )
  }

  render() {
    const {route} = this.props;
    const {firebaseVideos, localVideos} = route.params;
    return (
      <View style={styleApp.stylePage} >
        <ShareVideoHeader close={() => this.close()}/>
        <Row size={25} style={[styleApp.marginView, {marginTop: marginTopApp + heightHeaderHome}]}>
          <ShareVideoPreview firebaseVideos={firebaseVideos} localVideos={localVideos} />
        </Row>
        <Row size={8} style={styleApp.marginView}>
          {this.button('Share with friends', 'arrow-right', () => this.shareWithFriends())}
        </Row>
        <Row size={8}style={styleApp.marginView}>
          {this.button('Share with teams', 'arrow-right', () => this.shareWithTeams())}
        </Row>
        <Row size={55} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  rowButton: {
    height: 40,
    width: '100%',
  },
});


const mapStateToProps = (state) => {
  return {
    user: {id: state.user.userID, info: state.user.infoUser},
  };
};

export default connect(
  mapStateToProps,
  {},
)(ShareVideoPage);
