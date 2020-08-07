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
      numberToRender: this.props.incrementRendering,
    };
    this.fetchEnabled = true;
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  shouldComponentUpdate(prevProps, prevState) {
    if (!isEqual(prevState, this.state)) return true;
    if (isEqual(this.props, prevProps)) return false;
    return true;
  }
  async onEndReached() {
    const {list, incrementRendering} = this.props;
    const {numberToRender} = this.state;
    const lengthList = list.length;
    const currentFetchEnabled = this.fetchEnabled;
    this.fetchEnabled = false;
    console.log('onEndReached', this.fetchEnabled);
    if (currentFetchEnabled)
      this.setState({
        numberToRender:
          numberToRender + incrementRendering > lengthList
            ? lengthList
            : numberToRender + incrementRendering,
      });
    await timeout(200);
    this.fetchEnabled = true;
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
    } = this.props;
    let styleContainerList = {
      width: '100%',

      paddingTop: 35,
      backgroundColor: colors.white,
      paddingBottom: 60,
      minHeight: height,
    };
    // if (numColumns !== 1)
    styleContainerList = {
      ...styleContainerList,
      //   ...styleApp.marginView,
    };

    const containerStyle = {
      paddingBottom: paddingBottom ? paddingBottom : 0,
      backgroundColor: 'white',
    };

    const viewLoader = () => {
      return (
        <View style={[styleApp.center, {height: 35, marginTop: 20}]}>
          <Loader size={40} color={colors.grey} />
        </View>
      );
    };

    return (
      <View style={containerStyle}>
        <FlatList
          data={list.slice(0, numberToRender)}
          renderItem={({item}) => cardList({item})}
          ListFooterComponent={() =>
            list.length !== numberToRender && list.length !== 0 && viewLoader()
          }
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="interactive"
          keyExtractor={(item) => (item.id ? item.id : item)}
          numColumns={numColumns}
          scrollEnabled={true}
          inverted={inverted}
          contentContainerStyle={styleContainerList}
          ListHeaderComponent={header}
          ListHeaderComponentStyle={styleApp.marginView}
          
          showsVerticalScrollIndicator={true}
          onEndReached={() => this.onEndReached()}
          onEndReachedThreshold={0.7}
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
      </View>
    );
  }
}

export {FlatListComponent};
