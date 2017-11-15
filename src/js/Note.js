const React = require('react');

export class Note extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.pastHitNote && !this.props.pastHitNote) {
      this.props.updateScore('miss');
    }
  }

  render() {
    return (
      <div
        className={
          this.props.pastHitNote
          ? 'note-container checked-note missed-note'
          : 'note-container'
        }
        style={{
          top: this.props.fromTop,
        }}>
        <div className='note'/>
      </div>
    );
  }
}

module.exports = Note;
