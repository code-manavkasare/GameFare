import React, {Component} from 'react';
import {
  array,
  bool,
  func,
  element,
  number,
  object,
  shape,
  string,
} from 'prop-types';
import {Text, View, Animated, FlatList, Image} from 'react-native';
import isEqual from 'lodash.isequal';
import Reanimated from 'react-native-reanimated';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import Button from '../../layout/buttons/Button';
import Loader from '../../layout/loaders/Loader';
import AllIcon from '../icons/AllIcons';

const ReanimatedFlatList = Reanimated.createAnimatedComponent(FlatList);
class FlatListComponent extends Component {
  static propTypes = {
    AnimatedHeaderValue: object,
    cardList: func.isRequired,
    header: element,
    headerStyle: object,
    footer: element,
    footerStyle: object,
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
    keyExtractor: func,
    reanimated: bool,
    scrollEnabled: bool,
    onRef: func,
  };
  static defaultProps = {
    incrementRendering: 12,
    initialNumberToRender: 15,
  };
  constructor(props) {
    super(props);
    this.state = {
      numberToRender: props.fetchData ? 0 : props.initialNumberToRender,
      list: props.list,
      dataFetched: props.fetchData ? false : true,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    const {onRef, fetchData} = this.props;
    if (onRef) onRef(this);
    if (fetchData) this.onEndReached();
  }
  static getDerivedStateFromProps(props, state) {
    const {noLazy, list} = props;
    let {numberToRender} = state;
    return {list: noLazy ? list : list.slice(0, numberToRender)};
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
    const {incrementRendering, fetchData, lengthList} = this.props;
    const {numberToRender} = this.state;

    const nextNumberRender = !lengthList
      ? numberToRender + incrementRendering
      : numberToRender + incrementRendering > lengthList
      ? lengthList
      : numberToRender + incrementRendering;
    if (fetchData) await fetchData({numberToRender, nextNumberRender});
    this.setState({numberToRender: nextNumberRender, dataFetched: true});
  };

  jumpToTop() {
    this.flatListRef?.getNode().scrollToOffset({animated: false, offset: 0});
  }

  render() {
    const {numberToRender, list, dataFetched} = this.state;
    let {
      AnimatedHeaderValue,
      cardList,
      header,
      headerStyle,
      footer,
      footerStyle,
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
      keyExtractor,
      lengthList,
      reanimated,
      scrollEnabled,
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
        <View
          style={[styleApp.center, {height: 35, width: '100%', marginTop: 20}]}>
          <Loader size={40} color={colors.grey} />
        </View>
      );
    };

    const scrollEvent =
      onScroll ?? reanimated
        ? Reanimated.event([
            {
              nativeEvent: {
                contentOffset: {y: AnimatedHeaderValue},
              },
            },
          ])
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
          );

    const sharedProps = {
      ref: (ref) => {
        this.flatListRef = ref;
      },
      data: list,
      renderItem: ({item, index}) => cardList({item, index}),
      ListFooterComponent: footer
        ? footer
        : () =>
            lengthList > numberToRender && lengthList !== 0
              ? viewLoader()
              : null,
      ListFooterComponentStyle: footerStyle,
      scrollIndicatorInsets: {right: 1},
      onScroll: scrollEvent,
      keyboardShouldPersistTaps: 'always',
      keyboardDismissMode: 'interactive',
      keyExtractor: keyExtractor
        ? keyExtractor
        : (item) => (item.id ? item.id : item.toString()),
      numColumns,
      scrollEnabled: scrollEnabled ?? true,
      horizontal,
      inverted,
      refreshControl,
      onScrollEndDrag,
      onScrollBeginDrag,
      contentContainerStyle: containerStyle,
      ListHeaderComponent: header,
      ListHeaderComponentStyle: headerStyle,
      showsHorizontalScrollIndicator:
        showsHorizontalScrollIndicator === undefined
          ? true
          : showsHorizontalScrollIndicator,
      showsVerticalScrollIndicator:
        showsVerticalScrollIndicator === undefined
          ? true
          : showsVerticalScrollIndicator,
      onEndReached: () => this.onEndReached(),
      onEndReachedThreshold: 0.1,
      ListEmptyComponent: () =>
        dataFetched && (
          <View
            style={[
              styleApp.marginView,
              styleApp.center,
              {height: 250, marginTop: 20},
            ]}>
            {ListEmptyComponent?.icon ? (
              <View style={{marginBottom: 25}}>
                <AllIcon
                  type="font"
                  size={35}
                  color={colors.greyDark}
                  name={ListEmptyComponent.icon}
                  solid
                />
              </View>
            ) : ListEmptyComponent?.image ? (
              <Image
                source={ListEmptyComponent?.image}
                style={{height: 50, width: 50, marginBottom: 20}}
              />
            ) : null}
            <Text
              style={{
                ...styleApp.textBold,
                color: colors.greyDark,
                textAlign: 'center',
              }}>
              {ListEmptyComponent?.text}
            </Text>
            {ListEmptyComponent?.clickButton ? (
              <Button
                backgroundColor="primary"
                onPressColor={colors.primaryLight}
                enabled={true}
                text={ListEmptyComponent?.textButton}
                textButton={{fontSize: 16}}
                icon={{
                  name: ListEmptyComponent?.iconButton,
                  size: 17,
                  type: 'font',
                  color: colors.white,
                  solid: true,
                }}
                styleButton={{height: 45, marginTop: 30}}
                loader={false}
                click={() => ListEmptyComponent?.clickButton()}
              />
            ) : null}
            {ListEmptyComponent?.clickButton2 ? (
              <Button
                backgroundColor="green"
                onPressColor={colors.greenLight}
                enabled={true}
                text={ListEmptyComponent?.textButton2}
                textButton={{fontSize: 16}}
                icon={{
                  name: ListEmptyComponent?.iconButton2,
                  size: 17,
                  type: 'font',
                  color: colors.white,
                  solid: true,
                }}
                styleButton={{height: 45, marginTop: 30}}
                loader={false}
                click={() => ListEmptyComponent?.clickButton2()}
              />
            ) : null}
          </View>
        ),
    };
    return reanimated ? (
      <ReanimatedFlatList {...sharedProps} />
    ) : (
      <FlatList {...sharedProps} />
    );
  }
}

export {FlatListComponent};
