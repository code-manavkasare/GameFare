import React, {PureComponent} from 'react';
import {bool} from 'prop-types';
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  Dimensions,
  Image,
  RefreshControl,
} from 'react-native';

import colors from '../../style/colors';
import styleApp from '../../style/style';

import PlaceHolder from '../../placeHolders/CardEventSM';
import Button from '../../layout/Views/Button';

const {width} = Dimensions.get('screen');

export default class ScrollViewX extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
    };
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    this.props.onRef(this);
  }
  styleScrollView() {
    return {
      marginTop: this.props.marginTop,
    };
  }
  styleInsideView() {
    if (this.props.fullWidth) return {paddingTop: 0};
    return {marginLeft: 20, width: width - 40, paddingTop: 20};
  }
  async refresh() {
    this.setState({refreshing: true});
    await this.props.refresh();
    this.setState({refreshing: false});
  }
  refreshControl() {
    if (this.props.refreshControl) {
      return (
        <RefreshControl
          refreshing={this.state.refreshing}
          onRefresh={() => this.refresh()}
        />
      );
    }
    return null;
  }

  scrollTo = (widthToEvent) => {
    this.ScrollView.scrollTo({x: widthToEvent, y: 0, animated: true});
  };
  render() {
    console.log('scrollview x ', this.props.events);
    const {
      undisplayEmptyList,
      width: widthProps,
      styleButtonEmpty,
    } = this.props;
    return (
      <ScrollView
        scrollEventThrottle={500}
        onScroll={(e) =>
          this.props.onScrollViewX && this.props.onScrollViewX(e)
        }
        onScrollEndDrag={() =>
          this.props.onScrollEndScrollViewX &&
          this.props.onScrollEndScrollViewX()
        }
        pagingEnabled={this.props.pagingEnabled}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        ref={(ref) => {
          this.ScrollView = ref;
        }}
        style={{
          marginLeft: 0,
          flex: 1,
          width: widthProps ? widthProps : width,
          paddingLeft: 20,
          paddingRight: 20,
          backgroundColor: this.props.backgroundTransparent
            ? 'transparent'
            : 'white',
          paddingTop: 0,
        }}>
        {this.props.loader ? (
          [0, 1, 2, 3].map((event, i) => (
            <View
              key={i}
              style={[
                this.props.placeHolder
                  ? this.props.placeHolder
                  : styleApp.cardEventSM,
                {backgroundColor: 'white'},
              ]}>
              <PlaceHolder />
            </View>
          ))
        ) : Object.values(this.props.events).length === 0 &&
          !undisplayEmptyList ? (
          <Button
            view={() => {
              return (
                <View style={styleApp.center}>
                  {this.props.imageNoEvent === 'location' ? (
                    <Image
                      source={require('../../../img/images/location.png')}
                      style={{width: 60, height: 60, marginBottom: 15}}
                    />
                  ) : this.props.imageNoEvent === 'group' ? (
                    <Image
                      source={require('../../../img/images/shelve.png')}
                      style={{width: 45, height: 45, marginBottom: 15}}
                    />
                  ) : null}
                  <Text
                    style={[
                      styleApp.text,
                      {marginTop: 5, fontSize: 12},
                      styleButtonEmpty && styleButtonEmpty.text,
                    ]}>
                    {this.props.messageNoEvent}
                  </Text>
                </View>
              );
            }}
            click={() => true}
            // color="white"
            style={[
              styleApp.center,
              styles.button,
              styleButtonEmpty && styleButtonEmpty.button,
            ]}
            onPressColor={colors.off}
          />
        ) : (
          this.props.content(this.props.events)
        )}
        <View style={{width: 30}} />
      </ScrollView>
    );
  }
}

ScrollViewX.propTypes = {
  backgroundTransparent: bool,
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.off2,
    borderWidth: 0,
    borderColor: colors.borderColor,
    width: width - 40,
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 7,
  },
});
