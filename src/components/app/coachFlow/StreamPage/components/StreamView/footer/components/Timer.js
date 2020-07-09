import React, {Component} from 'react';
import {Text} from 'react-native';

export default class Timer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      now: Date.now(),
    };
  }

  componentDidMount() {
    this.updateTime()
  }

  componentDidUpdate(prevProps, prevState) {
    this.updateTime()
  }

  updateTime() {
    setTimeout(() => {this.setState({now: Date.now()})}, 1000)
  }

  static getDerivedStateFromProps(props, state) {
    function pad(num, size) {
      var s = num+"";
      while (s.length < size) s = "0" + s;
      return s;
    }
    let duration = state.now - props.startTime
    let ms = duration % 1000
    let sec = ((duration - ms) / 1000) % 60
    let min = ((duration - ms - (sec * 1000)) / 60000) % 60
    let hours = ((duration - ms - (sec * 1000) - (min * 60000)) / 3600000) % 24
    return {
      time: `${pad(hours, 2)}:${pad(min, 2)}:${pad(sec, 2)}`
    }
  }

  timer() {
    const {options} = this.props
      return (
      <Text style={options.text}>{this.state.time}</Text>
      );
  }

  render() {
    return this.timer();
  }
}