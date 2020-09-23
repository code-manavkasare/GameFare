import React, {Component} from 'react';
import {Text, StyleSheet, View, Animated, ScrollView} from 'react-native';
import moment from 'moment';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {connect} from 'react-redux';
import isEqual from 'lodash.isequal';

import colors from '../../../style/colors';
import {marginBottomApp, heightFooter} from '../../../style/sizes';
import CardArchive from '../../coachFlow/GroupsPage/components/StreamView/footer/components/CardArchive';
import {FlatListComponent} from '../../../layout/Views/FlatList';

import ButtonColor from '../../../layout/Views/Button';
import Loader from '../../../layout/loaders/Loader';
import styleApp from '../../../style/style';
import AllIcon from '../../../layout/icons/AllIcons';
import {native} from '../../../animations/animations';

class VideoList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  button = ({
    icon,
    backgroundColor,
    onPressColor,
    style,
    click,
    label,
    isSelected,
    badge,
    buttonDisabled,
  }) => {
    const {name, size, type, color} = icon;
    return (
      <ButtonColor
        view={() => {
          return (
            <View style={styleApp.center}>
              <AllIcon
                name={name}
                size={size}
                color={isSelected ? color : colors.greyDark}
                type={type}
              />
            </View>
          );
        }}
        style={style}
        click={() => !buttonDisabled && click()}
        color={backgroundColor}
        onPressColor={onPressColor}
      />
    );
  };

  render() {
    const {selectedVideos, selectVideo} = this.props;
    if (selectedVideos.length === 0) return false;
    console.log('selectedVideos', selectedVideos);
    return (
      <View style={styles.tool}>
        <FlatListComponent
          list={selectedVideos}
          noLazy={true}
          cardList={({item}) => {
            console.log('item', item);
            return (
              <View style={{height: 80, width: 80}}>
                <CardArchive
                  style={{
                    height: 70,
                    width: 70,

                    borderRadius: 35,
                    borderWidth: 2,
                    borderColor: colors.off,
                    overflow: 'hidden',
                    marginRight: 3,
                    // backgroundColor: 'red',
                    // ...styleApp.shade,
                  }}
                  clickButtonDismiss={() => selectVideo(item)}
                  hideInformation={true}
                  unclickable={false}
                  id={item}
                  key={item}
                  noUpdateStatusBar={true}
                />
              </View>
            );
          }}
          styleContainer={{
            paddingTop: 15,
            backgroundColor: 'transparent',
            paddingLeft: 10,
          }}
          numColumns={1}
          horizontal={true}
          incrementRendering={30}
          inverted={true}
          initialNumberToRender={30}
          hideDividerHeader={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          paddingBottom={0}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tool: {
    // ...styleApp.center3,
    position: 'absolute',
    height: 90,
    width: '100%',
    // ...styleApp.shade,
    // backgroundColor: 'red',
    bottom: 90,
    right: 0,

    zIndex: 30,
    flexDirection: 'row',
    // alignItems: 'flex-end',
    // marginRight: 10,
  },
});

const mapStateToProps = (state, props) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(
  mapStateToProps,
  {},
)(VideoList);
