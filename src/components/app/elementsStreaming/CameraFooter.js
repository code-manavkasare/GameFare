import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {Row, Col} from 'react-native-easy-grid';
import PropTypes from 'prop-types';

import colors from '../../style/colors';
import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';
import styleApp from '../../style/style';

export default class CameraFooter extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const {takePhoto, switchCamera, cameraButtonColor} = this.props;
    return (
      <Row style={styles.toolbar}>
        <Col size={33} />
        <Col style={styleApp.center} size={34}>
          {takePhoto ? (
            <ButtonColor
              view={() => {
                return <View />;
              }}
              click={() => takePhoto()}
              color={cameraButtonColor ? cameraButtonColor : 'white'}
              style={styles.button}
              onPressColor={colors.off}
            />
          ) : null}
        </Col>
        <Col size={33} style={styleApp.center}>
          {switchCamera ? (
            <ButtonColor
              view={() => {
                return (
                  <AllIcons
                    name={'random'}
                    color={colors.greyDark}
                    size={16}
                    type="font"
                  />
                );
              }}
              click={() => switchCamera()}
              color={'white'}
              style={styles.button}
              onPressColor={colors.off}
            />
          ) : null}
        </Col>
      </Row>
    );
  }
}

const styles = StyleSheet.create({
  toolbar: {
    flex: 1,
    width: '100%',
    height: '10%',
    position: 'absolute',
    bottom: 0,
    paddingTop: 5,
  },
  button: {
    ...styleApp.center2,
    width: 48,
    height: 48,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'white',
  },
});

CameraFooter.propTypes = {
    takePhoto: PropTypes.function,
    switchCamera: PropTypes.function,
    cameraButtonColor: PropTypes.string,
  };
