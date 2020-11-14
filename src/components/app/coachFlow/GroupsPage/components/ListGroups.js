import React, {Component} from 'react';
import {View, Text, Image, InteractionManager} from 'react-native';

import {connect} from 'react-redux';
import isEqual from 'lodash.isequal';

import {navigate} from '../../../../../../NavigationService';
import CardStreamView from './CardStreamView';
import {rowTitle} from '../../../TeamPage/components/elements';
import {FlatListComponent} from '../../../../layout/Views/FlatList';
import {getSortedSessions} from '../../../../functions/coach';
import {newConversation} from '../../../../functions/message';
import {boolShouldComponentUpdate} from '../../../../functions/redux';
import styleApp from '../../../../style/style';
import colors from '../../../../style/colors';
import sizes from '../../../../style/sizes';
import Button from '../../../../layout/buttons/Button';
import Loader from '../../../../layout/loaders/Loader';

class ListStreams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coachSessions: getSortedSessions({
        coachSessions: props.coachSessions,
        sortBy: 'lastMessage',
      }),
      loading: false,
    };
  }
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'ListGroups',
    });
  }
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
          <View style={[styleApp.center, {marginBottom: 80, marginTop: 30}]}>
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
            click={async () => newConversation()}
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
              unselectable={true}
              scale={1}
              style={{
                borderBottomWidth: 1,
                borderColor: colors.off,
                paddingTop: 15,
                paddingBottom: 15,
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
  };
};

export default connect(
  mapStateToProps,
  {},
)(ListStreams);
