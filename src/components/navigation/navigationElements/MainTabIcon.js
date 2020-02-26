import React from 'react';
import {Text, View, styleAppheet, StyleSheet} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import {connect} from 'react-redux';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import AllIcons from '../../layout/icons/AllIcons';
import Button from '../../layout/Views/Button';

class MainTabIcon extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {navigation, focused, tintColor, routeName} = this.props;
    return (
      <Button
        view={() => {
          return (
            <Row
              style={[
                styles.rowInButton,
                {borderColor: focused ? colors.primary : 'transparent'},
              ]}>
              {routeName === 'MessageList' ? (
                <View style={styleApp.roundMessage} />
              ) : null}
              <Col size={10} style={[styleApp.center4, {paddingTop: 10}]}>
                <AllIcons
                  name={
                    routeName === 'Home'
                      ? 'calendar2'
                      : routeName === 'ListGroups'
                      ? 'profileFooter'
                      : routeName === 'Stream'
                      ? 'video-camera'
                      : routeName === 'MessageList'
                      ? 'speech'
                      : routeName === 'More'
                      ? 'menu'
                      : null
                  }
                  size={16}
                  color={tintColor} // color red for stream button?
                  style={styleApp.iconFooter}
                  type={'moon'}
                />
                <Text style={[styles.textButton, {color: tintColor}]}>
                  {routeName === 'Home'
                    ? 'Events'
                    : routeName === 'ListGroups'
                    ? 'Groups'
                    : routeName === 'Stream'
                    ? 'Go Live'
                    : routeName === 'MessageList'
                    ? 'Message'
                    : routeName === 'More'
                    ? 'More'
                    : null}
                </Text>
              </Col>
            </Row>
          );
        }}
        click={() => navigation.navigate(routeName)}
        color={'white'}
        style={styles.button}
        onPressColor={colors.off2}
      />
    );
  }
}

const styles = StyleSheet.create({
  button: {
    paddingTop: 0,
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
    borderRadius: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  textButton: {
    ...styleApp.footerText,
    marginTop: 6,
    marginBottom: 5,
    fontSize: 12.5,
  },
  rowInButton: {
    height: '100%',
    borderTopWidth: 1.5,
  },
});

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, {})(MainTabIcon);
