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
        console.log('fsPath', fsPath);
        this.setState({audioFilePath: fsPath});
        this.state.audioRecorder.record();
      }),
    });
  };

  stopRecording = async () => {
    await this.state.audioRecorder.stop();
    this.preparePlayer();
  };

  preparePlayer = async (audioUrl) => {
    await this.setState({
      audioPlayer: new Player(audioUrl ? `file://${audioUrl}` : 'audio.mp4', {
        autoDestroy: false,
        mixWithOthers: true,
      }).prepare(),
    });
    return true;
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
