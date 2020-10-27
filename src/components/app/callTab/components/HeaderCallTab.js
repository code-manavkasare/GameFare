import React, {Component} from 'react';
import {Share, Image} from 'react-native';
import {connect} from 'react-redux';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import {createShareVideosBranchUrl} from '../../../database/branch';
import colors from '../../../style/colors';

import {getOnceValue} from '../../../database/firebase/methods';
import {getImageSize} from '../../../functions/pictures';
import database from '@react-native-firebase/database';

class HeaderCallTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      branchLink: null,
    };
  }
  clickShare = async () => {
    const {archivesToShare} = this.props;
    let {branchLink} = this.state;
    if (!branchLink) {
      await this.setState({loader: true});
      branchLink = await createShareVideosBranchUrl(archivesToShare);
      await this.setState({loader: false, branchLink});
    }
    Share.share({url: branchLink});
  };

  loopUploadingStatus = async () => {
    await this.setState({loader: true});
    const archivedStreams = await getOnceValue(`archivedStreams`);
    let updates = {};
    for (var i in archivedStreams) {
      let {local, id, thumbnail} = archivedStreams[i];
      if (!local) updates[`archivedStreams/${id}/progress`] = null;
      // if (thumbnail) {
      //   const {width, height} = await getImageSize(thumbnail);
      //   console.log('[width, height]', {width, height});
      //   if (width && height)
      //     updates[`archivedStreams/${id}/thumbnailSize`] = {
      //       height,
      //       width,
      //     };
      //   else {
      //     updates[`archivedStreams/${id}/thumbnail`] =
      //       'https://firebasestorage.googleapis.com/v0/b/getplayd.appspot.com/o/logos%2FSlice%2053.png?alt=media&token=df86469a-3aa3-4a79-998d-4cabefa740bf';
      //   }
      // }
    }
    console.log('updates', updates);
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
        clickButton2={() => (modal ? this.bim() : clickShare())}
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
  };
};

export default connect(
  mapStateToProps,
  {},
)(HeaderCallTab);
