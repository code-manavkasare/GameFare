import React, {Component} from 'react';
import {Picker} from 'react-native';

import styleApp from '../../style/style';

export default class Alert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      choice: '',
    };
  }
  render() {
    return (
      <Picker
        selectedValue={this.props.choice}
        onValueChange={(choice) => {
          this.props.setChoice(choice);
        }}
        itemStyle={{...styleApp.text, height: 100}}>
        {this.props.choices.map((i, index) => (
          <Picker.Item key={index} label={i} value={i} />
        ))}
      </Picker>
    );
  }
}
