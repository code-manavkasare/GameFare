import * as React from 'react';
import {CommonActions, StackActions} from '@react-navigation/native';

import {loadAndOpenSession} from './src/components/functions/coach';
import {sentryAddBreadcrumb} from './src/components/functions/logs.js';

const navigationRef = React.createRef();

const navigate = (routeName, params) => {
  sentryAddBreadcrumb('currentRoute', routeName);
  if (params?.notUniqueStack)
    return navigationRef.current?.navigate(routeName, {
      screen: params.screen,
      params: params,
    });
  return navigationRef.current?.navigate(routeName, params);
};

const push = (routeName, params) => {
  if (params?.uniqueStack)
    return navigationRef.current?.dispatch(
      StackActions.push(routeName, params),
    );
  return navigationRef.current?.dispatch(
    StackActions.push(routeName, {screen: routeName, params: params}),
  );
};

const pop = (number) => {
  navigationRef().dispatch(
    StackActions.pop({
      n: number,
    }),
  );
};

const goBack = () => {
  navigationRef.current?.dispatch(CommonActions.goBack());
};

const getCurrentRoute = () => {
  let currentRoute = navigationRef.current.getCurrentRoute().name;
  if (
    currentRoute === 'Chat' ||
    currentRoute === 'Content' ||
    currentRoute === 'Players'
  )
    currentRoute = 'Conversation';
  return currentRoute;
};

const dismiss = () => {
  navigationRef.dangerouslyGetParent().pop();
};

const popToTop = () => {
  navigationRef.current.popToTop();
};

const setParams = ({routeKey, params}) => {
  if (navigationRef.current) return navigationRef.current.setParams(params);

  navigationRef.dispatch({
    ...CommonActions.setParams(params),
    source: routeKey,
  });
};

const clickNotification = async (notification) => {
  var {action, typeNavigation} = notification;
  if (!notification.action) var {action, typeNavigation} = notification.data;
  if (typeNavigation === 'navigate') {
    if (action === 'Session')
      return loadAndOpenSession(notification.data.coachSessionID);
    if (notification.data.screen) {
      return navigate(action, {
        ...notification.data,
        date: Date.now(),
        params: {...notification.data},
      });
    }
    return navigate(action, {...notification.data, date: Date.now()});
  }
  return push(action, {
    ...notification.data,
    id: notification?.data?.coachSessionID,
    date: Date.now(),
  });
};

// add other navigation functions that you need and export them

export {
  navigate,
  push,
  pop,
  dismiss,
  goBack,
  navigationRef,
  setParams,
  clickNotification,
  getCurrentRoute,
  popToTop,
};
