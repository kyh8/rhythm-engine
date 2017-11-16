const React = require('react');
const Track = require('./Track');
const Util = require('./Util');

const SONGS = {
  'Gamers! by Hisako Kanemoto': 'src/assets/gamers.mp3',
}

const MS_PER_SEC = 1000;
const FRAME_RATE = MS_PER_SEC / 60;
const NOTE_TRAVEL_RATE = 4; // pixels per frame
const NOTE_START_LOCATION = -130;
const NOTE_HEIGHT = 26;
const NOTE_END_LOCATION = 540;

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
      songDelay: 0,
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
    if (this.state.songElement && !this.state.songElement.paused) {
      const newTime = Math.floor(this.state.songElement.currentTime);
      const newFrame = Math.floor((
        this.state.songElement.currentTime
      ) * MS_PER_SEC / FRAME_RATE);
      this.setState({
        currentSongTime: newTime,
        currentFrame: newFrame,
      });
    }
  }

  mapFrames() {
    // map timings to drop/spawn times
    const noteHitTimes = {
      1: [30,               161, 199, 238, ],
      2: [48, 101,           168, 208, 247, ],
      3: [68, 86, 121, 140, 178, 214, 254,    284],
      4: [77,     132,                      276, 291],
    };
    let earliestFrame = 0;
    let noteMap = {}
    // if note hits bottom at time t, must spawn at t - (distance / TRAVEL_RATE)
    for (let track in noteHitTimes) {
      const noteHitLocation = document.getElementById(
        'hit-note-location-' + track
      );

      let spawnTimes = noteHitTimes[track];
      let trackPositionings = [];
      spawnTimes.forEach((noteSpawnTime) => {
        let initialTime = Math.floor(noteSpawnTime -
          (noteHitLocation.offsetTop - NOTE_START_LOCATION - NOTE_HEIGHT) / NOTE_TRAVEL_RATE);
        let endTime = Math.ceil(initialTime +
          (NOTE_END_LOCATION - NOTE_START_LOCATION) / NOTE_TRAVEL_RATE);
        let notePositionings = {};
        let index = 0;
        for (let i = initialTime; i < endTime; i++) {
          notePositionings[i] = NOTE_START_LOCATION + index * NOTE_TRAVEL_RATE;
          index++;
        }

        if (initialTime < earliestFrame) {
          earliestFrame = initialTime;
        }

        let note = {
          startFrame: initialTime,
          endFrame: endTime,
          positions: notePositionings,
        }
        trackPositionings.push(note);
      });
      noteMap[track] = trackPositionings;
    }
    console.log('notemap', noteMap);

    this.setState({
      noteMap: noteMap,
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

  _setPreviousFrame() {
    console.log('prev')
    this.setState({
      currentFrame: this.state.currentFrame - 1,
    }, () => {console.log(this.state.currentFrame)});
  }

  _setNextFrame() {
    console.log('next');
    this.setState({
      currentFrame: this.state.currentFrame + 1,
    }, () => {console.log(this.state.currentFrame)});
  }

  _restartGame() {
    if (this.state.songElement) {
      this.state.songElement.currentTime = 0;
      this.setState({
        scores: {
          'perfect': 0,
          'good': 0,
          'miss': 0,
        },
      }, () => {
        this.state.songElement.play();
      });
    }
  }

  _pauseGame() {
    if (this.state.songElement) {
      if (this.state.songElement.paused) {
        this.state.songElement.play();
      } else {
        this.state.songElement.pause();
      }
    }
  }

  render() {
    return (
      <div className="game-container">
        <div className='now-playing-song-name'>
          <div className='now-playing-label'>
            <div>
              <i className="fa fa-play-circle" aria-hidden="true"/>
            </div>
            <div>
              {'Now Playing'}
            </div>
          </div>
          <div className='now-playing-song-label'>
            {this.state.currentSongName}
          </div>
        </div>
        <div className='game-content-container'>
          <div className='game-editor'>
            {this.renderTracks()}
          </div>
        </div>
        <div className='scores'>
          <div className='scoreBanner perfect-notes'>
            <div className='score-banner-label'>PERFECT</div>
            <div className='score'>{this.state.scores.perfect}</div>
          </div>
          <div className='scoreBanner good-notes'>
            <div className='score-banner-label'>GOOD</div>
            <div className='score'>{this.state.scores.good}</div>
          </div>
          <div className='scoreBanner missed-notes'>
            <div className='score-banner-label'>MISSED</div>
            <div className='score'>{this.state.scores.miss}</div>
          </div>
        </div>
        <audio id={'now-playing-song'}>
          <source src={this.state.currentSong} type="audio/mpeg"/>
        </audio>
        <div className='buttons'>
          <div className='button' onClick={this._setPreviousFrame.bind(this)}>
            Prev
          </div>
          <div className='button' onClick={this._setNextFrame.bind(this)}>
            Next
          </div>
        </div>
        <div className='menu-tray'>
          <div className='menu-item' onClick={this._restartGame.bind(this)}>
            <i className="fa fa-reply" aria-hidden="true"/>
          </div>
          <div className='menu-item' onClick={this._pauseGame.bind(this)}>
            <i className={
              this.state.songElement && this.state.songElement.paused
              ? "fa fa-play"
              : "fa fa-pause"
            } aria-hidden="true"/>
          </div>
          <div className='menu-item'>
            <i className="fa fa-info-circle" aria-hidden="true"/>
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
