import React,{Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import {connect} from 'react-redux';

const { height, width } = Dimensions.get('screen')
import colors from '../../style/colors'
import sizes from '../../style/sizes'
import ButtonRound from '../../layout/buttons/ButtonRound'

class FooterHomeProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  footer() {
    return <ButtonRound
    icon={'sign'} 
    enabled={true} 
    styleButton={{backgroundColor:colors.green}}
    onPressColor={colors.greenClick}
    loader={false} 
    translateYFooter={0}
    translateXFooter={0} 
    click={() => this.props.userConnected?this.props.navigate('Profile',{}):this.props.navigate('Phone',{pageFrom:'Home'})}
   />
  }
  render() {
    return this.footer()
  }
}

const styles = StyleSheet.create({

});


const  mapStateToProps = state => {
  return {
    userConnected:state.user.userConnected
  };
};

export default connect(mapStateToProps,{})(FooterHomeProfile);

