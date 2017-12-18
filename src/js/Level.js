const React = require('react');

const THROTTLE_TIMER = 0;

export class Level extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      queuedToPlay: false,
    };
  }

  componentWillUpdate(nextProps, nextState) {
    let song = this.props.audioFile;
    if (nextProps.isSelected && !this.props.isSelected) {
      this.setState({
        queuedToPlay: true,
      });
      setTimeout(() => {
        if (!this.state.queuedToPlay) {
          return;
        }
        song.currentTime = 0;
        song.play();
      }, THROTTLE_TIMER);
    } else if (!nextProps.isSelected && this.props.isSelected) {
      this.setState({
        queuedToPlay: false,
      });
      song.pause();
    }
  }

  render() {
    let className = 'level';
    if (this.props.isHovered) {
      className += ' hovered';
    }
    if (this.props.isSelected) {
      className += ' selected';
    }
    return (
      <div className={className}
      onMouseEnter={this.props.onMouseEnter}
      onMouseLeave={this.props.onMouseLeave}
      onClick={this.props.selectLevel}>
        <div className='level-album-artwork'>
          <img src={this.props.level.albumArtwork}/>
        </div>
        <div className='level-info'>
          <div className='level-song-name'>
            {this.props.level.songName}
          </div>
          <div className='level-song-artist'>
            {this.props.level.songArtist.toUpperCase()}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Level;
