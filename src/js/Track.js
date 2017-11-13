const React = require('react');

export class Track extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    this.spawnNotes();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.isActive === true && this.props.isActive === false) {
      let noteTrack = document.getElementById('note-track-' + this.props.trackID);
      let notes = Array.from(noteTrack.childNodes);
      if (notes) {
        notes = notes.filter((note) => {
          return note.classList.contains('note-container') && !note.classList.contains('checked-note');
        });
        // note to check collision on should be first one added to this list
        // in other words, the note closest to the bottom
        if (notes.length > 0) {
          const collisionNote = notes[0];

          const hitNoteLocation = document.getElementById('hit-note-location-' + this.props.trackID);
          const locationBounds = hitNoteLocation.getBoundingClientRect();
          const noteContainerBounds = collisionNote.getBoundingClientRect();
          const noteBounds = collisionNote.childNodes[0].getBoundingClientRect();
          if (
            noteContainerBounds.top < locationBounds.top && noteContainerBounds.bottom > locationBounds.bottom
            || noteContainerBounds.top > locationBounds.top && noteContainerBounds.bottom > locationBounds.bottom && noteContainerBounds.top < locationBounds.bottom
            || noteContainerBounds.top < locationBounds.top && noteContainerBounds.bottom < locationBounds.bottom && noteContainerBounds.bottom > locationBounds.top
          ) {
            collisionNote.classList.add('checked-note');
            if (noteBounds.top > locationBounds.top && noteBounds.bottom < locationBounds.bottom) {
              console.log('hit note perfect', this.props.trackID);
              this.props.updateScore('perfect');
              collisionNote.classList.add('hit-note-perfect');
            } else if (
              noteBounds.top < locationBounds.top && noteBounds.bottom < locationBounds.bottom && noteBounds.bottom > locationBounds.top
              || noteBounds.top > locationBounds.top && noteBounds.bottom > locationBounds.bottom && noteBounds.top < locationBounds.bottom
            ) {
              console.log('hit note', this.props.trackID);
              this.props.updateScore('good');
              collisionNote.classList.add('hit-note');
            } else {
              console.log('missed note', this.props.trackID);
              this.props.updateScore('miss');
              collisionNote.classList.add('missed-note');
            }
          }
        }
      }
    }
  }

  spawnNotes() {
    const currentFrame = this.props.currentFrame;
    const noteSpawnTimes = this.props.spawnTimes;
    if (noteSpawnTimes && noteSpawnTimes.indexOf(currentFrame) !== -1) {
      let noteTrack = document.getElementById(
        'note-track-' + this.props.trackID
      );
      let noteContainer = document.createElement('div');
      noteContainer.classList.add('note-container');
      let note = document.createElement('div');
      note.classList.add('note');
      noteContainer.appendChild(note);
      noteContainer.addEventListener('animationend', (e) => {
        // console.log('note animation end', this.props.trackID);
        if (!noteContainer.classList.contains('checked-note')) {
          this.props.updateScore('miss');
        }
        noteTrack.removeChild(noteContainer);
      });
      noteTrack.appendChild(noteContainer);
    }
  }

  render() {
    return (
      <div id={'note-track-' + this.props.trackID} className={'note-track track-' + this.props.trackID}>
        <div id={'hit-note-location-' + this.props.trackID} className={
          this.props.isActive ? 'active-key hit-note-location' : 'hit-note-location'
        }/>
      </div>
    );
  }
}

module.exports = Track;
