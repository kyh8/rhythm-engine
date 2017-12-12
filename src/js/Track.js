const Note = require('./Note');
const React = require('react');

const NOTE_HEIGHT = 30;
const NOTE_CONTAINER_MARGIN = 30;
const INITIAL_DELAY = 200;

export class Track extends React.Component {
  constructor(props) {
    super(props);
    this.activeNotes = [];
  }

  componentDidMount() {
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.isActive !== this.props.isActive
      || nextProps.currentFrame !== this.props.currentFrame
      || nextProps.spawnTimes !== undefined && this.props.spawnTimes === undefined
      || nextProps.restartingGame !== this.props.restartingGame
    );
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.isActive === true && this.props.isActive === false) {
      let noteTrack = document.getElementById('note-track-' + this.props.trackID);
      this.props.registerFret(this.props.trackID, this.props.currentFrame);

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
          const currentFrame = this.props.currentFrame;
          let collisionTime = this.activeNotes[0];
          const hitNoteLocation = document.getElementById('hit-note-location-' + this.props.trackID);
          const hitRange = Math.abs(collisionTime - currentFrame);

          if (hitRange <= 10) {
            collisionNote.classList.add('checked-note');
            // we registered an action on the note - remove it.
            if (this.activeNotes.indexOf(collisionTime) !== -1) {
              this.activeNotes.splice(this.activeNotes.indexOf(collisionTime), 1);
            }
            if (hitRange <= 2) {
              this.props.updateScore('perfect');
              pulseColor = 'perfect';
              collisionNote.classList.add('hit-note-perfect');
            } else if (hitRange <= 8) {
              this.props.updateScore('good');
              pulseColor = 'good';
              collisionNote.classList.add('hit-note');
            } else if (hitRange > 8){
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
      if (pulseColor === 'perfect' || pulseColor === 'good' || pulseColor === 'miss') {
        let track = document.getElementById('note-track-' + this.props.trackID);
        let hitType = document.createElement('div');
        hitType.classList.add('hit-note-type', pulseColor);
        hitType.innerText = pulseColor.toUpperCase();
        track.appendChild(hitType);
        hitType.addEventListener('animationend', () => {
          track.removeChild(hitType);
        });
      }

      hitNotePulse.appendChild(pulse);
      pulse.addEventListener('animationend', () => {
        hitNotePulse.removeChild(pulse);
      });
    }

    if (nextProps.restartingGame !== this.props.restartingGame) {
      this.activeNotes = [];
    }
  }

  spawnNotes() {
    const currentFrame = this.props.currentFrame;
    const noteSpawnTimes = this.props.spawnTimes;
    const hitNoteLocation = document.getElementById('hit-note-location-' + this.props.trackID);
    let noteElements = [];
    if (noteSpawnTimes) {
      noteSpawnTimes.forEach((note, index) => {
        if (currentFrame < note.startFrame || currentFrame > note.endFrame) {
          if (this.activeNotes.indexOf(note.hitTime) != -1) {
            // if we've moved outside of the range of the note's existence, remove
            // the note from the active notes array
            this.activeNotes.splice(this.activeNotes.indexOf(note.hitTime), 1);
          }
          return;
        }
        if (this.activeNotes.indexOf(note.hitTime) == -1) {
          this.activeNotes.push(note.hitTime);
        }
        const offsetTop = note.positions[currentFrame] + NOTE_CONTAINER_MARGIN;
        const pastHitNote = currentFrame >= note.endFrame - 10;
        // if we moved past the hit note location, make sure we remove it from our active notes
        if (pastHitNote && this.activeNotes.indexOf(note.hitTime) == -1) {
          this.activeNotes.splice(this.activeNotes.indexOf(note.hitTime), 1);
        }
        const noteElement = (
          <Note
            key={'track-' + this.props.trackID + '-note-' + index}
            noteIndex={index}
            trackID={this.props.trackID}
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
