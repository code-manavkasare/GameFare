import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image} from 'react-native';
import ScrollViewX from '../../../../../layout/scrollViews/ScrollViewX';

import {connect} from 'react-redux';

import CardArchive from './CardArchive';
import colors from '../../../../../style/colors';

class PastSessions extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  listSessions(sessions) {
    const {openVideo} = this.props;

    return Object.values(sessions).map((archive, i) => (
      <CardArchive
        archive={archive}
        key={i}
        openVideo={(source, thumbnail) => {
          console.log('llala open card archive', thumbnail);
          openVideo({
            watchVideo: true,
            thumbnail: thumbnail,
            source: source,
            myVideo: true,
            archiveID: archive.id,
          });
        }}
      />
    ));
  }
  arraySessions() {
    let {archivedStreams} = this.props;
    if (!archivedStreams) archivedStreams = {};
    return Object.values(archivedStreams)
      .sort((a, b) => a.startTimestamp - b.startTimestamp)
      .reverse();
  }
  render() {
    const sessions = this.arraySessions();
    return (
      <ScrollViewX
        loader={this.state.loader}
        backgroundTransparent={true}
        events={sessions}
        width="100%"
        undisplayEmptyList={false}
        placeHolder={styles.placeHolderScrollViewX}
        imageNoEvent="group"
        messageNoEvent={"You haven't record any session yet"}
        content={() => this.listSessions(sessions)}
        onRef={(ref) => (this.scrollViewRef1 = ref)}
      />
    );
  }
}

const styles = StyleSheet.create({
  placeHolderScrollViewX: {
    paddingLeft: 10,
    paddingRight: 10,
    height: 100,
    backgroundColor: 'red',
    paddingTop: 10,
    marginRight: 20,
  },
});

const mapStateToProps = (state) => {
  return {
    archivedStreams: state.user.infoUser.archivedStreams,
  };
};

export default connect(mapStateToProps, {})(PastSessions);
