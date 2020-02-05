import React from 'react';
import {Text, View} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import {connect} from 'react-redux';

import colors from '../../style/colors';
import styles from '../../style/style';
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
                style={{
                  height: '100%',
                  borderTopWidth: 1.5,
                  borderColor: focused ? colors.primary : 'transparent',
                }}>
                {routeName === 'MessageList' ? (
                  <View style={styles.roundMessage} />
                ) : null}
                <Col size={10} style={[styles.center4, {paddingTop: 10}]}>
                  <AllIcons
                    name={
                      routeName === 'Home'
                        ? 'calendar2'
                        : routeName === 'ListGroups'
                        ? 'profileFooter'
                        : routeName === 'Stream'
                        ? 'camera'
                        : routeName === 'MessageList'
                        ? 'speech'
                        : routeName === 'Profile'
                        ? 'menu'
                        : null
                    }
                    size={16}
                    color={tintColor} // color red for stream button?
                    style={styles.iconFooter}
                    type={
                      routeName === 'Stream'
                        ? 'font'
                        : 'moon'
                    }
                  />
                  <Text
                    style={[
                      styles.footerText,
                      {
                        color: tintColor,
                        marginTop: 6,
                        marginBottom: 5,
                        fontSize: 12.5,
                      },
                    ]}>
                    {routeName === 'Home'
                      ? 'Events'
                      : routeName === 'ListGroups'
                      ? 'Groups'
                      : routeName === 'Stream'
                      ? 'Go Live'
                      : routeName === 'MessageList'
                      ? 'Message'
                      : routeName === 'Profile'
                      ? 'Profile'
                      : null}
                  </Text>
                </Col>
              </Row>
            );
          }}
          click={() => navigation.navigate(routeName)}
          color={'white'}
          style={[
            {
              paddingTop: 0,
              backgroundColor: 'white',
              width: '100%',
              height: '100%',
              borderRadius: 0,
              paddingLeft: 0,
              paddingRight: 0,
            },
          ]}
          onPressColor={colors.off2}
        />
      );
  }
}

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, {})(MainTabIcon);


