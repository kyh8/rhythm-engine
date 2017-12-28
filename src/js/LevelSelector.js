const React = require('react');
const Level = require('./Level');

const KEYS = {
  LEFT: 37,
  RIGHT: 39,
};
const THROTTLE_TIMER = 500;

export class LevelSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedLevel: 0,
      loadingHighScores: false,
      scrolling: false,
      itemMarkerHovered: -1,
    }
  }

  componentDidMount() {
    this.selectLevel(this.state.selectedLevel);
    document.onkeydown = (e) => {
      if (!this.props.levelSelectorShown) {
        return;
      }
      let key = e.keyCode ? e.keyCode : e.which;
      if (key === KEYS.LEFT || key === KEYS.RIGHT) {
        this.setState({
          scrolling: true,
        });
        if (key === KEYS.LEFT) {
          this.scrollLeft();
        } else if (key === KEYS.RIGHT) {
          this.scrollRight();
        }
      }
    }

    document.onkeyup = (e) => {
      if (!this.props.levelSelectorShown) {
        return;
      }
      let key = e.keyCode ? e.keyCode : e.which;
      if (key === KEYS.LEFT || key === KEYS.RIGHT) {
        setTimeout(() => {
          this.setState({
            scrolling: false,
          });
        }, THROTTLE_TIMER);
      }
    }
  }

  scrollLeft() {
    let newLevel = this.state.selectedLevel - 1;
    this.setState({
      selectedLevel: newLevel >= 0 ? newLevel : 0,
    });
  }

  scrollRight() {
    let newLevel = this.state.selectedLevel + 1;
    this.setState({
      selectedLevel:
        newLevel <= this.props.songLibrary.length - 1
        ? newLevel
        : this.props.songLibrary.length - 1,
    });
  }

  selectLevel(index, fromTracker) {
    this.setState({
      selectedLevel: index,
      scrolling: fromTracker === true,
      loadingHighScores: true,
    }, () => {
      this.renderHighScores();
      if (fromTracker === true) {
        setTimeout(() => {
          this.setState({
            scrolling: false,
          });
        }, THROTTLE_TIMER);
      }
    });
  }

  renderLevelCarousel() {
    let levels = [];
    const selectedIndex = this.state.selectedLevel;
    const startingIndex =
      this.state.selectedLevel - 2 >= 0
      ? this.state.selectedLevel - 2
      : 0;
    const endingIndex =
      this.state.selectedLevel + 2 <= this.props.songLibrary.length - 1
      ? this.state.selectedLevel + 2
      : this.props.songLibrary.length - 1;

    for (let index = -2; index <= this.props.songLibrary.length + 1; index++) {
      let relativePrefix = index < selectedIndex ? 'before' : 'after';
      if (index < 0 || index > this.props.songLibrary.length - 1) {
        let isHidden = Math.abs(index - selectedIndex) > 2 ? ' hidden' : '';
        levels.push(
          <div
            className={
              'empty-carousel-level '
              + relativePrefix + '-' + Math.abs(index - selectedIndex)
              + isHidden
            }
            key={'level-' + index}/>
        );
      } else {
        let song = this.props.songLibrary[index];
        levels.push(
          <Level
            key={'level-' + index}
            level={song}
            levelIndex={index}
            relativePrefix={relativePrefix + '-' + Math.abs(index - selectedIndex)}
            isHidden={index < startingIndex || index > endingIndex}
            isSelected={index === this.state.selectedLevel}
            isScrolling={this.state.scrolling}
            playLevel={this.props.playLevel}
            loadingHighScores={this.state.loadingHighScores}
            highScores={this.state.highScores}>
          </Level>
        );
      }
    }
    return levels;
  }

  renderHighScores() {
    const songName = this.props.songLibrary[this.state.selectedLevel].songName;
    this.props.getScores(songName, 3, (highScores) => {
      this.setState({
        loadingHighScores: false,
      }, () => {
        let index = 0;
        let highScoreElements = [];
        highScores.forEach((user) => {
          let place = index + 1;
          let placeSuffix;
          if (place == 1) {
            placeSuffix = 'ST';
          } else if (place == 2) {
            placeSuffix = 'ND';
          } else if (place == 3) {
            placeSuffix = 'RD';
          }
          highScoreElements.push(
            <div
              className={
                index == 0
                ? 'highest high-score'
                : 'high-score'
              }
              key={'high-score-' + user.data().username + '-' + index}>
              <div className='high-score-place'>
                {place + placeSuffix}
              </div>
              <div className='high-score-value'>
                {user.data().score}
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

  mouseEnterTracker(index) {
    this.setState({
      itemMarkerHovered: index,
    });
  }

  mouseLeaveTracker() {
    this.setState({
      itemMarkerHovered: -1,
    });
  }

  renderTracker() {
    let markers = [];
    for (let i = 0; i < this.props.songLibrary.length; i++) {
      markers.push(
        <div
          className={
            i === this.state.selectedLevel
            ? 'carousel-item-marker selected'
            : 'carousel-item-marker'
          }
          key={'carousel-marker-' + i}
          onMouseEnter={this.mouseEnterTracker.bind(this, i)}
          onMouseLeave={this.mouseLeaveTracker.bind(this)}
          onClick={this.selectLevel.bind(this, i, true)}>
          <div className={
            this.state.itemMarkerHovered === i
            ? 'carousel-item-marker-info shown'
            : 'carousel-item-marker-info'
          }>
            <div>{this.props.songLibrary[i].songName}</div>
            <img src={this.props.songLibrary[i].albumArtwork}/>
            <div className='arrow'/>
          </div>
        </div>
      );
    }
    return markers;
  }

  render() {
    let instructions = (
      <div className='level-selector-carousel-instructions'>
        (Use
        <span className='keyboard-key'>
        <i className="fa fa-long-arrow-left" aria-hidden="true"/>
        </span>
        and
        <span className='keyboard-key'>
        <i className="fa fa-long-arrow-right" aria-hidden="true"/>
        </span>
        to navigate)
      </div>
    );
    return (
      <div className='level-selector'>
        <div className='level-selector-carousel-tracker'>
          {this.renderTracker()}
        </div>
        <div className='level-selector-carousel'>
          {this.renderLevelCarousel()}
        </div>
      </div>
    );
  }
}

module.exports = LevelSelector;
