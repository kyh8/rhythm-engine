const LevelSelector = require('./LevelSelector');
const React = require('react');
const Track = require('./Track');
const Util = require('./Util');
const Firebase = require('firebase/app');
require('firebase/firestore');


const GAMERS = require('../sheetmusic/gamers.json');
const SHELTER = require('../sheetmusic/shelter.json');
const HIKARUNARA = require('../sheetmusic/hikarunara.json');
const THISGAME = require('../sheetmusic/thisgame.json');
const FLYHIGH = require('../sheetmusic/flyhigh.json');
const NARUTO = require('../sheetmusic/naruto.json');
const BRAVESHINE = require('../sheetmusic/braveshine.json');
const OPM = require('../sheetmusic/onepunchman.json');
const ATTACKONTITAN = ('../sheetmusic/attackontitan.json');

const SCORE_VALUES = require('../scoreconstants.json');

const SONGS = [
  {
    songName: 'Hikaru Nara',
    songArtist: 'Goose House',
    audioFile: new Audio('src/assets/your_lie_in_april_op.mp3'),
    sheetMusic: HIKARUNARA,
    albumArtwork: 'src/assets/shigatsu.png',
    sourceAnime: 'Your Lie In April',
    difficulty: 'Easy',
    isAvailable: true,
  },
  {
    songName: 'Silhouette',
    songArtist: 'KANA-BOON',
    audioFile: new Audio('src/assets/naruto16.mp3'),
    sheetMusic: NARUTO,
    albumArtwork: 'src/assets/naruto.png',
    sourceAnime: 'Naruto',
    difficulty: 'Medium',
    isAvailable: true,
  },
  {
    songName: 'Gamers!',
    songArtist: 'Hisako Kanemoto',
    audioFile: new Audio('src/assets/gamers.mp3'),
    sheetMusic: GAMERS,
    albumArtwork: 'src/assets/gamers.png',
    sourceAnime: 'Gamers!',
    difficulty: 'Hard',
    isAvailable: true,
  },
  {
    songName: 'Shelter',
    songArtist: 'Porter Robinson',
    audioFile: new Audio('src/assets/shelter.mp3'),
    sheetMusic: SHELTER,
    albumArtwork: 'src/assets/shelter.png',
    sourceAnime: 'Shelter',
    difficulty: 'Medium',
    isAvailable: false,
  },
  {
    songName: 'This Game',
    songArtist: 'Konomi Suzuki',
    audioFile: new Audio('src/assets/nogamenolife.mp3'),
    sheetMusic: THISGAME,
    albumArtwork: 'src/assets/nogamenolife.png',
    sourceAnime: 'No Game No Life',
    difficulty: 'Hard',
    isAvailable: false,
  },
  {
    songName: 'Fly High!!',
    songArtist: 'Burnout Syndromes',
    audioFile: new Audio('src/assets/flyhigh.mp3'),
    sheetMusic: FLYHIGH,
    albumArtwork: 'src/assets/haikyuu.png',
    sourceAnime: 'Haikyuu!',
    difficulty: 'Hard',
    isAvailable: false,
  },
  {
    songName: 'Brave Shine',
    songArtist: 'Aimer',
    audioFile: new Audio('src/assets/fateubw.mp3'),
    sheetMusic: BRAVESHINE,
    albumArtwork: 'src/assets/fateubw.png',
    sourceAnime: 'Fate Stay Night: Unlimited Bladeworks',
    difficulty: 'Hard',
    isAvailable: false,
  },
  {
    songName: 'The Hero!!',
    songArtist: 'JAM Project',
    audioFile: new Audio('src/assets/opm.mp3'),
    sheetMusic: FLYHIGH,
    albumArtwork: 'src/assets/opm.png',
    sourceAnime: 'One Punch Man',
    difficulty: 'Hard',
    isAvailable: false,
  },
  {
    songName: 'Guren no Yumiya',
    songArtist: 'Linked Horizon',
    audioFile: new Audio('src/assets/attackontitan.mp3'),
    sheetMusic: FLYHIGH,
    albumArtwork: 'src/assets/attack-on-titan.png',
    sourceAnime: 'Attack On Titan',
    difficulty: 'Hard',
    isAvailable: false,
  },
];

const MS_PER_SEC = 1000;
const FRAME_RATE = MS_PER_SEC / 60;
const NOTE_TRAVEL_RATE = 4; // pixels per frame
const NOTE_START_LOCATION = -130;
const NOTE_HEIGHT = 26;
const NOTE_END_LOCATION = 540;
const INITIAL_DELAY = 200;
const BUFFER_DELAY = 6;
const DEFAULT_NAME = 'Unnamed';

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

const KEYNAME_MAP = {
  'A': 0,
  'S': 1,
  'D': 2,
  'F': 3,
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
      initialFrames: 0,
      registeredFrets: {},
      isLevelSelected: false,
      countdown: 3,
      showCountdown: true,
      editorMode: false,
      songEnded: false,
      finalScore: 0,
      highScoreOwner: '',
      submittingScore: false,
      showEndGameMenu: false,
      restartingGame: false,
    }

    // Initialize Firebase
    const config = {
     apiKey: "AIzaSyDmsxEspDer5jnqnFVv_zF0_f_0V4E3920",
     authDomain: "rhythm-engine.firebaseapp.com",
     databaseURL: "https://rhythm-engine.firebaseio.com",
     projectId: "rhythm-engine",
     storageBucket: "",
     messagingSenderId: "173306413344"
    };
    Firebase.initializeApp(config);
  }

  componentWillMount() {
    SONGS.forEach((song) => {
      song.audioFile.preload = "auto";
    });
  }

  componentDidMount() {
    window.onkeypress = (e) => {
      if (this.state.currentSongIndex == -1) {
        return;
      }
      let key = e.keyCode ? e.keyCode : e.which;
      if (key === 32 && this.state.editorMode) {
        this._pauseGame();
      }
    }

    window.onkeydown = (e) => {
      if (this.state.currentSongIndex == -1 || this.state.songEnded) {
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
      if (this.state.currentSongIndex == -1 || this.state.songEnded) {
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

    if (this.state.editorMode) {
      const song = document.getElementById('now-playing-song');
      song.controls = this.state.editorMode;
      if (!song) {
        return;
      }
      this.setState({
        songElement: song,
        currentSongTime: Math.floor(song.currentTime),
        currentSongDuration: Math.floor(song.duration),
      }, () => {
        this.mapFrames();

        window.requestAnimationFrame(this.gameLoop.bind(this));
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.currentSongIndex > -1 && prevState.currentSongIndex == -1
      || this.state.currentSongIndex > -1 && !this.state.songEnded && prevState.songEnded
    ) {
      // const song = new Audio(SONGS[this.state.currentSongIndex].audioFile);
      const song = SONGS[this.state.currentSongIndex].audioFile;
      song.onended = () => {
        let finalScore = 0;
        for (let scoreTier in this.state.scores) {
          finalScore += SCORE_VALUES[scoreTier] * this.state.scores[scoreTier];
        }
        this.setState({
          songEnded: true,
          finalScore: finalScore,
        });
      }
      song.controls = this.state.editorMode;
      if (!song) {
        return;
      }
      let transitionScreen = document.getElementById('transition-screen-countdown');
      let countdownInterval = setInterval(() => {
        if (this.state.countdown == -1) {
          clearInterval(countdownInterval);
          this.setState({
            showCountdown: false,
          }, () => {
            this.setState({
              songElement: song,
              currentSongTime: Math.floor(song.currentTime),
              currentSongDuration: Math.floor(song.duration),
            }, () => {
              this.mapFrames();

              window.requestAnimationFrame(this.gameLoop.bind(this));
            });
          });
          return;
        }
        let countdownNum = document.createElement('div');
        countdownNum.innerText =
          this.state.countdown > 0
          ? this.state.countdown
          : 'Go!';
        countdownNum.classList.add('countdown-number');
        transitionScreen.appendChild(countdownNum);
        countdownNum.addEventListener('animationend', (e) => {
          transitionScreen.removeChild(countdownNum);
        });
        this.setState({
          countdown: this.state.countdown - 1,
        });
      }, 1000);
    }
  }

  /**
   * Add a new score to the database given the songID, username, and new score.
   **/
  addScoreToDb(songId, userName, score, callback) {
    const db = Firebase.firestore();

    db.collection('songs').doc(songId).collection('scores').add({
      username: userName,
      score: score
    }).then(callback);
  }

  /**
   * Given a song and number of scores to return, calls the callback with a snapshot
   * of the scores.
   *
   * The query snapshot is iterable of user documents, which are accessed as follows:
   *
   *     user.data().username   >>   username for this score
   *     user.data().score      >>   the respective score
   **/
  getScoresFromDb(songId, nScores, callback) {
    const db = Firebase.firestore();
    db.collection('songs').doc(songId).collection('scores')
      .orderBy('score', 'desc').limit(nScores).get().then((querySnapshot) => {
        callback(querySnapshot)
      });
    // SAMPLE CODE
    // query.forEach((user) => {
    //   console.log(user.data().username + " > " + user.data().score);
    // });
  }

  gameLoop(timestamp) {
    if (this.state.showCountdown || this.state.songEnded) {
      return;
    }
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
      let initialFrames = this.state.initialFrames;
      if (this.state.initialFrames <= INITIAL_DELAY) {
        initialFrames++;
        if (this.state.initialFrames == INITIAL_DELAY - BUFFER_DELAY && this.state.songElement.currentTime == 0) {
          this.state.songElement.play();
        }
      }
      const newFrame = initialFrames + Math.floor((
        this.state.songElement.currentTime
      ) * MS_PER_SEC / FRAME_RATE);
      console.log('new frame', newFrame);
      this.setState({
        currentSongTime: newTime,
        currentFrame: newFrame,
        initialFrames: initialFrames,
      });
    }
  }

  registerFret(trackID, frame) {
    let registeredFrets = this.state.registeredFrets;
    if (frame - INITIAL_DELAY < 0) {
      return;
    }
    if (!registeredFrets[frame - INITIAL_DELAY]) {
      registeredFrets[frame - INITIAL_DELAY] = [0, 0, 0, 0];
    }
    registeredFrets[frame - INITIAL_DELAY][trackID] = 1;
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
    console.log('cleared');
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
        let initialTime = INITIAL_DELAY + Math.floor(noteHitTime -
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
          hitTime: parseInt(noteHitTime) + INITIAL_DELAY,
          positions: notePositionings,
        }
        trackPositionings.push(note);
        noteMap[track] = trackPositionings;
      });
    }

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
          registerFret = {this.registerFret.bind(this)}
          intialDelay = {INITIAL_DELAY}
          restartingGame = {this.state.restartingGame} />
      );
    }
    return tracks;
  }

  _selectLevel(index) {
    SONGS[index].audioFile.pause();
    SONGS[index].audioFile.currentTime = 0;
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
        currentSongTime: 0,
        initialFrames: 0,
        scores: {
          'perfect': 0,
          'good': 0,
          'miss': 0,
        },
        showCountdown: true,
        countdown: 3,
        songEnded: false,
        highScoreOwner: '',
        submittingScore: false,
        showEndGameMenu: false,
        currentFrame: 0,
        restartingGame: !this.state.restartingGame,
      }, () => {

      });
    }
  }

  _returnToLevelSelectMenu() {
    this.setState({
      currentSongIndex: -1,
      songElement: null,
      currentSongTime: 0,
      currentSongDuration: 0,
      currentFrame: 0,
      scores: {
        'perfect': 0,
        'good': 0,
        'miss': 0,
      },
      initialFrames: 0,
      registeredFrets: {},
      isLevelSelected: false,
      countdown: 3,
      showCountdown: true,
      songEnded: false,
      finalScore: 0,
      highScoreOwner: '',
      submittingScore: false,
      showEndGameMenu: false,
      restartingGame: !this.state.restartingGame,
    });
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

  _handleNameChange(event) {
    this.setState({
      highScoreOwner: event.target.value,
    });
  }

  _submitScore() {
    if (this.state.submittingScore) {
      return;
    }
    let highScoreOwner = this.state.highScoreOwner;
    if (highScoreOwner.length == 0) {
      highScoreOwner = DEFAULT_NAME;
    }
    const songName = SONGS[this.state.currentSongIndex].songName;
    const score = this.state.finalScore;

    this.setState({
      submittingScore: true,
    },() => {
      this.addScoreToDb(
        songName, // songId
        highScoreOwner, //userName
        score, // score
        (ref) => {
        this.setState({
          submittingScore: false,
          showEndGameMenu: true,
        });
      });
    });
  }

  renderInstructions() {
    let instructionKeys = [];
    Object.keys(KEYNAME_MAP).forEach((key) => {
      instructionKeys.push(
        <div
          className={
            this.state.activeKeys.indexOf(KEYNAME_MAP[key]) !== -1
            ? 'instruction-key instruction-key-' + KEYNAME_MAP[key] + ' active'
            : 'instruction-key'
          }
          key={'instruction-key-' + key}>
          {key}
        </div>
      );
    });
    return instructionKeys;
  }

  render() {
    return (
      <div className="content-container">
        {
          this.state.isLevelSelected
          ? (
            <div className='game-container'>
              {
                this.state.showCountdown
                ? (
                  <div className='transition-screen unselectable'>
                    <div id='transition-screen-countdown' className='transition-screen-countdown'/>
                    <div className='instruction-keys'>
                      {this.renderInstructions()}
                    </div>
                  </div>
                ) : null
              }
              {
                this.state.songEnded
                ? (
                  <div className='end-game-screen-container unselectable'>
                    <div className='end-game-screen'>
                      <div className={
                        this.state.showEndGameMenu
                        ? 'end-game-screen-inner show-menu'
                        : 'end-game-screen-inner'
                      }>
                        <div className='end-game-screen-score'>
                          <div className='song-final-score-label'>
                            SCORE
                          </div>
                          <div className='song-final-score'>
                            {this.state.finalScore}
                          </div>
                          <div className='high-score-name'>
                            <input
                              type='text'
                              value={this.state.highScoreOwner}
                              onChange={this._handleNameChange.bind(this)}
                              className='high-score-name-field'
                              placeholder='Kimi No Na Wa'
                              maxLength='10'/>
                          </div>
                          <div
                            className={
                              this.state.submittingScore
                              ? 'high-score-submit submitting'
                              : 'high-score-submit'
                            }
                            onClick={this._submitScore.bind(this)}>
                            <i className='fa fa-arrow-circle-right' aria-hidden='true'/>
                          </div>
                        </div>
                        <div className='end-game-screen-menu'>
                          <div
                            className='end-game-menu-button'
                            onClick={this._restartGame.bind(this)}>
                            <i className="fa fa-refresh" aria-hidden="true"></i>
                          </div>
                          <div
                            className='end-game-menu-button'
                            onClick={this._returnToLevelSelectMenu.bind(this)}>
                            <i className="fa fa-list-ul" aria-hidden="true"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null
              }
              <div className='now-playing'>
                <div className='now-playing-label'>
                  <div>
                    <i className="fa fa-volume-up" aria-hidden="true"/>
                  </div>
                  <div>
                    {'Now Playing'}
                  </div>
                </div>
                <div className='now-playing-song-label'>
                  <div className='now-playing-song-label-name'>
                    {SONGS[this.state.currentSongIndex].songName}
                  </div>
                  <div className='now-playing-song-label-artist'>
                    {SONGS[this.state.currentSongIndex].songArtist}
                  </div>
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
              {
                this.state.editorMode
                ? (
                  <audio id={'now-playing-song'}>
                    <source src={SONGS[this.state.currentSongIndex].audioFile} type="audio/mpeg"/>
                  </audio>
                ): null
              }
              {
                this.state.editorMode ? (
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
                ) : null
              }
              {
                this.state.editorMode
                ? (
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
                ): null}
              {
                this.state.editorMode
                ? (
                  <div className='frame-count'>
                    {'Frame: ' + this.state.currentFrame}
                  </div>
                ): null
              }
            </div>
          ) : (
            <div className='level-selector-container'>
              <LevelSelector
                songLibrary={SONGS}
                getScores={this.getScoresFromDb.bind(this)}
                playLevel={this._selectLevel.bind(this)}
                levelSelectorShown={!this.state.isLevelSelected}/>
            </div>
          )
        }
      </div>
    );
  }
}

module.exports = App;
