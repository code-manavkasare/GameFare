import React, {Component} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

import {connect} from 'react-redux';

import CardArchive from './CardArchive';
import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';
import {FlatList} from 'react-native-gesture-handler';

class PastSessions extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  arraySessions() {
    let {archivedStreams} = this.props;
    if (!archivedStreams) archivedStreams = {};
    return Object.values(archivedStreams)
      .sort((a, b) => a.startTimestamp - b.startTimestamp)
      .reverse();
  }

  noArchiveMessage = () => {
    return (
      <View style={[{flex: 1}, styleApp.center]}>
        <Image
          source={require('../../../../../../../../img/images/shelve.png')}
          style={styles.iconNoArchive}
        />
        <Text style={[styleApp.text, styles.textNoArchive]}>
          {"You haven't recorded any session yet."}
        </Text>
      </View>
    );
  };

  renderCardArchiveSessions = (archive) => {
    const {openVideo} = this.props;
    return (
      <CardArchive
        style={styles.cardArchive}
        archive={archive.item}
        key={archive.item.id}
        openVideo={({url, thumbnail}) => {
          openVideo({
            watchVideo: true,
            thumbnail: thumbnail,
            source: url,
            myVideo: true,
            archiveID: archive.item.id,
          });
        }}
      />
    );
  };

  render() {
    const sessions = this.arraySessions();
    return sessions.length === 0 ? (
      this.noArchiveMessage()
    ) : (
      <FlatList
        data={sessions}
        renderItem={this.renderCardArchiveSessions}
        keyExtractor={(item) => item.id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingLeft: 20}}
        initialNumToRender={2}
        ListEmptyComponent={this.noArchiveMessage}
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
  cardArchive: {
    height: 130,
    width: 250,
    marginRight: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.title,
  },
  textNoArchive: {
    color: colors.white,
    marginTop: 5,
    fontSize: 14,
  },
  iconNoArchive: {
    width: 55,
    height: 55,
    marginBottom: 15,
  },
});

const mapStateToProps = (state) => {
  return {
    archivedStreams: state.user.infoUser.archivedStreams,
  };
};

export default connect(
  mapStateToProps,
  {},
)(PastSessions);
