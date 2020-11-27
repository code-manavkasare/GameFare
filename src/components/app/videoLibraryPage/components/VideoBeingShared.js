import React, {Component} from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {connect} from 'react-redux';

import colors from '../../../style/colors';
import {isSomeoneSharingScreen} from '../../../functions/coach';
import CardArchive from '../../coachFlow/GroupsPage/components/StreamView/footer/components/CardArchive';

import ButtonColor from '../../../layout/Views/Button';
import {openVideoPlayer} from '../../../functions/videoManagement';
import styleApp from '../../../style/style';
import AllIcon from '../../../layout/icons/AllIcons';
import {
  currentSessionIDSelector,
  sessionSelector,
} from '../../../../store/selectors/sessions';
import {userIDSelector} from '../../../../store/selectors/user';

class VideoBeingShared extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {currentSessionID, session} = this.props;

    if (!currentSessionID) return null;
    const personSharingScreen = isSomeoneSharingScreen(session);
    if (!personSharingScreen) return null;
    if (!session.members[personSharingScreen].sharedVideos) return null;
    const videos = Object.keys(
      session.members[personSharingScreen].sharedVideos,
    );
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={40} style={{paddingTop: 5, marginLeft: -10}}>
                {videos.map((video, index) => {
                  return (
                    <CardArchive
                      style={{
                        height: 70,
                        width: 70,
                        left: Number(index) * 20,
                        borderRadius: 35,
                        borderWidth: 2,
                        borderColor: colors.off,
                        overflow: 'hidden',
                        // marginRight: 3,
                        position: 'absolute',
                        // backgroundColor: 'red',
                        // ...styleApp.shade,
                      }}
                      disableClick={true}
                      hideInformation={true}
                      unclickable={false}
                      id={video}
                      key={video}
                      noUpdateStatusBar={true}
                    />
                  );
                })}
              </Col>
              <Col size={30} style={styleApp.center2}>
                <Text style={styleApp.textBold}>{`${videos.length} video${
                  videos.length > 1 ? `s` : ''
                }`}</Text>
              </Col>
              <Col size={15} style={styleApp.center2}>
                <View
                  style={[
                    styleApp.center,
                    {
                      height: 25,
                      width: 50,
                      borderRadius: 5,
                      borderColor: colors.off,
                      backgroundColor: colors.red,
                      borderWidth: 1,
                    },
                  ]}>
                  <Text
                    style={[
                      styleApp.textBold,
                      {color: colors.white, fontSize: 12},
                    ]}>
                    Live
                  </Text>
                </View>
              </Col>
              <Col size={15} style={styleApp.center3}>
                <AllIcon
                  name={'play'}
                  size={12}
                  color={colors.greyDark}
                  type={'font'}
                />
              </Col>
            </Row>
          );
        }}
        style={[styles.button, styleApp.marginView]}
        click={() => openVideoPlayer({archives: videos, open: true})}
        color={colors.white}
        onPressColor={colors.off}
      />
    );
  }
}

const styles = StyleSheet.create({
  button: {
    height: 80,
    borderRadius: 5,
    marginBottom: 10,
    borderColor: colors.off,
    borderWidth: 0,
  },
});

const mapStateToProps = (state, props) => {
  const {currentSessionID} = state.coach;
  return {
    userID: userIDSelector(state),
    currentSessionID: currentSessionIDSelector(state),
    session: sessionSelector(state, {id: currentSessionID}),
  };
};

export default connect(mapStateToProps)(VideoBeingShared);
