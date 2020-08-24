import React, {Component} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

import {connect} from 'react-redux';

import CardArchive from './CardArchive';
import styleApp from '../../../../../../../style/style';
import colors from '../../../../../../../style/colors';
import {rowTitle} from '../../../../../../TeamPage/components/elements';

import {FlatListComponent} from '../../../../../../../layout/Views/FlatList';

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

  render() {
    const sessions = this.arraySessions();
    const {coachSessionID, videoBeingShared} = this.props;

    return (
      <FlatListComponent
        list={sessions}
        styleContainer={{
          backgroundColor: 'transparent',
        }}
        showsVerticalScrollIndicator={false}
        cardList={({item}) => (
          <CardArchive
            id={item.id}
            style={{...styleApp.cardArchive3, height: 100}}
            key={item.id}
            connectToSession={coachSessionID}
            hidePlayIcon={true}
          />
        )}
        header={
          videoBeingShared &&
          rowTitle({
            icon: {
              name: 'satellite-dish',
              type: 'font',
              color: colors.white,
              size: 20,
            },
            hideDividerHeader: true,
            customButtom: (
              <CardArchive
                id={videoBeingShared.id}
                style={{
                  ...styleApp.cardArchive3,
                  height: 70,
                  width: 120,
                  borderRadius: 5,
                  borderWidth: 0,
                }}
                connectToSession={coachSessionID}
                hidePlayIcon={true}
              />
            ),
            title: 'Live now',
            titleColor: colors.white,
          })
        }
        numColumns={3}
        horizontal={false}
        incrementRendering={6}
        initialNumberToRender={12}
        hideDividerHeader={true}
      />
    );
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  return {
    archivedStreams: state.user.infoUser.archivedStreams,
  };
};

export default connect(
  mapStateToProps,
  {},
)(PastSessions);
