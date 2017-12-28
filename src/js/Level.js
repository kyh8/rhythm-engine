const React = require('react');

const THROTTLE_TIMER = 0;

export class Level extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (this.props.isSelected) {
      let song = this.props.level.audioFile;
      song.play();
    }
  }

  componentWillUpdate(nextProps, nextState) {
    let song = this.props.level.audioFile;
    if (!nextProps.isScrolling && this.props.isScrolling) {
      if (this.props.isSelected) {
        song.currentTime = 0;
        song.play();
      }
    }
    if (nextProps.isScrolling && !this.props.isScrolling) {
      song.pause();
    }
  }

  render() {
    let className = 'level-album-artwork ' + this.props.relativePrefix;
    if (this.props.isHidden) {
      className += ' hidden';
    }
    let songDifficulty = this.props.level.difficulty;
    let albumArtwork = this.props.level.albumArtwork;
    let songName = this.props.level.songName;
    let songArtist = this.props.level.songArtist;
    let sourceAnime = this.props.level.sourceAnime;
    let isAvailable = this.props.level.isAvailable;

    let footer =
      isAvailable
      ? (
        <div>
          <div className='selected-level-metadata'>
            <div className={'difficulty-tag ' + songDifficulty.toLowerCase()}>
              {songDifficulty.toUpperCase()}
            </div>
          </div>
          <div className='selected-level-high-scores'>
            {
              this.props.loadingHighScores
              ? (
                  <div className='high-scores-loading'>
                    <i className='fa fa-refresh fa-2x fa-fw loading'/>
                  </div>
              ): this.props.highScores
            }
          </div>
        </div>
      )
      : (
        <div className='coming-soon'>COMING SOON</div>
      );

    return (
      <div className={
        this.props.isSelected
        ? 'selected-carousel-index level-carousel-item'
        : 'level-carousel-item'
      }>
        <div className={className}>
          <img src={this.props.level.albumArtwork}/>
          {isAvailable && this.props.isSelected
          ? (
            <div
              className='album-artwork-overlay'
              onClick={this.props.playLevel.bind(this, this.props.levelIndex)}>
              <div className='selected-level-play-button'>
                <i className='fa fa-play-circle' aria-hidden='true'/>
              </div>
            </div>
          ): null}
          <div className='album-artwork-info-overlay'>
            <div className='selected-level-song-info unselectable'>
              <div className='selected-level-song-name'>
                {songName}
              </div>
              <div className='selected-level-song-artist'>
                {songArtist}
              </div>
              <div className={'source-anime'}>
                <span className='source-anime-label'>{'Anime'}</span>
                <span className='source-anime-name'>{sourceAnime}</span>
              </div>
            </div>
          </div>
        </div>
        <div className='level-info-footer'>
          {this.props.isScrolling || !this.props.isSelected ? null : footer}
        </div>
      </div>
    );
  }
}

module.exports = Level;
