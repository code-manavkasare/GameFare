import {Component} from 'react';
import PropTypes from 'prop-types';
import {Player, Recorder} from '@react-native-community/audio-toolkit';

class AudioRecorderPlayer extends Component {
  static propTypes = {
    onRef: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      audioPlayer: null,
      audioRecorder: null,
      audioFilePath: null,
    };
  }

  componentDidMount = () => {
    this.props.onRef(this);
  };

  startRecording = () => {
    this.setState({
      audioRecorder: new Recorder('audio.mp4').prepare((err, fsPath) => {
        if (err) {
          console.log(err);
        }
        console.log(fsPath);
        this.setState({audioFilePath: fsPath});
        this.state.audioRecorder.record();
      }),
    });
  };

  stopRecording = async () => {
    await this.state.audioRecorder.stop();
    this.preparePlayer();
  };

  preparePlayer = () => {
    this.setState({
      audioPlayer: new Player('audio.mp4', {
        autoDestroy: false,
        mixWithOthers: true,
      }).prepare(),
    });
  };

  playRecord = () => {
    this.state.audioPlayer.play();
  };

  stopPlayingRecord = () => {
    this.state.audioPlayer.stop();
  };

  render = () => null;
}

export default AudioRecorderPlayer;
