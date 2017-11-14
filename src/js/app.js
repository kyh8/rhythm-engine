const React = require('react');
const Track = require('./Track');
const Util = require('./Util');

const SONGS = {
  'Gamers!': 'src/assets/gamers.mp3',
}

const MS_PER_SEC = 1000;
const FRAME_RATE = MS_PER_SEC / 60;
const NOTE_TRAVEL_RATE = 100;

const KEYMAP = {
  74: 1,
  75: 2,
  76: 3,
  186: 4,
  65: 1,
  83: 2,
  68: 3,
  70: 4,
};

export class App extends React.Component {
  constructor(props) {
    super(props);

    let songLibrary = Object.keys(SONGS);

    this.state = {
      currentSong: SONGS[songLibrary[0]],
      songElement: null,
      currentSongTime: 0,
      currentSongName: songLibrary[0],
      currentSongDuration: 0,
      currentFrame: 0,
      activeKeys: [],
      noteMap: {},
      scores: {
        'perfect': 0,
        'good': 0,
        'miss': 0,
      },
      lastRender: 0,
      lastRenderSongTime: 0,
    }
  }

  componentDidMount() {
    let song = document.getElementById('now-playing-song');
    song.addEventListener('loadedmetadata', (e) => {
      this.setState({
        songElement: song,
        currentSongTime: Math.floor(song.currentTime),
        currentSongDuration: Math.floor(song.duration),
      }, () => {
        this.mapFrames();
        song.play();
        song.volume = 0;

        window.requestAnimationFrame(this.gameLoop.bind(this));
      });
    });

    window.onkeydown = (e) => {
      let key = e.keyCode ? e.keyCode : e.which;
      if (KEYMAP[key] && this.state.activeKeys.indexOf(KEYMAP[key]) === -1) {
        let newActiveKeys = this.state.activeKeys;
        newActiveKeys.push(KEYMAP[key]);
        this.setState({
          activeKeys: newActiveKeys,
        });
      }
    }

    window.onkeyup = (e) => {
      let key = e.keyCode ? e.keyCode : e.which;
      if (KEYMAP[key] && this.state.activeKeys.indexOf(KEYMAP[key]) !== -1) {
        let newActiveKeys = this.state.activeKeys;
        newActiveKeys.splice(newActiveKeys.indexOf(KEYMAP[key]), 1);
        this.setState({
          activeKeys: newActiveKeys,
        });
      }
    }
  }

  gameLoop(timestamp) {
    let progress = timestamp - this.state.lastRender;

    this.updateFrame(progress);
    this.setState({
      lastRender: timestamp,
    });
    window.requestAnimationFrame(this.gameLoop.bind(this));
  }

  updateFrame(progress) {
    if (this.state.songElement) {
      const newTime = Math.floor(this.state.songElement.currentTime);
      const newFrame = Math.floor(this.state.songElement.currentTime * MS_PER_SEC / FRAME_RATE);
      this.setState({
        currentSongTime: newTime,
        currentFrame: newFrame,
      });
    }
  }

  mapFrames() {
    // map timings to drop/spawn times
    this.setState({
      noteMap: {
        1: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        2: [50, 150, 250, 350, 450, 550, 650, 750, 850, 950],
        3: [25, 125, 225, 325, 425, 525, 625, 725, 825, 925],
        4: [],
      }
    });
  }

  updateScore(type) {
    let scores = this.state.scores;
    scores[type] += 1;
    this.setState({
      scores: scores,
    });
  }

  renderTracks() {
    let tracks = [];
    for(let i = 1; i < 5; i++) {
      tracks.push(
        <Track
          key = {'track-' + i}
          isActive = {this.state.activeKeys.indexOf(i) !== -1}
          trackID = {i}
          currentFrame = {this.state.currentFrame}
          spawnTimes = {this.state.noteMap[i]}
          updateScore = {this.updateScore.bind(this)}/>
      );
    }
    return tracks;
  }

  render() {
    return (
      <div className="game-container">
        <audio controls id={'now-playing-song'}>
          <source src={this.state.currentSong} type="audio/mpeg"/>
        </audio>
        <div className='now-playing-song-name'>
          <span className='now-playing-label'>
            {'Now Playing: '}
          </span>
          <span className='now-playing-song-label'>
            {this.state.currentSongName}
          </span>
        </div>
        <div className='game-editor'>
          {this.renderTracks()}
        </div>
        <div className='now-playing-song-time unselectable'>
          <div>
            {
              this.state.currentSongTime > this.state.currentSongDuration
              ? Util.getDisplayTime(this.state.currentSongDuration)
              : Util.getDisplayTime(this.state.currentSongTime)
            }
          </div>
          <div className='time-scrub-container'>
            <div className='time-scrub' style={{
              left: (
                this.state.currentSongTime / this.state.currentSongDuration
              ) * 390 + 'px',
            }}/>
          </div>
          <div>
            {Util.getDisplayTime(this.state.currentSongDuration)}
          </div>
        </div>
        <div className='scores'>
          <div className='perfect-notes'>
            {'perfect: ' + this.state.scores.perfect}
          </div>
          <div className='good-notes'>
            {'good: ' + this.state.scores.good}
          </div>
          <div className='missed-notes'>
            {'misses: ' + this.state.scores.miss}
          </div>
        </div>
        <div className='frame-count'>
          {'Frame: ' + this.state.currentFrame}
        </div>
      </div>
    );
  }
}

module.exports = App;
