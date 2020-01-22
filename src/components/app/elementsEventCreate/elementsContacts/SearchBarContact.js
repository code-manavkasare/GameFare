import React, {Component} from 'react';
import {Col, Row} from 'react-native-easy-grid';
import {TextInput, Dimensions} from 'react-native';
import FontIcon from 'react-native-vector-icons/FontAwesome5';
import PropTypes from 'prop-types';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import AllIcons from '../../../layout/icons/AllIcons';
import ButtonColor from '../../../layout/Views/Button';
import styles from '../../../style/style';

const {height, width} = Dimensions.get('screen');

export default class SearchBarContact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchString: this.props.searchString,
    };
  }

  onSearchChange = (text) => {
    this.setState({searchString: text});
    this.props.updateSearch(text);
  };

  render() {
    const {placeHolderMessage, showAddContact, addNewContact} = this.props;
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={15} style={styles.center}>
                <AllIcons
                  name="search"
                  s
                  type="font"
                  color={colors.grey}
                  size={16}
                />
              </Col>
              <Col size={55} style={[styles.center2, {paddingLeft: 15}]}>
                <TextInput
                  style={styleApp.input}
                  placeholder={placeHolderMessage}
                  returnKeyType={'done'}
                  blurOnSubmit={true}
                  ref={(input) => {
                    this.searchRef = input;
                  }}
                  underlineColorAndroid="rgba(0,0,0,0)"
                  autoCorrect={true}
                  onChangeText={(text) => this.onSearchChange(text)}
                  value={this.state.searchString}
                />
              </Col>
              {this.state.searchString !== (undefined || '') ? (
                <Col
                  size={15}
                  activeOpacity={0.7}
                  style={styles.center}
                  onPress={() => this.onSearchChange('')}>
                  <FontIcon name="times-circle" color={'#eaeaea'} size={12} />
                </Col>
              ) : (
                <Col size={15}></Col>
              )}
              {showAddContact && (
                <Col
                  size={15}
                  activeOpacity={0.7}
                  style={styles.center}
                  onPress={() =>
                    this.props.navigation.navigate('NewContact', {
                      onGoBack: (data) => addNewContact(data),
                    })
                  }>
                  <FontIcon name={'user-plus'} color={colors.green} size={14} />
                </Col>
              )}
            </Row>
          );
        }}
        click={() => {
          this.searchRef.focus();
        }}
        color="white"
        style={{
          height: 55,
          width: width,
          borderBottomWidth: 0.5,
          borderColor: colors.off,
        }}
        onPressColor={colors.off}
      />
    );
  }
}

SearchBarContact.PropTypes = {
  placeHolderMessage: PropTypes.string,
  updateSearch: PropTypes.func.isRequired,
  showAddContact: PropTypes.bool,
  addNewContact: PropTypes.func,
  searchString: PropTypes.string.isRequired,
  navigation: PropTypes.object,
};
