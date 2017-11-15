const Note = require('./Note');
const React = require('react');

const NOTE_HEIGHT = 30;

export class Track extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.isActive !== this.props.isActive || nextProps.currentFrame !== this.props.currentFrame;
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.isActive === true && this.props.isActive === false) {
      let noteTrack = document.getElementById('note-track-' + this.props.trackID);

      let pulseColor = 'none';
      let notes = Array.from(noteTrack.childNodes);
      if (notes) {
        notes = notes.filter((note) => {
          return note.classList.contains('note-container') && !note.classList.contains('checked-note');
        });
        // note to check collision on should be first one added to this list
        // in other words, the note closest to the bottom
        if (notes.length > 0) {
          let collisionNote = notes[0];
          const hitNoteLocation = document.getElementById('hit-note-location-' + this.props.trackID);
          const locationBounds = hitNoteLocation.getBoundingClientRect();
          const noteContainerBounds = collisionNote.getBoundingClientRect();
          const noteBounds = collisionNote.childNodes[0].getBoundingClientRect();
          if (
            noteContainerBounds.top <= locationBounds.top && noteContainerBounds.bottom >= locationBounds.bottom
            || noteContainerBounds.top >= locationBounds.top && noteContainerBounds.bottom >= locationBounds.bottom && noteContainerBounds.top < locationBounds.bottom
            || noteContainerBounds.top <= locationBounds.top && noteContainerBounds.bottom <= locationBounds.bottom && noteContainerBounds.bottom > locationBounds.top
          ) {
            collisionNote.classList.add('checked-note');
            if (noteBounds.top >= locationBounds.top && noteBounds.bottom <= locationBounds.bottom) {
              // console.log('hit note perfect', this.props.trackID);
              this.props.updateScore('perfect');
              pulseColor = 'perfect';
              collisionNote.classList.add('hit-note-perfect');
            } else if (
              noteBounds.top <= locationBounds.top && noteBounds.bottom <= locationBounds.bottom && noteBounds.bottom > locationBounds.top
              || noteBounds.top >= locationBounds.top && noteBounds.bottom >= locationBounds.bottom && noteBounds.top < locationBounds.bottom
            ) {
              // console.log('hit note', this.props.trackID);
              this.props.updateScore('good');
              pulseColor = 'good';
              collisionNote.classList.add('hit-note');
            } else {
              // console.log('missed note', this.props.trackID);
              this.props.updateScore('miss');
              pulseColor = 'miss';
              collisionNote.classList.add('missed-note');
            }
          }
        }
      }

      let hitNotePulse = document.getElementById(
        'hit-note-location-pulse-' + this.props.trackID
      );

      let pulse = document.createElement('div');
      pulse.classList.add('hit-note-location-pulse', pulseColor);
      hitNotePulse.appendChild(pulse);
      pulse.addEventListener('animationend', () => {
        hitNotePulse.removeChild(pulse);
      });
    }
  }

  spawnNotes() {
    const currentFrame = this.props.currentFrame;
    const noteSpawnTimes = this.props.spawnTimes;
    const hitNoteLocation = document.getElementById('hit-note-location-' + this.props.trackID);
    // console.log(this.props.trackID, this.props.spawnTimes, this.props.currentFrame);
    let noteElements = [];
    if (noteSpawnTimes) {
      noteSpawnTimes.forEach((note, index) => {
        if (currentFrame < note.startFrame || currentFrame > note.endFrame) {
          return;
        }
        const offsetTop = note.positions[currentFrame] + 30;
        const pastHitNote = offsetTop > hitNoteLocation.offsetTop + NOTE_HEIGHT;
        const noteElement = (
          <Note
            key={'track-' + this.props.trackID + '-note-' + index}
            pastHitNote={pastHitNote}
            fromTop={note.positions[currentFrame]}
            updateScore={this.props.updateScore}/>
        );
        noteElements.push(noteElement);
      });
    }
    return noteElements;
  }

  render() {
    return (
      <div id={'note-track-' + this.props.trackID} className={'note-track track-' + this.props.trackID}>
        {this.spawnNotes()}
        <div id={'hit-note-location-' + this.props.trackID} className={
          this.props.isActive ? 'active-key hit-note-location' : 'hit-note-location'
        }>
          <div id={'hit-note-location-pulse-' + this.props.trackID}/>
        </div>
      </div>
    );
  }
}

module.exports = Track;
