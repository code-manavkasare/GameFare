import React, {Component} from 'react';
import {Animated, View, Text, TextInput, StyleSheet} from 'react-native';
import {Picker} from '@react-native-community/picker';
import {connect} from 'react-redux';
import {object} from 'prop-types';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {heightHeaderModal} from '../../../style/sizes';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import {rowTitle} from '../../TeamPage/components/elements';
import ScrollView from '../../../layout/scrollViews/ScrollView';
import {createClub, deleteClub, editClub} from '../../../functions/clubs';
import {userInfoSelector} from '../../../../store/selectors/user';
import {getSportTypes} from '../../../database/firebase/fetchData';
import {clubSelector} from '../../../../store/selectors/clubs';
import {goBack, navigate} from '../../../../../NavigationService';
import KeyboardAwareButton from '../../../layout/buttons/KeyboardAwareButton';
import {timeout} from '../../../functions/coach';

class ClubForm extends Component {
  static propTypes = {
    navigation: object,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      title: props.club?.info?.title ?? '',
      description: props.club?.info?.description ?? '',
      sport: props.club?.info?.sport ?? undefined,
      sportTypes: [],
      editMode: props.club !== undefined,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount = async () => {
    const {sport} = this.state;
    const sportTypes = await getSportTypes();
    this.setState({sportTypes, sport: sport ?? sportTypes[0]});
  };
  createClub = async () => {
    const {navigation} = this.props;
    const {title, description, sport} = this.state;
    await this.setState({loader: true});
    await createClub({title, description, sport});
    navigation.goBack();
  };
  editClub = async () => {
    const {navigation, club} = this.props;
    const {title, description, sport} = this.state;
    const {id: clubID} = club;
    await this.setState({loader: true});
    await editClub({title, description, sport, clubID});
    navigation.goBack();
  };
  deleteClub = async () => {
    const {club} = this.props;
    const {id: clubID} = club;
    navigate('Alert', {
      textButton: 'Delete',
      colorButton: 'red',
      onPressColor: 'red',
      onGoBack: async () => {
        goBack();
        this.titleInput.blur();
        this.descriptionInput.blur();
        await timeout(300);
        navigate('ClubsPage', {
          timestamp: Date.now(),
          clubID: undefined,
        });
        deleteClub({clubID});
      },
      title: 'Are you sure you want to delete this club?',
    });
  };
  createClubForm = () => {
    const {title, description, sport, sportTypes} = this.state;
    return (
      <View style={[styleApp.marginView, {marginTop: 15}]}>
        {this.createClubHeader()}
        <Text style={styles.sportHeader}>Club Name</Text>
        <TextInput
          style={styleApp.textField}
          placeholder="Club Name"
          autoFocus={true}
          autoCorrect={true}
          underlineColorAndroid="rgba(0,0,0,0)"
          blurOnSubmit={true}
          returnKeyType={'done'}
          placeholderTextColor={colors.greyDark}
          ref={(input) => {
            this.titleInput = input;
          }}
          inputAccessoryViewID={'title'}
          onChangeText={(text) => this.setState({title: text})}
          value={title}
        />
        <Text style={styles.sportHeader}>Description</Text>
        <TextInput
          style={[styleApp.textField, {height: 100, paddingTop: 10}]}
          placeholder="Description"
          multiline={true}
          autoCorrect={true}
          underlineColorAndroid="rgba(0,0,0,0)"
          blurOnSubmit={true}
          returnKeyType={'done'}
          placeholderTextColor={colors.greyDark}
          ref={(input) => {
            this.descriptionInput = input;
          }}
          inputAccessoryViewID={'title'}
          onChangeText={(text) => this.setState({description: text})}
          value={description}
        />
        <Text style={styles.sportHeader}>Sport</Text>
        <Picker
          selectedValue={sport}
          onValueChange={(sport) => {
            this.setState({sport});
          }}
          itemStyle={styles.sportItemStyle}>
          {sportTypes.map((i, index) => (
            <Picker.Item key={index} label={i} value={i} />
          ))}
        </Picker>
      </View>
    );
  };
  confirmButton = () => {
    const {title, description, loader, editMode} = this.state;
    return (
      <KeyboardAwareButton
        disabled={title === '' || description === ''}
        loader={loader}
        click={editMode ? this.editClub : this.createClub}
        styleFooter={styleApp.footerModal}
        text={editMode ? 'Apply Changes' : 'Create Club'}
        styleButton={{height: 55}}
        nativeID="title"
        backgroundColor="primary"
        onPressColor={colors.primaryLight}
      />
    );
  };
  createClubHeader = () => {
    const {editMode} = this.state;
    if (editMode) return null;
    return rowTitle({
      hideDividerHeader: true,
      title: 'Create a Club',
      titleColor: colors.greyDarker,
      titleStyle: {
        fontWeight: '800',
        fontSize: 23,
      },
      containerStyle: {
        marginBottom: 0,
        marginTop: 0,
      },
    });
  };
  render() {
    const {navigation} = this.props;
    const {editMode} = this.state;
    const icon2 = editMode
      ? {
          sizeIcon2: 17,
          icon2: 'trash',
          backgroundColorIcon2: 'transparent',
          clickButton2: this.deleteClub,
        }
      : {
          icon2: 'times',
          backgroundColorIcon2: 'transparent',
          clickButton2: navigation.goBack,
          initialTitleOpacity: 0,
        };
    const icon1 = editMode && {
      sizeIcon1: 17,
      icon1: 'chevron-left',
      backgroundColorIcon1: 'transparent',
      clickButton1: navigation.goBack,
      initialTitleOpacity: 1,
    };
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          marginTop={10}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={editMode ? 'Edit Club' : 'Create a Club'}
          inputRange={[10, 20]}
          initialBorderColorIcon={'transparent'}
          initialBackgroundColor={'transparent'}
          initialTitleOpacity={1}
          initialBorderWidth={1}
          initialBorderColorHeader={'transparent'}
          {...icon1}
          {...icon2}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.createClubForm}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={heightHeaderModal}
          style={!editMode && {marginTop: 5}}
          offsetBottom={50}
          showsVerticalScrollIndicator={true}
        />
        {this.confirmButton()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  sportHeader: {
    ...styleApp.textBold,
    fontSize: 18,
    marginTop: 10,
    color: colors.greyDarker,
  },
  sportItemStyle: {
    ...styleApp.text,
    fontSize: 19,
    height: 100,
  },
});

const mapStateToProps = (state, props) => {
  return {
    club: clubSelector(state, {id: props?.route?.params?.editClubID}),
    infoUser: userInfoSelector(state),
  };
};

export default connect(mapStateToProps)(ClubForm);
