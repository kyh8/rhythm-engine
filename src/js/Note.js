const React = require('react');

export class Note extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.pastHitNote && !this.props.pastHitNote) {
      let note = document.getElementById('note-' + this.props.trackID + '-' + this.props.noteIndex);
      if (!note.classList.contains('checked-note')) {
        this.props.updateScore('miss');
        note.classList.add('checked-note');
      }
    }
  }

  render() {
    return (
      <div
        id={'note-' + this.props.trackID + '-' + this.props.noteIndex}
        className={'note-container'}
        style={{
          top: this.props.fromTop,
        }}>
        <div className='note'/>
      </div>
    );
  }
}

module.exports = Note;
