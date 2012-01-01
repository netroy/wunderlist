/* global wunderlist */
wunderlist.helpers.utils = (function(window, document, wunderlist, undefined){
  "use strict";

  /**
   * Converted from PHP in_array()
   * @author Daniel Marschner
   */
  function in_array(needle, array){
    for (var index = 0, length = array.length; index < length; index++) {
      if (needle.toString() === array[index]) {
        return true;
      }
    }
    return false;
  }


  /**
   * Check if the given value is an array
   * @author Daniel Marschner
   */
  function is_array(value) {
    if (typeof value === 'object' && value && value instanceof Array){
      return true;
    }
    return false;
  }


  /**
   * Set the app title
   * @author Daniel Marschner
   */
  function setTitle(title) {
    document.title = title;
  }


  /**
   * Calculates the difference between the current and the given date
   * returns difference between the two dates as number of days
   * @author Dennis Schneider
   */
  function calculateDayDifference(done) {
    var today         = new Date();
    var one_day       = 86400; // One day in seconds
    var unceiled_days = ((today.getTime() / 1000) - done) / (one_day);

    if (unceiled_days > 1){
      return Math.floor(unceiled_days);
    } else {
      return 0;
    }
  }


  /**
   * Replace the search string with the given string
   * @author Daniel Marschner
   */
  function str_replace(search, replace, subject) {
    return subject.split(search).join(replace);
  }


  /**
   * Validates an integer
   * @author Christian Reber
   */
  function is_integer(s) {
    return (s.toString().search(/^-?[0-9]+$/) === 0);
  }


  /**
   * Validate the email
   * @author Dennis Schneider
   */
  var emailReg = /^([A-Za-z0-9\+_\-\.\+])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  function is_email(email) {
    return emailReg.test(email);
  }


  /**
   * Put the first char of the string into upper case
   * @author Daniel Marschner
   */
  function ucfirst(str) {
     return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Find the next occurance of the day-month combo passed as a date object
   */
  function setToFuture(date) {
    var vDate = new Date();
    if (vDate > date) {
      date.setFullYear(date.getFullYear() + 1);
      return setToFuture(date);
    }
    return date;
  }

  /**
   * Removes HTML tags and escapes single quotes
   * @author Daniel Marschner
   */
  function convertString(string, length) {
    var escape = window.escape;
    string = string.split('<').join(escape('<'));
    string = string.split('>').join(escape('>'));
    string = string.split("'").join(escape("'"));
    
    if (length !== undefined && length > 0){
      string = string.substr(0, length);
    }
    return string;
  }

  return {
    "in_array": in_array,
    "is_array": is_array,
    "setTitle": setTitle,
    "calculateDayDifference": calculateDayDifference,
    "str_replace": str_replace,
    "is_integer": is_integer,
    "is_email": is_email,
    "ucfirst": ucfirst,
    "setToFuture": setToFuture,
    "convertString": convertString
  };

})(window, document, wunderlist);