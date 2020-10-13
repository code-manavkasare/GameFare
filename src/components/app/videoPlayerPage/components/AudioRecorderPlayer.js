import {Component} from 'react';
import PropTypes from 'prop-types';
import {Player, Recorder} from '@react-native-community/audio-toolkit';
import AudioSession from 'react-native-audio-session';

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
    if (this.props.onRef) {
      this.props.onRef(this);
    }
    this.preparePlayer({});
  };
  componentWillUnmount = () => {
    this.destroyPlayer();
  };

  startRecording = () => {
    this.setState({
      audioRecorder: new Recorder('audio.mp4').prepare((err, fsPath) => {
        if (err) {
          console.log(err);
        }
        this.setState({audioFilePath: fsPath});
        this.state.audioRecorder.record();
      }),
    });
  };

  stopRecording = async () => {
    await this.state.audioRecorder.stop();
    this.preparePlayer({});
  };

  preparePlayer = async ({url, isCloud}) => {
    const {audioPlayer} = this.state;
    console.log('preparePlayer', audioPlayer);
    // if (audioPlayer) await this.destroyPlayer();
    await new Promise((resolve) => {
      this.audioSession();
      this.setState({
        audioPlayer: new Player(
          url ? (isCloud ? url : `file://${url}`) : 'audio.mp4',
          {
            autoDestroy: false,
            mixWithOthers: true,
          },
        ).prepare(() => {
          resolve();
        }),
      });
    });
    return true;
  };

  audioSession() {
    const {connectedToSession} = this.props;
    if (connectedToSession) {
      console.log('connected to session');
      AudioSession.setCategoryAndMode(
        'PlayAndRecord',
        'VideoChat',
        'AllowBluetooth',
      );
    }
  }

  playRecord = () => {
    this.state.audioPlayer.stop();
    this.audioSession();
    this.state.audioPlayer.play();
  };
  playPause = () => {
    this.audioSession();
    this.state.audioPlayer.playPause();
  };
  pause = () => {
    this.state.audioPlayer.pause();
  };
  seek = (time) => {
    this.state.audioPlayer.seek(time);
  };
  destroyPlayer = async () => {
    return this.state.audioPlayer.destroy();
  };

  stopPlayingRecord = () => {
    this.state.audioPlayer.stop();
  };

  render = () => null;
}

export default AudioRecorderPlayer;
