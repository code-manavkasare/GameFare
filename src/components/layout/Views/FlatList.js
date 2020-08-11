import React, {Component} from 'react';
import {Text, StyleSheet, View, Animated, FlatList} from 'react-native';
import isEqual from 'lodash.isequal';
import colors from '../../style/colors';
import styleApp from '../../style/style';
import {height} from '../../style/sizes';
import {timeout} from '../../functions/coach';

import Loader from '../../layout/loaders/Loader';

import {store} from '../../../../reduxStore';

class FlatListComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numberToRender: props.initialNumberToRender,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  shouldComponentUpdate(prevProps, prevState) {
    if (!isEqual(prevState, this.state)) return true;
    if (isEqual(this.props, prevProps)) return false;
    return true;
  }
  static getDerivedStateFromProps(props, state) {
    if (props.list.length > state.numberToRender)
      return {
        numberToRender: props.list.length,
      };
  }
  async onEndReached() {
    const {list, incrementRendering} = this.props;
    const {numberToRender} = this.state;
    const lengthList = list.length;

    this.setState({
      numberToRender:
        numberToRender + incrementRendering > lengthList
          ? lengthList
          : numberToRender + incrementRendering,
    });
  }
  render() {
    const {numberToRender} = this.state;
    let {
      list,
      cardList,
      numColumns,
      header,
      AnimatedHeaderValue,
      paddingBottom,
      inverted,
      styleContainer,
    } = this.props;
    let styleContainerList = {
      backgroundColor: colors.white,
      paddingBottom: 60,
      minHeight: height,
      width: '100%',
    };

    const containerStyle = {
      ...styleContainer,
      paddingBottom: paddingBottom ? paddingBottom : 60,
      backgroundColor: colors.white,
      width: '100%',
    };

    const viewLoader = () => {
      return (
        <View style={[styleApp.center, {height: 35, marginTop: 20}]}>
          <Loader size={40} color={colors.grey} />
        </View>
      );
    };
    return (
      <FlatList
        data={list.slice(0, numberToRender)}
        renderItem={({item, index}) => cardList({item, index})}
        ListFooterComponent={() =>
          list.length > numberToRender && list.length !== 0 && viewLoader()
        }
        scrollIndicatorInsets={{right: 1}}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="interactive"
        keyExtractor={(item) => (item.id ? item.id : item.toString())}
        numColumns={numColumns}
        scrollEnabled={true}
        removeClippedSubviews={true}
        inverted={inverted}
        contentContainerStyle={containerStyle}
        ListHeaderComponent={header}
        ListHeaderComponentStyle={styleApp.marginView}
        showsVerticalScrollIndicator={true}
        onEndReached={() => this.onEndReached()}
        onEndReachedThreshold={0.9}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  y: AnimatedHeaderValue
                    ? AnimatedHeaderValue
                    : this.AnimatedHeaderValue,
                },
              },
            },
          ],
          {useNativeDriver: false},
        )}
      />
    );
  }
}

export {FlatListComponent};
