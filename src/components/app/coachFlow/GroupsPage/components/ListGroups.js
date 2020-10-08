import React, {Component} from 'react';
import {View, Text, Image, InteractionManager} from 'react-native';

import {connect} from 'react-redux';
import isEqual from 'lodash.isequal';

import {navigate} from '../../../../../../NavigationService';
import CardStreamView from './CardStreamView';
import {rowTitle} from '../../../TeamPage/components/elements';
import {FlatListComponent} from '../../../../layout/Views/FlatList';
import {newSession, getSortedSessions} from '../../../../functions/coach';
import styleApp from '../../../../style/style';
import colors from '../../../../style/colors';
import sizes from '../../../../style/sizes';
import Button from '../../../../layout/buttons/Button';
import Loader from '../../../../layout/loaders/Loader';

class ListStreams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coachSessions: false,
      loading: true,
    };
    this.itemsRef = [];
  }
  componentDidMount() {
    setTimeout(this.fetchSessions, 0);
  }
  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevProps.messages, this.props.messages)) {
      setTimeout(this.fetchSessions, 0);
    }
  }
  fetchSessions = async () => {
    const coachSessions = await getSortedSessions({
      coachSessions: this.props.coachSessions,
      sortBy: 'lastMessage',
    });
    this.setState({coachSessions, loading: false});
  };
  header() {
    return (
      <View>
        {rowTitle({
          hideDividerHeader: true,
          title: 'Messages',
          titleColor: colors.black,
          titleStyle: {
            fontWeight: '800',
            fontSize: 23,
          },
          containerStyle: {
            marginBottom: -10,
            marginTop: 5,
          },
        })}
      </View>
    );
  }
  loader() {
    return (
      <View style={{...styleApp.center, height: '40%'}}>
        {this.header()}
        <Loader
          color={colors.greyDark}
          size={50}
          speed={2.2}
          style={{width: '100%'}}
        />
      </View>
    );
  }
  list = () => {
    const {userConnected, AnimatedHeaderValue} = this.props;
    const {coachSessions, loading} = this.state;
    const styleViewLiveLogo = {
      ...styleApp.center,
      backgroundColor: colors.off,
      height: 45,
      width: 45,
      borderRadius: 22.5,
      borderWidth: 1,
      borderColor: colors.grey,
      marginTop: -100,
      marginLeft: 65,
    };
    if (loading) {
      return this.loader();
    }
    if (!userConnected || !coachSessions) {
      return null;
    }
    if (Object.values(coachSessions).length === 0) {
      return (
        <View style={[styleApp.marginView, styleApp.center]}>
          <View style={[styleApp.center, {marginBottom: 80}]}>
            <Image
              source={require('../../../../../img/images/racket.png')}
              style={{height: 80, width: 80, marginTop: 30}}
            />
            <View style={styleViewLiveLogo}>
              <Image
                source={require('../../../../../img/images/live-news.png')}
                style={{
                  height: 27,
                  width: 27,
                }}
              />
            </View>
          </View>

          <Button
            text={'Send a message'}
            icon={{
              name: 'plus',
              size: 18,
              type: 'font',
              color: colors.white,
            }}
            backgroundColor={'green'}
            onPressColor={colors.greenLight}
            click={async () => newSession()}
          />
          <View style={{height: 20}} />
          <Button
            text={'Find a coach'}
            icon={{
              name: 'whistle',
              size: 27,
              type: 'moon',
              color: colors.white,
            }}
            backgroundColor={'blue'}
            onPressColor={colors.blueLight}
            click={() => navigate('Coaches')}
          />
        </View>
      );
    }
    return (
      <FlatListComponent
        list={coachSessions}
        cardList={({item: session}) =>
          session.id && (
            <CardStreamView
              coachSessionID={session.id}
              key={session.objectID}
              scale={1}
              onRef={(ref) => this.itemsRef.push(ref)}
              style={{
                borderBottomWidth: 1,
                borderColor: '#f5f5f5',
              }}
            />
          )
        }
        header={this.header()}
        numColumns={1}
        inverted={false}
        incrementRendering={6}
        initialNumberToRender={8}
        styleContainer={{marginTop: 10}}
        AnimatedHeaderValue={AnimatedHeaderValue}
        paddingBottom={sizes.heightFooter + sizes.marginBottomApp}
      />
    );
  };

  render() {
    return this.list();
  }
}

const mapStateToProps = (state) => {
  return {
    coachSessions: state.user.infoUser.coachSessions,
    userConnected: state.user.userConnected,
    messages: state.conversations,
  };
};

export default connect(
  mapStateToProps,
  {},
)(ListStreams);
