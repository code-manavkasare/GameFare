import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import {connect} from 'react-redux';
const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';
import isEqual from 'lodash.isequal';

import ButtonColor from '../../../layout/Views/Button';
import AllIcons from '../../../layout/icons/AllIcons';

import sizes from '../../../style/sizes';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {native} from '../../../animations/animations';

class FooterContact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      val: 0,
      nextVal: 0,
      showNextVal: false,
    };
    this.translateYCurrent = new Animated.Value(0);
    this.translateYNext = new Animated.Value(30);
  }

  componentDidMount() {}
  async componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.contactsSelected, this.props.contactsSelected)) {
      await this.setState({
        nextVal: Object.values(nextProps.contactsSelected).length,
        showNextVal: true,
      });
      if (Object.values(nextProps.contactsSelected).length < this.state.val) {
        await this.translateYNext.setValue(-30);
        Animated.parallel([
          Animated.timing(this.translateYCurrent, native(30, 200)),
          Animated.timing(this.translateYNext, native(0, 200)),
        ]).start(() => {
          this.setState({
            val: Object.values(nextProps.contactsSelected).length,
            showNextVal: false,
          });
          this.translateYCurrent.setValue(0);
        });
      } else {
        await this.translateYNext.setValue(30);
        Animated.parallel([
          Animated.timing(this.translateYCurrent, native(-30, 200)),
          Animated.timing(this.translateYNext, native(0, 200)),
        ]).start(() => {
          this.setState({
            val: Object.values(nextProps.contactsSelected).length,
            showNextVal: false,
          });
          this.translateYCurrent.setValue(0);
        });
      }
    }
  }
  buttonClose(contact) {
    return (
      <ButtonColor
        view={() => {
          return <AllIcons name="close" type="mat" color={'white'} size={9} />;
        }}
        click={() => this.props.deleteContact(contact)}
        color={colors.green}
        style={styles.viewDelete}
        onPressColor={colors.greenLight}
      />
    );
  }
  buttonSend() {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col style={styleApp.center} size={40}>
                <View style={styles.viewNumber}>
                  <Animated.Text
                    style={[
                      styleApp.text,
                      {
                        color: this.colorIconSMS(),
                        elevation: 20,
                        position: 'absolute',
                        transform: [{translateY: this.translateYCurrent}],
                      },
                    ]}>
                    {this.state.val}
                  </Animated.Text>
                  {this.state.showNextVal ? (
                    <Animated.Text
                      style={[
                        styleApp.text,
                        {
                          color: this.colorIconSMS(),
                          position: 'absolute',
                          transform: [{translateY: this.translateYNext}],
                        },
                      ]}>
                      {this.state.nextVal}
                    </Animated.Text>
                  ) : null}
                </View>
              </Col>
              <Col size={60} style={styleApp.center}>
                <AllIcons
                  name="sms"
                  type="font"
                  color={this.colorIconSMS()}
                  size={20}
                />
              </Col>
            </Row>
          );
        }}
        click={() => this.send()}
        color={this.colorButtonSMS()}
        style={styles.buttonSend}
        onPressColor={colors.greenLight}
      />
    );
  }
  contact(contact, i) {
    return (
      <View style={[styleApp.center, {height: 70, width: 50, marginTop: 2}]}>
        <View style={[styleApp.center, styles.roundViewContact]}>
          <Text style={[styleApp.text, {fontSize: 11}]}>
            {contact?.info?.firstname[0]}
            {contact.info.lastname[0] ? contact.info.lastname[0] : ''}
          </Text>
          {this.buttonClose(contact)}
        </View>
        <Text style={[styleApp.text, {fontSize: 12, marginTop: 4}]}>
          {contact.info.firstname.slice(0, 5)}
        </Text>
      </View>
    );
  }
  send() {
    if (this.state.val !== 0) {
      this.props.sendSMS();
    }
  }
  colorButtonSMS() {
    if (this.state.nextVal !== 0) {
      return colors.green;
    }
    return colors.white;
  }
  colorIconSMS() {
    if (this.state.nextVal !== 0) {
      return 'white';
    }
    return colors.off;
  }
  render() {
    return (
      <View
        style={[
          styles.footer,
          {
            height: sizes.heightFooterBooking,
          },
        ]}>
        <Row style={{height: 70}}>
          <Col
            size={70}
            style={[
              styleApp.center2,
              {
                paddingTop: 5,
              },
            ]}>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}>
              {Object.values(this.props.contactsSelected).map((contact, i) =>
                this.contact(contact, i),
              )}
            </ScrollView>
          </Col>
          <Col size={30} style={styleApp.center3}>
            {this.buttonSend()}
          </Col>
        </Row>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    backgroundColor: 'white',
    bottom: 35,
    zIndex: 200,
    width: width,
    borderTopWidth: 1,
    borderColor: colors.off,
    paddingTop: 4,
    paddingLeft: 10,
    paddingRight: 10,
  },
  roundViewContact: {
    height: 30,
    width: 30,
    backgroundColor: colors.off,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  viewNumber: {
    height: 25,
    width: 25,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  viewDelete: {
    position: 'absolute',
    top: -13,
    left: -8,
    backgroundColor: colors.green,
    height: 20,
    width: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.6,
    borderColor: colors.off,
  },
  buttonSend: {
    backgroundColor: colors.green,
    width: 80,
    height: 45,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.off,
  },
});

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, {})(FooterContact);
