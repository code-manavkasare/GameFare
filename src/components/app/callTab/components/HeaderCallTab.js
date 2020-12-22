import React, {Component} from 'react';
import {Share, View, Text, StyleSheet} from 'react-native';
import database from '@react-native-firebase/database';
import {connect} from 'react-redux';

import {store} from '../../../../store/reduxStore';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import {createShareVideosBranchUrl} from '../../../database/branch';
import colors from '../../../style/colors';
import {getValueOnce} from '../../../database/firebase/methods';
import {shareVideosWithTeams} from '../../../functions/videoManagement';
import {timeout} from '../../../functions/coach';
import styleApp from '../../../style/style';
import {numFilteredNotificationsSelector} from '../../../../store/selectors/user';

class HeaderCallTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      branchLink: null,
    };
  }
  loopWaitUploadThumbnail = async (localVideos) => {
    const loop = [0, 1, 2, 3, 4];
    for (let i in loop) {
      const thumbnailStillUploading = localVideos.map((archive) => {
        const archiveInfo = store.getState().archives[archive];
        return archiveInfo.thumbnail.includes('https');
      });
      if (thumbnailStillUploading.length > 0) await timeout(1500);
      else break;
    }
    return true;
  };
  clickShare = async () => {
    const {archivesToShare} = this.props;
    let {branchLink} = this.state;
    if (!branchLink && archivesToShare) {
      await this.setState({loader: true});
      const infoArchives = archivesToShare.map(
        (archive) => store.getState().archives[archive],
      );

      const localVideos = infoArchives
        .filter((archive) => archive?.local)
        .map((archive) => archive.id);
      if (localVideos.length > 0) {
        await shareVideosWithTeams(localVideos, []);
        await this.loopWaitUploadThumbnail(localVideos);
      }

      const cloudVideos = infoArchives
        .filter((archive) => !archive?.local)
        .map((archive) => archive.id);
      const combinedVideos = cloudVideos.concat(localVideos);
      branchLink = await createShareVideosBranchUrl(combinedVideos);
      await this.setState({loader: false, branchLink});
    }
    Share.share({url: branchLink});
  };

  loopUploadingStatus = async () => {
    await this.setState({loader: true});
    const archivedStreams = await getValueOnce(`archivedStreams`);
    let updates = {};
    for (var i in archivedStreams) {
      let {local, id, thumbnail} = archivedStreams[i];
      if (!local) updates[`archivedStreams/${id}/progress`] = null;
    }
    await database()
      .ref()
      .update(updates);
    await this.setState({loader: false});
  };
  header() {
    const {modal, clickButton2, numNotifications} = this.props;
    const {loader} = this.state;
    return (
      <HeaderBackButton
        {...this.props}
        loader={loader}
        clickButton2={() => (modal ? this.clickShare() : clickButton2())}
        colorLoader={colors.title}
        badgeIcon2={
          numNotifications !== 0 &&
          !modal && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{numNotifications}</Text>
            </View>
          )
        }
      />
    );
  }
  render() {
    return this.header();
  }
}

const styles = StyleSheet.create({
  badge: {...styleApp.viewBadge, marginLeft: 30},
  badgeText: {...styleApp.textBold, color: colors.white, fontSize: 10},
});

const mapStateToProps = (state) => {
  return {
    numNotifications: numFilteredNotificationsSelector(state, {
      filterType: 'conversations',
    }),
  };
};

export default connect(mapStateToProps)(HeaderCallTab);
