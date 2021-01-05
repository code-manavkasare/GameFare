import React, {Component} from 'react';
import {View} from 'react-native';

import {connect} from 'react-redux';

import {navigate} from '../../../../../../NavigationService';
import CardStreamView from './CardStreamView';
import {rowTitle} from '../../../TeamPage/components/elements';
import {FlatListComponent} from '../../../../layout/Views/FlatList';
import {newConversation} from '../../../../functions/message';
import {boolShouldComponentUpdate} from '../../../../functions/redux';
import styleApp from '../../../../style/style';
import colors from '../../../../style/colors';
import {heightFooter, marginBottomApp} from '../../../../style/sizes';
import Loader from '../../../../layout/loaders/Loader';
import {userConnectedSelector} from '../../../../../store/selectors/user';
import {sessionsSelector} from '../../../../../store/selectors/sessions';

class ListStreams extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
            ...styleApp.marginView,
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
    const {userConnected, AnimatedHeaderValue, coachSessions} = this.props;

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
    if (!userConnected || !coachSessions) {
      return null;
    }
    const styleCard = {
      borderBottomWidth: 1,
      borderColor: colors.off,
      paddingTop: 15,
      paddingBottom: 15,
    };
    return (
      <FlatListComponent
        list={coachSessions}
        cardList={({item: session}) =>
          session.id ? (
            <CardStreamView
              coachSessionID={session.id}
              key={session.objectID}
              unselectable={true}
              scale={1}
              style={styleCard}
            />
          ) : null
        }
        header={this.header()}
        numColumns={1}
        inverted={false}
        incrementRendering={6}
        initialNumberToRender={8}
        styleContainer={{marginTop: 10}}
        AnimatedHeaderValue={AnimatedHeaderValue}
        paddingBottom={heightFooter + marginBottomApp}
        ListEmptyComponent={{
          clickButton: () =>
            !userConnected ? navigate('SignIn') : newConversation(),
          textButton: !userConnected ? 'Sign in' : 'Search',
          text: !userConnected
            ? 'Sign in to send messages'
            : 'Search for users to send messages',
          iconButton: !userConnected ? 'user' : 'search',
          icon: 'comment-alt',
        }}
      />
    );
  };

  render() {
    return this.list();
  }
}

const mapStateToProps = (state) => {
  return {
    coachSessions: sessionsSelector(state, {hideCurrentSession: false}),
    userConnected: userConnectedSelector(state),
  };
};

export default connect(mapStateToProps)(ListStreams);
