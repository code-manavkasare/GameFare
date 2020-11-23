import React, {Component} from 'react';
import {Text, StyleSheet, View} from 'react-native';

import colors from '../../../style/colors';
import CardArchive from '../../coachFlow/GroupsPage/components/StreamView/footer/components/CardArchive';
import {FlatListComponent} from '../../../layout/Views/FlatList';

import ButtonColor from '../../../layout/Views/Button';
import styleApp from '../../../style/style';
import AllIcon from '../../../layout/icons/AllIcons';

export default class VideoList extends Component {
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
    if (selectedVideos.length === 0) {
      return false;
    }
    const styleCardArchive = {
      height: 70,
      width: 55,
      borderRadius: 5,
      borderWidth: 5,
      borderColor: colors.off,
      overflow: 'hidden',
      marginRight: 3,
      ...styleApp.shadow,
    };
    return (
      <View style={styles.tool}>
        <FlatListComponent
          list={selectedVideos}
          noLazy={true}
          cardList={({item}) => {
            return (
              <View style={{height: 80, width: 80, overflow: 'visible'}}>
                <CardArchive
                  style={styleCardArchive}
                  clickButtonDismiss={() => selectVideo({id: item})}
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
          inverted={false}
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
    position: 'absolute',
    height: 90,
    width: '100%',
    bottom: 95,
    right: 0,

    zIndex: 30,
    flexDirection: 'row',
  },
});
