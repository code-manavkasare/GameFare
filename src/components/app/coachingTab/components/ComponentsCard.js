import React, {Component} from 'react';
import {Text, StyleSheet, View, Image} from 'react-native';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import AllIcons from '../../../layout/icons/AllIcons';

import {Col, Row, Grid} from 'react-native-easy-grid';

const IconBadge = (props) => {
  const {size, name, type} = props;
  return (
    <View style={[styleApp.center, {width: size, height: size}]}>
      <AllIcons
        name="certificate"
        type="font"
        size={24}
        color={colors.primary}
      />
      <View
        style={[
          {position: 'absolute', zIndex: 1},
          styleApp.fullSize,
          styleApp.center,
        ]}>
        {name ? (
          <AllIcons name={name} type={type} size={6} color={colors.white} />
        ) : (
          <Image
            source={require('../../../../img/logos/logoXS.png')}
            style={{height: 10, width: 10}}
          />
        )}
      </View>
    </View>
  );
};

const BadgesView = (props) => {
  const {badges} = props;
  if (!badges) return null;
  return (
    <Row style={{height: 40}}>
      <Col size={15} style={styleApp.center2}>
        {IconBadge({size: 26, name: 'check', type: 'font'})}
      </Col>
      <Col size={85} style={styleApp.center2}>
        <Text style={[styleApp.text, {fontSize: 15}]}>
          {badges &&
            badges.map((badge, key) => {
              if (badges.length != 1 && badges.length != Number(key) + 1)
                return badge + ', ';
              return badge;
            })}
        </Text>
      </Col>
    </Row>
  );
};

const FocusView = (props) => {
  const {list, icon} = props;
  const {color, size, name, type} = icon;
  if (!list) return null;
  return (
    <Row style={{paddingTop: 10, paddingBottom: 10}}>
      <Col size={15} style={styleApp.center2}>
        <AllIcons name={name} type={type} color={color} size={size} />
      </Col>
      <Col size={85} style={styleApp.center2}>
        <Text style={[styleApp.text, {fontSize: 15}]}>
          {list &&
            list.map((item, key) => {
              if (list.length != 1 && list.length != Number(key) + 1)
                return item + ', ';
              return item;
            })}
        </Text>
      </Col>
    </Row>
  );
};

const PriceView = (props) => {
  const {hourlyRate} = props;
  const style = {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.off2,
    height: 30,
    width: 70,
    borderRadius: 20,
    borderColor: colors.off,
    borderWidth: 0,
  };
  return (
    <View style={style}>
      <Row>
        <Col size={85} style={styleApp.center}>
          <Text style={[styleApp.textBold, {fontSize: 12}]}>
            ${hourlyRate}/h
          </Text>
        </Col>
      </Row>
    </View>
  );
};

module.exports = {
  IconBadge,
  BadgesView,
  PriceView,
  FocusView,
};
