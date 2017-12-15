const React = require('react');
const Level = require('./Level');

export class LevelSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredLevel: -1,
      selectedLevel: -1,
      loadingHighScores: false,
    }
  }

  mouseEnterLevel(index) {
    this.setState({
      hoveredLevel: index,
    });
  }

  mouseExitLevel() {
    this.setState({
      hoveredLevel: -1,
    });
  }

  selectLevel(index) {
    this.setState({
      selectedLevel: index,
      loadingHighScores: true,
    }, () => {
      this.renderHighScores();
    });
  }

  renderLevels() {
    let levels = [];
    this.props.songLibrary.forEach((song, index) => {
      levels.push(
        <Level
          key={'level-' + index}
          level={song}
          levelIndex={index}
          onMouseEnter={this.mouseEnterLevel.bind(this, index)}
          onMouseLeave={this.mouseExitLevel.bind(this)}
          selectLevel={this.selectLevel.bind(this, index)}
          isHovered={this.state.hoveredLevel == index}
          isSelected={this.state.selectedLevel == index}/>
      );
    });
    return levels;
  }

  renderHighScores() {
    const songName = this.props.songLibrary[this.state.selectedLevel].songName;
    this.props.getScores(songName, 10, (highScores) => {
      this.setState({
        loadingHighScores: false,
      }, () => {
        let index = 0;
        let highScoreElements = [];
        highScores.forEach((user) => {
          highScoreElements.push(
            <div
              className={
                index == 0
                ? 'highest high-score top-' + index
                : 'high-score top-' + index
              }
              key={'high-score-' + user.data().username + '-' + index}>
              <div className='high-score-value'>
                {(index + 1) + '. ' + user.data().score}
              </div>
              <div className='high-score-owner'>
                {user.data().username}
              </div>
            </div>
          );
          index++;
        });
        this.setState({
          highScores:
            index == 0
            ? (
              <div className='empty-high-scores'>
                NO HIGH SCORES YET
              </div>
            ): highScoreElements,
        });
      });
    });
  }

  renderSelectedLevel() {
    if (this.state.selectedLevel == -1) {
      return (
        <div className='empty-level-selector-info-panel'>
          <div className='unselected-level-text'>
            Select A Level
          </div>
        </div>
      );
    }
    let songDifficulty = this.props.songLibrary[this.state.selectedLevel].difficulty;
    let albumArtwork = this.props.songLibrary[this.state.selectedLevel].albumArtwork;
    let songName = this.props.songLibrary[this.state.selectedLevel].songName;
    let songArtist = this.props.songLibrary[this.state.selectedLevel].songArtist;
    let sourceAnime = this.props.songLibrary[this.state.selectedLevel].sourceAnime;
    let isAvailable = this.props.songLibrary[this.state.selectedLevel].isAvailable;
    return (
      <div className='level-selector-info-panel'>
        <div className='selected-level-info-container'>
          <div className='selected-level-info'>
            <div className='selected-level-album-artwork'>
              <img src={albumArtwork}/>
            </div>
            <div className='selected-level-song-info unselectable'>
              <div className='selected-level-song-name'>
                {songName}
              </div>
              <div className='selected-level-song-artist'>
                {songArtist}
              </div>
            </div>
            <div className='selected-level-metadata'>
              <div className={'difficulty-tag'}>
                {songDifficulty.toUpperCase()}
              </div>
              <div className={'divider'}>
                &middot;
              </div>
              <div className={'source-anime'}>
                {sourceAnime}
              </div>
            </div>
            {
              isAvailable
              ? (
                <div className='selected-level-buttons'>
                  <div
                    className='selected-level-play-button'
                    onClick={this.props.selectLevel.bind(this, this.state.selectedLevel)}>
                    <i className='fa fa-play-circle' aria-hidden='true'/>
                  </div>
                </div>
              ): (
                <div className='coming-soon'>COMING SOON</div>
              )
            }
          </div>
          {
            isAvailable
            ? (
              <div className='selected-level-high-scores'>
                <div className='selected-level-high-scores-label'>
                  {'HIGH SCORES'}
                </div>
                {
                  this.state.loadingHighScores
                  ? (
                      <div className='high-scores-loading'>
                        <i className='fa fa-refresh fa-2x fa-fw loading'/>
                      </div>
                  ): this.state.highScores
                }
              </div>
            ): null
          }
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className='level-selector-panels'>
        <div className='level-selector'>
          {this.renderLevels()}
        </div>
        {this.renderSelectedLevel()}
      </div>
    );
  }
}

module.exports = LevelSelector;
