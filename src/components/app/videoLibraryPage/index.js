import React, {Component} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';

import CardArchive from '../coachFlow/GroupsPage/components/StreamView/footer/components/CardArchive';
import VideoBeingShared from './components/VideoBeingShared';
import {FlatListComponent} from '../../layout/Views/FlatList';
import Button from '../../layout/buttons/Button';
import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';
import ModalHeader from '../../layout/headers/ModalHeader';
import AsyncImage from '../../layout/image/AsyncImage';

import {rowTitle} from '../TeamPage/components/elements';

import sizes from '../../style/sizes';
import {
  openVideoPlayer,
  deleteVideos,
  selectVideosFromCameraRoll,
} from '../../functions/videoManagement';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import {navigate} from '../../../../NavigationService';
import HeaderVideoLibrary from './components/HeaderVideoLibrary';
import ToolRow from './components/ToolRow';
import {store} from '../../../store/reduxStore';
import {videoLibrarySelector} from '../../../store/selectors/archives';
import {fetchArchives} from '../../database/firebase/fetchData';
import {currentSessionIDSelector} from '../../../store/selectors/sessions';
import {
  userConnectedSelector,
  userInfoSelector,
} from '../../../store/selectors/user';
import CamerarollList from './components/CamerarollList';
import {portraitSelector} from '../../../store/selectors/layout';

class VideoLibraryPage extends Component {
  constructor(props) {
    super(props);
    const {params} = props.route;
    this.state = {
      loader: false,
      hideLocal: params ? params.hideLocal : false,
      hideCloud: params ? params.hideCloud : false,
      selectableMode: params ? params.selectableMode : false,
      selectOnly: params ? params.selectOnly : false,
      selectOne: params ? params.selectOnly && params.selectOne : false,
      selectFromCameraRoll: params ? params.selectFromCameraRoll : false,
      modalMode: params ? params.modalMode : false,
      selectedVideos: [],
      nonplayableVideos: 0,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount = () => {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      const currentSessionID = store.getState().coach.currentSessionID;
      if (currentSessionID) this.setState({selectableMode: true});
    });
  };
  componentWillUnmount = () => {
    this.focusListener();
  };
  componentDidUpdate(prevProps) {
    const {userConnected} = this.props;
    if (userConnected !== prevProps.userConnected)
      this.flatListRef.setState({numberToRender: 12});
  }
  toggleSelectable = (force) => {
    const {selectableMode} = this.state;
    this.setState({selectableMode: force ? false : !selectableMode});
  };
  playSelectedVideos = ({forceSharing}) => {
    const {selectedVideos, nonplayableVideos} = this.state;
    if (nonplayableVideos > 0) return;
    openVideoPlayer({
      archives: selectedVideos,
      open: true,
      forceSharing,
    });
  };
  shareSelectedVideos = async () => {
    const {selectedVideos} = this.state;
    const {navigation, userConnected} = this.props;
    if (!userConnected) return navigation.navigate('SignIn');
    if (selectedVideos.length > 0) {
      navigation.navigate('ModalCallTab', {
        action: 'shareArchives',
        archivesToShare: selectedVideos,
        modal: true,
        inlineSearch: true,
      });
    }
  };
  deleteSelectedVideos = () => {
    const {selectedVideos} = this.state;
    const numberVideos = selectedVideos.length;
    if (numberVideos > 0) {
      navigate('Alert', {
        title:
          'Are you sure you want to delete ' +
          (numberVideos === 1 ? 'this video' : 'these videos') +
          '?',
        subtitle: 'This action cannot be undone.',
        textButton: `Delete (${numberVideos})`,
        onGoBack: async () => {
          await this.setState({
            selectedVideos: [],
            selectableMode: false,
          });
          return deleteVideos(selectedVideos);
        },
      });
    }
  };
  selectVideo = ({id, playable}) => {
    let nextSelectedVideos = this.state.selectedVideos.slice();
    let {nonplayableVideos} = this.state;
    if (nextSelectedVideos.filter((idVideo) => idVideo === id).length === 0) {
      nextSelectedVideos.push(id);
      if (playable === false) nonplayableVideos++;
    } else {
      nextSelectedVideos = nextSelectedVideos.filter(
        (idVideo) => idVideo !== id,
      );
      if (playable === false) nonplayableVideos--;
    }

    this.setState({selectedVideos: nextSelectedVideos, nonplayableVideos});
  };

  settingsRow = () => {
    const {navigation} = this.props;
    return (
      <View style={styles.settingsRowContainer}>
        <Row style={styles.settingsRow}>
          <ButtonColor
            view={() => {
              return (
                <AllIcons
                  type={'font'}
                  color={colors.white}
                  size={16}
                  name={'pen'}
                  solid
                />
              );
            }}
            style={styles.settingsRowButton}
            color={colors.greyDarker}
            click={this.goToEditProfile}
            onPressColor={'transparent'}
          />
          <ButtonColor
            view={() => {
              return (
                <AllIcons
                  type={'font'}
                  color={colors.white}
                  size={16}
                  name={'cog'}
                />
              );
            }}
            style={styles.settingsRowButton}
            color={colors.greyDarker}
            click={() => navigation.navigate('MorePage')}
            onPressColor={'transparent'}
          />
          <ButtonColor
            view={() => {
              return (
                <AllIcons
                  type={'font'}
                  color={colors.white}
                  size={16}
                  name={'plus'}
                  solid
                />
              );
            }}
            style={styles.settingsRowButton}
            color={colors.blue}
            click={selectVideosFromCameraRoll}
            onPressColor={'transparent'}
          />
        </Row>
      </View>
    );
  };

  listVideos = () => {
    const {navigation, videosArray} = this.props;
    const {
      selectOnly,
      selectableMode,
      selectFromCameraRoll,
      modalMode,
    } = this.state;
    const selectMargin = selectableMode ? 80 : 0;

    if (selectFromCameraRoll) {
      return <CamerarollList />;
    }
    return (
      <View style={styleApp.fullSize}>
        <FlatListComponent
          styleContainer={{
            paddingTop: 80,
          }}
          list={videosArray}
          lengthList={videosArray.length}
          cardList={({item: videoID, index}) =>
            this.renderCardArchive(videoID, index)
          }
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onRef={(ref) => {
            this.flatListRef = ref;
          }}
          fetchData={async ({numberToRender, nextNumberRender}) => {
            if (nextNumberRender !== videosArray.length)
              await fetchArchives({
                listIds: videosArray.slice(
                  numberToRender === 0 ? 0 : numberToRender - 1,
                  nextNumberRender,
                ),
              });
          }}
          ListEmptyComponent={{
            clickButton: () => navigation.navigate('Session'),
            textButton: 'Record',
            iconButton: 'video',
            clickButton2: () => selectVideosFromCameraRoll(),
            textButton2: 'Pick from library',
            iconButton2: 'images',
            text: `You don't have any videos yet.`,

            image: require('../../../img/images/video-player.png'),
          }}
          header={
            <View>
              {!modalMode ? this.profileHeader() : null}
              {!modalMode ? this.settingsRow() : null}
              {!modalMode
                ? rowTitle({
                    hideDividerHeader: true,
                    title: !selectableMode ? 'Library' : 'Select Videos',
                    titleColor: colors.greyDarker,
                    titleStyle: {
                      fontWeight: '800',
                      fontSize: 17,
                    },
                    containerStyle: {
                      marginTop: 20,
                    },
                    button: {
                      click: this.toggleSelectable,
                      text: 'Select',
                      color: colors.greyMidDark,
                      onPressColor: colors.greyDark,
                      fontSize: 12,
                      style: {
                        height: 25,
                        width: '90%',
                      },
                    },
                  })
                : null}
              <VideoBeingShared />
            </View>
          }
          numColumns={3}
          incrementRendering={18}
          initialNumberToRender={15}
          showsVerticalScrollIndicator={false}
          paddingBottom={
            selectOnly
              ? 0
              : sizes.heightFooter + sizes.marginBottomApp + 30 + selectMargin
          }
          AnimatedHeaderValue={this.AnimatedHeaderValue}
        />
      </View>
    );
  };
  renderCardArchive(videoID, index) {
    const {selectableMode, selectedVideos} = this.state;
    const isSelected =
      selectedVideos.filter((idVideo) => idVideo === videoID).length !== 0;

    let styleBorder = {};
    if ((Number(index) + 1) % 3 === 0)
      styleBorder = {
        borderLeftWidth: 1.5,
      };

    if ((Number(index) + 3) % 3 === 0)
      styleBorder = {
        borderRightWidth: 1.5,
      };
    const {width} = Dimensions.get('screen');
    return (
      <CardArchive
        selectableMode={selectableMode}
        isSelected={isSelected}
        selectVideo={this.selectVideo}
        style={[styles.cardArchive, styleBorder, {width: width / 3}]}
        id={videoID}
        index={index}
        key={videoID}
        noUpdateStatusBar={true}
      />
    );
  }

  confirmVideo = async () => {
    const {route, navigation} = this.props;
    const {selectedVideos} = this.state;
    await this.setState({loader: true});
    await route.params.confirmVideo(selectedVideos);
    if (route.params.navigateBackAfterConfirm) {
      return navigation.goBack();
    }
  };

  goToEditProfile = () => {
    this.props.navigation.navigate('EditProfilePage');
  };

  profilePhoto = () => {
    let {infoUser} = this.props;
    return infoUser.picture ? (
      <AsyncImage style={styles.asyncImage} mainImage={infoUser.picture} />
    ) : (
      <View style={[styles.asyncImage, styleApp.center]}>
        <Text style={styles.initialsText}>
          {infoUser?.firstname[0] + infoUser.lastname[0]}
        </Text>
      </View>
    );
  };

  profileHeader = () => {
    let {infoUser} = this.props;
    return (
      <TouchableOpacity
        onPress={this.goToEditProfile}
        style={{...styleApp.marginView, marginTop: -45}}
        activeOpacity={0.9}>
        <Col>
          <Col size={40} style={styleApp.center}>
            {this.profilePhoto()}
          </Col>
          <Col size={60} style={{...styleApp.center, marginTop: 15}}>
            <Text style={styleApp.title}>
              {infoUser.firstname + ' ' + infoUser.lastname}
            </Text>
            <Text style={styles.phoneNumber}>
              {infoUser.countryCode + ' ' + infoUser.phoneNumber}
            </Text>
          </Col>
        </Col>
      </TouchableOpacity>
    );
  };

  render() {
    const {navigation, position, videosArray, userConnected} = this.props;

    const {
      selectableMode,
      loader,
      selectedVideos,
      selectOnly,
      selectFromCameraRoll,
      modalMode,
    } = this.state;
    const containerStyle = modalMode
      ? styleApp.stylePageModal
      : styleApp.stylePage;
    const listContainerStyle = {
      paddingTop: modalMode ? 0 : 0,
      zIndex: 10,
    };
    return (
      <View style={containerStyle}>
        {modalMode ? (
          <ModalHeader
            title={
              selectFromCameraRoll
                ? 'Add from Camera Roll'
                : selectableMode
                ? 'Select Videos'
                : 'Library'
            }
          />
        ) : (
          <HeaderVideoLibrary
            AnimatedHeaderValue={this.AnimatedHeaderValue}
            navigation={navigation}
            selectOnly={selectOnly}
            text={!selectableMode ? 'Library' : 'Select Videos'}
            selectableMode={selectableMode}
            toggleSelectable={this.toggleSelectable}
            selectVideosFromCameraRoll={selectVideosFromCameraRoll}
            isListEmpty={videosArray.length === 0}
          />
        )}

        <View style={listContainerStyle}>{this.listVideos()}</View>

        {selectOnly && selectedVideos.length > 0 ? (
          <View style={[styleApp.footerBooking, styleApp.marginView]}>
            <Button
              text={`Confirm ${selectedVideos.length} videos`}
              backgroundColor={'green'}
              loader={loader}
              onPressColor={colors.greenLight}
              click={this.confirmVideo}
            />
          </View>
        ) : null}

        {!selectOnly ? (
          <ToolRow
            onRef={(ref) => {
              this.toolRowRef = ref;
            }}
            positon={position}
            clickButton1={this.toggleSelectable}
            isButton2Selected={selectableMode}
            clickButton0={this.playSelectedVideos}
            clickButton4={this.deleteSelectedVideos}
            clickButton3={this.shareSelectedVideos}
            clickButton2={this.playSelectedVideos}
            selectedVideos={selectedVideos}
            addFromCameraRoll={this.addFromCameraRoll}
            selectVideo={this.selectVideo}
          />
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cardArchive: {
    height: 170,
    borderRadius: 0,
    overflow: 'hidden',
    borderBottomWidth: 1.5,
    borderColor: colors.white,
    backgroundColor: colors.title,
  },
  settingsRowContainer: {
    height: 50,
    width: '100%',
    ...styleApp.center,
    marginTop: 20,
  },
  settingsRow: {
    width: '70%',
    maxWidth: 240,
    ...styleApp.center,
    justifyContent: 'space-evenly',
  },
  settingsRowButton: {
    width: 45,
    height: 45,
    borderRadius: 25,
    ...styleApp.shadow,
  },
  phoneNumber: {
    ...styleApp.subtitle,
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  asyncImage: {
    width: 130,
    height: 130,
    borderColor: colors.greyMidDark,
    borderRadius: 30,
    backgroundColor: colors.greyMidDark,
    ...styleApp.shadowWeak,
  },
  initialsText: {
    ...styleApp.textBold,
    color: colors.greyLighter,
    fontSize: 33,
    letterSpacing: 1,
    marginLeft: 4,
  },
});
const mapStateToProps = (state) => {
  return {
    infoUser: userInfoSelector(state),
    videosArray: videoLibrarySelector(state),
    currentSessionID: currentSessionIDSelector(state),
    userConnected: userConnectedSelector(state),
    portrait: portraitSelector(state),
  };
};

export default connect(mapStateToProps)(VideoLibraryPage);
