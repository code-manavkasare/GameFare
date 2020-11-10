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
      audioFileDuration: null,
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

  startRecording = (isMicrophoneMuted) => {
    this.setState({
      audioRecorder: new Recorder('audio.mp4').prepare((err, fsPath) => {
        if (err) {
          console.log(err);
        }
        this.setState({audioFilePath: fsPath});
        if (!isMicrophoneMuted) this.state.audioRecorder.record();
      }),
    });
  };

  stopRecording = async () => {
    await this.state.audioRecorder.stop();
    await this.preparePlayer({});
  };

  preparePlayer = async ({url, isCloud}) => {
    await new Promise(async (resolve) => {
      await this.adjustAudioSession();
      await this.setState({
        audioPlayer: new Player(
          url ? (isCloud ? url : `file://${url}`) : 'audio.mp4',
          {
            autoDestroy: false,
            mixWithOthers: true,
          },
        ),
      });
      await this.state.audioPlayer.prepare(() => {
        this.setState({
          audioFileDuration: this.state.audioPlayer.duration / 1000,
        });
      });
      this.adjustAudioSession().then(() => {
        resolve();
      });
    });
    return true;
  };

  adjustAudioSession = async () => {
    const {connectedToSession} = this.props;
    if (connectedToSession) {
      return new Promise((resolve, reject) => {
        AudioSession.setCategoryAndMode(
          'PlayAndRecord',
          'VideoChat',
          'AllowBluetooth',
        )
          .then(() => {
            console.log('AUDIO SESSION CHANGED');
            return resolve();
          })
          .catch(() => {
            return reject();
          });
      });
    }
    return null;
  };

  playRecord = async () => {
    await this.adjustAudioSession();
    this.state.audioPlayer.stop();
    await this.state.audioPlayer.play();
    console.log('PLAY RECORD');
  };
  playPause = async () => {
    await this.adjustAudioSession();
    this.state.audioPlayer.playPause();
    console.log('PLAY PAUSE');
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
