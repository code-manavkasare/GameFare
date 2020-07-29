import React, {Component} from 'react';
import {Text, StyleSheet, View, Image} from 'react-native';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';

export const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  placeholderText: {
    ...styleApp.textBold,
    fontSize: 17,
    color: colors.greyLight,
    letterSpacing: 1,
    top: 1,
    left: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 7,
  },
  divider: {
    height: 1,
    backgroundColor: colors.off,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 20,
  },
  rowTools: {
    paddingRight: 20,
    paddingLeft: 20,
  },
  title: {
    ...styleApp.text,
    color: colors.black,
    fontWeight: '600',
  },
  dateText: {
    ...styleApp.text,
    fontSize: 14,
    color: colors.greyDark,
    marginTop: 3,
  },
  button: {
    height: 45,
    width: 45,
    borderRadius: 25,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 9,
  },
  buttonText: {
    ...styleApp.textBold,
    fontSize: 15,
    color: colors.white,
  },
  buttonArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
