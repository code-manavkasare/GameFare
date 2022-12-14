import React from 'react';
import {StatusBar} from 'react-native';
import {TransitionSpecs} from '@react-navigation/stack';
import {height, width, borderRadius} from '../../style/sizes';
import colors from '../../style/colors';
import styleApp from '../../style/style';

const SheetModal = ({
  heightScale,
  bottom,
  top,
  ignoreBackgroundScale,
  gestureHeight,
  statusBar,
}) => {
  return {
    gestureDirection: 'vertical',
    gestureResponseDistance: {
      horizontal: width,
      vertical: gestureHeight ? gestureHeight * height : height,
    },
    transitionSpec: {
      open: TransitionSpecs.TransitionIOSSpec,
      close: TransitionSpecs.TransitionIOSSpec,
    },
    cardStyle: {
      backgroundColor: 'transparent',
    },
    header: () => (
      <StatusBar barStyle={statusBar ?? 'light-content'} animation={'fade'} />
    ),
    cardOverlayEnabled: true,
    cardStyleInterpolator: ({current, next, layouts}) => {
      return {
        cardStyle: {
          borderRadius: next
            ? next.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  borderRadius,
                  (heightScale !== 0 && top !== 0) || next ? 25 : borderRadius,
                ],
              })
            : (heightScale !== 0 && top !== 0) || next
            ? 25
            : borderRadius,
          overflow: 'hidden',
          transform: [
            {
              translateY: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  layouts.screen.height,
                  next
                    ? 0
                    : heightScale !== undefined
                    ? layouts.screen.height * heightScale
                    : bottom !== undefined
                    ? layouts.screen.height - bottom
                    : top !== undefined
                    ? top
                    : 100,
                ],
              }),
            },
            {
              scale: next
                ? next.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, ignoreBackgroundScale ? 1 : 0.9],
                  })
                : 1,
            },
          ],
          opacity: next
            ? next.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, ignoreBackgroundScale ? 1 : 1],
              })
            : 1,
        },
        overlayStyle: {
          opacity: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.3],
          }),
          backgroundColor: colors.black,
          ...styleApp.fullSize,
          position: 'absolute',
        },
      };
    },
  };
};
module.exports = {
  SheetModal,
};
