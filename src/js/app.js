const LevelSelector = require('./LevelSelector');
const React = require('react');
const Track = require('./Track');
const Util = require('./Util');

const GAMERS = require('../sheetmusic/gamers.json');
const SHELTER = require('../sheetmusic/shelter.json');
const HIKARUNARA = require('../sheetmusic/hikarunara.json');

const SONGS = [
  {
    songName: 'Gamers!',
    songArtist: 'Hisako Kanemoto',
    audioFile: 'src/assets/gamers.mp3',
    sheetMusic: GAMERS,
    albumArtwork: 'src/assets/gamers.png',
    difficulty: 'Hard',
    songGenre: 'Anime',
  },
  {
    songName: 'Hikaru Nara',
    songArtist: 'Goose House',
    audioFile: 'src/assets/your_lie_in_april_op.mp3',
    sheetMusic: HIKARUNARA,
    albumArtwork: 'src/assets/shigatsu.png',
    difficulty: 'Easy',
    songGenre: 'Anime',
  },
  {
    songName: 'Shelter',
    songArtist: 'Porter Robinson',
    audioFile: 'src/assets/shelter.mp3',
    sheetMusic: SHELTER,
    albumArtwork: 'src/assets/shelter.png',
    difficulty: 'Medium',
    songGenre: 'Pop',
  },
];

const MS_PER_SEC = 1000;
const FRAME_RATE = MS_PER_SEC / 60;
const NOTE_TRAVEL_RATE = 4; // pixels per frame
const NOTE_START_LOCATION = -130;
const NOTE_HEIGHT = 26;
const NOTE_END_LOCATION = 540;

const KEYMAP = {
  74: 0,
  75: 1,
  76: 2,
  186: 3,
  65: 0,
  83: 1,
  68: 2,
  70: 3,
};

export class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentSongIndex: -1,
      songElement: null,
      currentSongTime: 0,
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
      registeredFrets: {},
      isLevelSelected: false,
    }
  }

  componentDidMount() {
    window.onkeypress = (e) => {
      if (this.state.currentSongIndex == -1) {
        return;
      }
      let key = e.keyCode ? e.keyCode : e.which;
      if (key === 32) {
        this._pauseGame();
      }
      if (key === 114) {
        this._restartGame();
      }
    }

    window.onkeydown = (e) => {
      if (this.state.currentSongIndex == -1) {
        return;
      }
      let key = e.keyCode ? e.keyCode : e.which;
      if (KEYMAP[key] !== undefined && this.state.activeKeys.indexOf(KEYMAP[key]) === -1) {
        let newActiveKeys = this.state.activeKeys;
        newActiveKeys.push(KEYMAP[key]);
        this.setState({
          activeKeys: newActiveKeys,
        });
      }
    }

    window.onkeyup = (e) => {
      if (this.state.currentSongIndex == -1) {
        return;
      }
      let key = e.keyCode ? e.keyCode : e.which;
      if (KEYMAP[key] !== undefined && this.state.activeKeys.indexOf(KEYMAP[key]) !== -1) {
        let newActiveKeys = this.state.activeKeys;
        newActiveKeys.splice(newActiveKeys.indexOf(KEYMAP[key]), 1);
        this.setState({
          activeKeys: newActiveKeys,
        });
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.currentSongIndex > -1 && prevState.currentSongIndex == -1) {
      let song = document.getElementById('now-playing-song');
      if (!song) {
        return;
      }
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

  registerFret(trackID, frame) {
    let registeredFrets = this.state.registeredFrets;
    if (!registeredFrets[frame]) {
      registeredFrets[frame] = [0, 0, 0, 0];
    }
    registeredFrets[frame][trackID] = 1;
    this.setState({
      registeredFrets: registeredFrets,
    });
  }

  printRegisteredFrets() {
    let recordedSheet = '';
    for (let time in this.state.registeredFrets) {
      let tracks = this.state.registeredFrets[time];
      recordedSheet += '"' + time + '": [' + tracks[0] + ', ' + tracks[1] + ', ' + tracks[2] + ', ' + tracks[3] + '],\n';
    }
    console.log('recorded sheet\n', recordedSheet);
  }

  clearRegisteredFrets() {
    console.log('cleared');;
    this.setState({
      registeredFrets: {},
    });
  }

  mapFrames() {
    // map timings to drop/spawn times
    const sheetMusic = SONGS[this.state.currentSongIndex].sheetMusic;

    let earliestFrame = 0;
    let noteMap = {
      0: [],
      1: [],
      2: [],
      3: [],
    };

    for (let noteHitTime in sheetMusic) {
      let tracks = sheetMusic[noteHitTime].map((isHit, index) => {
        if (isHit == 1) {
          return index;
        }
      }).filter((track) => {
        return track !== undefined;
      });
      tracks.forEach((track) => {
        const noteHitLocation = document.getElementById(
          'hit-note-location-' + track
        );

        let trackPositionings = noteMap[track];
        let initialTime = Math.floor(noteHitTime -
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
          hitTime: noteHitTime,
          positions: notePositionings,
        }
        trackPositionings.push(note);
        noteMap[track] = trackPositionings;
      });
    }
    console.log('sheet music', noteMap);

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
    for(let i = 0; i < 4; i++) {
      tracks.push(
        <Track
          key = {'track-' + i}
          isActive = {this.state.activeKeys.indexOf(i) !== -1}
          trackID = {i}
          currentFrame = {this.state.currentFrame}
          spawnTimes = {this.state.noteMap[i]}
          updateScore = {this.updateScore.bind(this)}
          registerFret = {this.registerFret.bind(this)}/>
      );
    }
    return tracks;
  }

  _selectLevel(index) {
    this.setState({
      currentSongIndex: index,
      isLevelSelected: true,
    });
  }

  _setPreviousFrame() {
    this.setState({
      currentFrame: this.state.currentFrame - 1,
    });
  }

  _setNextFrame() {
    this.setState({
      currentFrame: this.state.currentFrame + 1,
    });
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
      <div className="content-container">
        {
          this.state.isLevelSelected
          ? (
            <div className='game-container'>
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
                  {
                    SONGS[this.state.currentSongIndex].songName.toUpperCase()
                    + ' BY '
                    + SONGS[this.state.currentSongIndex].songArtist.toUpperCase()
                  }
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
              <audio controls id={'now-playing-song'}>
                <source src={SONGS[this.state.currentSongIndex].audioFile} type="audio/mpeg"/>
              </audio>
              <div className='buttons'>
                <div className='button' onClick={this._setPreviousFrame.bind(this)}>
                  Prev
                </div>
                <div className='button' onClick={this._setNextFrame.bind(this)}>
                  Next
                </div>
                <div className='button' onClick={this.printRegisteredFrets.bind(this)}>
                  Print
                </div>
                <div className='button' onClick={this.clearRegisteredFrets.bind(this)}>
                  Clear
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
          ) : (
            <div className='level-selector-container'>
              <LevelSelector
                songLibrary={SONGS}
                selectLevel={this._selectLevel.bind(this)}/>
            </div>
          )
        }
      </div>
    );
  }
}

module.exports = App;
