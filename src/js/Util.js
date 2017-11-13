const React = require('react');

export class Util {
  static getDisplayTime(seconds) {
    let displayTime = '';
    let minutes = Math.floor(seconds / 60);
    let displaySeconds = '';
    let hasMinutes = false;
    if (minutes === 0) { // less than a minute
      displayTime += '00:';
    } else {
      hasMinutes = true;
      if (minutes < 10) {
        displayTime += '0' + minutes + ':';
      } else {
        displayTime += minutes + ':';
      }
    }

    if (seconds % 60 < 10) {
      displaySeconds = hasMinutes ? '0' + seconds % 60 : '0' + seconds;
    } else {
      displaySeconds = hasMinutes ? seconds % 60: seconds;
    }

    displayTime += displaySeconds;
    return displayTime;
  }
}

module.exports = Util;
