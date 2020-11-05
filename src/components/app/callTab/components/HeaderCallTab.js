import React, {Component} from 'react';
import {Share} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

import {store} from '../../../../store/reduxStore';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import {createShareVideosBranchUrl} from '../../../database/branch';
import colors from '../../../style/colors';
import {getValueOnce} from '../../../database/firebase/methods';
import {shareVideosWithTeams} from '../../../functions/videoManagement';
import {timeout} from '../../../functions/coach';

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
    const {archivesToShare, archives} = this.props;
    let {branchLink} = this.state;
    if (!branchLink && archivesToShare) {
      await this.setState({loader: true});
      const infoArchives = archivesToShare.map((archive) => archives[archive]);

      const localVideos = infoArchives
        .filter((archive) => archive.local)
        .map((archive) => archive.id);
      if (localVideos.length > 0) {
        await shareVideosWithTeams(localVideos, []);
        await this.loopWaitUploadThumbnail(localVideos);
      }

      const cloudVideos = infoArchives
        .filter((archive) => !archive.local)
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
    const {modal, clickButton2} = this.props;
    const {loader} = this.state;
    return (
      <HeaderBackButton
        {...this.props}
        loader={loader}
        clickButton2={() => (modal ? this.clickShare() : clickButton2())}
        colorLoader={colors.title}
        sizeLoader={45}
      />
    );
  }
  render() {
    return this.header();
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    coach: state.coach,
    archives: state.archives,
  };
};

export default connect(
  mapStateToProps,
  {},
)(HeaderCallTab);
