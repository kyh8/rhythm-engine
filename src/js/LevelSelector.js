const React = require('react');
const Level = require('./Level');

export class LevelSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredLevel: -1,
      selectedLevel: -1,
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
    let songGenre = this.props.songLibrary[this.state.selectedLevel].songGenre;
    let genreString = songGenre == 'Pop' ? ' MUSIC' : ' OPENING'
    return (
      <div className='level-selector-info-panel'>
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
        <div className='selected-level-info'>
          <div className={'difficulty-tag'}>
            {songDifficulty.toUpperCase()}
          </div>
          <div className={'divider'}>
            &middot;
          </div>
          <div className={'genre-tag'}>
            {songGenre.toUpperCase() + genreString}
          </div>
        </div>
        <div className='selected-level-buttons'>
          <div
            className='selected-level-play-button'
            onClick={this.props.selectLevel.bind(this, this.state.selectedLevel)}>
            <i className='fa fa-play-circle' aria-hidden='true'/>
          </div>
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
