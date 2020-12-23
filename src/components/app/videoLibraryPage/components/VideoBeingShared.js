import React, {Component} from 'react';
import {Text, StyleSheet} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
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
import {width} from '../../../style/sizes';

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
    if (!session.sharedVideos) return null;
    const videos = Object.keys(session.sharedVideos);
    const displayVideos = Object.keys(session.sharedVideos).splice(0, 3);
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={40} style={{paddingTop: 10}}>
                {displayVideos.map((video, index) => {
                  return (
                    <CardArchive
                      style={{
                        height: 70,
                        width: 50,
                        left: Number(index) * 20,
                        borderRadius: 15,
                        overflow: 'hidden',
                        // marginRight: 3,
                        borderWidth: 3,
                        borderColor: colors.white,
                        position: 'absolute',
                        backgroundColor: colors.greyDark,
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
              <Col size={50} style={styleApp.center2}>
                <Text style={styleApp.textBold}>Currently Live</Text>
                <Text
                  style={{
                    ...styleApp.textBold,
                    color: colors.greyDark,
                    fontSize: 14,
                  }}>
                  {`${videos.length} video${videos.length === 1 ? '' : 's'}`}
                </Text>
              </Col>
              <Col size={10} style={styleApp.center}>
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
        style={[styles.button]}
        click={() =>
          openVideoPlayer({
            archives: videos,
            open: true,
            coachSessionID: currentSessionID,
          })
        }
        color={colors.white}
        onPressColor={colors.off}
      />
    );
  }
}

const styles = StyleSheet.create({
  button: {
    ...styleApp.marginView,
    ...styleApp.center,
    ...styleApp.shadow,
    height: 90,
    borderRadius: 15,
    marginBottom: -10,
    borderColor: colors.off,
    borderWidth: 0,
    width: width * 0.9,
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
