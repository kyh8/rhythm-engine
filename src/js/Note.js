const React = require('react');

export class Note extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.pastHitNote && !this.props.pastHitNote) {
      let note = document.getElementById('note-' + this.props.trackID + '-' + this.props.noteIndex);
      if (!note.classList.contains('checked-note')) {
        note.classList.add('checked-note', 'missed-note');
        this.props.updateScore('miss');
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
