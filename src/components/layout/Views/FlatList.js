import React, {Component} from 'react';
import {
  array,
  bool,
  elementType,
  func,
  element,
  number,
  object,
  shape,
  string,
} from 'prop-types';
import {Text, View, Animated, FlatList, Image} from 'react-native';
import isEqual from 'lodash.isequal';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import Button from '../../layout/buttons/Button';
import Loader from '../../layout/loaders/Loader';

class FlatListComponent extends Component {
  static propTypes = {
    AnimatedHeaderValue: object,
    cardList: func.isRequired,
    header: element,
    incrementRendering: number,
    initialNumberToRender: number,
    inverted: bool,
    ListEmptyComponent: shape({
      clickButton: func,
      clickButton2: func,
      iconButton: string,
      iconButton2: string,
      image: number, // require(pathToimage), example in videoLibraryPage
      text: string,
      textButton: string,
      textButton2: string,
    }),
    list: array.isRequired,
    noLazy: bool,
    numColumns: number,
    paddingBottom: number,
    refreshControl: bool,
    showsVerticalScrollIndicator: bool,
    showsHorizontalScrollIndicator: bool,
    styleContainer: object,
  };
  static defaultProps = {
    incrementRendering: 12,
    initialNumberToRender: 15,
  };
  constructor(props) {
    super(props);
    this.state = {
      numberToRender: props.initialNumberToRender,
      list:props.list
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    const {onRef} = this.props;
    if (onRef) {
      onRef(this);
    }
  }
  static getDerivedStateFromProps(props,state) {
    const {noLazy,list} = props;
    let {numberToRender} = state;
    return {list: noLazy ? list : list.slice(0, numberToRender)}
  } 
  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(nextState, this.state)) {
      return true;
    }
    if (isEqual(this.props, nextProps)) {
      return false;
    }
    return true;
  }

   onEndReached = async () => {
    const {list, incrementRendering,fetchData} = this.props;
    const {numberToRender} = this.state;
    const lengthList = list.length;
    const nextNumberRender = numberToRender + incrementRendering > lengthList
    ? lengthList
    : numberToRender + incrementRendering
    if (fetchData) await fetchData({numberToRender,nextNumberRender})
    this.setState({numberToRender:nextNumberRender});
  }
  render() {
    const {numberToRender,list} = this.state;
    let {
      AnimatedHeaderValue,
      cardList,
      header,
      headerStyle,
      horizontal,
      inverted, 
      ListEmptyComponent,
      noLazy,
      numColumns,
      onScroll,
      onScrollBeginDrag,
      onScrollEndDrag,
      paddingBottom,
      refreshControl,
      showsHorizontalScrollIndicator,
      showsVerticalScrollIndicator,
      styleContainer,
    } = this.props;

    const containerStyle = {
      paddingBottom: paddingBottom ? paddingBottom : 60,
      backgroundColor: colors.white,

      width: horizontal ? list.length * 100 : '100%',
      ...styleContainer,
    };

    const viewLoader = () => {
      if (noLazy) return null;
      return (
        <View style={[styleApp.center, {height: 35, marginTop: 20}]}>
          <Loader size={40} color={colors.grey} />
        </View>
      );
    }; 
    return (
      <FlatList
        data={list}
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
        horizontal={horizontal}
        inverted={inverted}
        refreshControl={refreshControl}
        onScrollEndDrag={onScrollEndDrag}
        onScrollBeginDrag={onScrollBeginDrag}
        contentContainerStyle={containerStyle}
        ListHeaderComponent={header}
        ListHeaderComponentStyle={{
          ...styleApp.marginView,
          ...headerStyle,
        }}
        showsHorizontalScrollIndicator={
          showsHorizontalScrollIndicator === undefined
            ? true
            : showsHorizontalScrollIndicator
        }
        showsVerticalScrollIndicator={
          showsVerticalScrollIndicator === undefined
            ? true
            : showsVerticalScrollIndicator
        }
        onEndReached={() => this.onEndReached()}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={() => (
          <View
            style={[
              styleApp.marginView,
              styleApp.center,
              {height: 250, marginTop: 20},
            ]}>
            <Image
              source={ListEmptyComponent?.image}
              style={{height: 50, width: 50, marginBottom: 20}}
            />
            <Text style={styleApp.textBold}>{ListEmptyComponent?.text}</Text>
            {ListEmptyComponent?.clickButton && (
              <Button
                backgroundColor="primary"
                onPressColor={colors.primaryLight}
                enabled={true}
                text={ListEmptyComponent?.textButton}
                icon={{
                  name: ListEmptyComponent?.iconButton,
                  size: 24,
                  type: 'font',
                  color: colors.white,
                }}
                styleButton={{height: 55, marginTop: 30}}
                loader={false}
                click={() => ListEmptyComponent?.clickButton()}
              />
            )}
            {ListEmptyComponent?.clickButton2 && (
              <Button
                backgroundColor="green"
                onPressColor={colors.greenLight}
                enabled={true}
                text={ListEmptyComponent?.textButton2}
                icon={{
                  name: ListEmptyComponent?.iconButton2,
                  size: 24,
                  type: 'font',
                  color: colors.white,
                }}
                styleButton={{height: 55, marginTop: 30}}
                loader={false}
                click={() => ListEmptyComponent?.clickButton2()}
              />
            )}
          </View>
        )}
        onScroll={
          onScroll
            ? onScroll
            : Animated.event(
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
              )
        }
      />
    );
  }
}

export {FlatListComponent};
