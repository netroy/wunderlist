/* global wunderlist */
wunderlist.utils = (function(wunderlist, html, undefined){

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
  function is_email(email) {
    var reg = /^([A-Za-z0-9\+_\-\.\+])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    if (reg.test(email) === false) {
      $('.error').text(wunderlist.language.data.error_invalid_email);
      return false;
    } else {
      return true;
    }
  }


  /**
   * Put the first char of the string into upper case
   * @author Daniel Marschner
   */
  function ucfirst(str) {
      str += '';
      var f = str.charAt(0).toUpperCase();
      return f + str.substr(1);
  }


  return {
    "in_array": in_array,
    "is_array": is_array,
    "setTitle": setTitle,
    "calculateDayDifference": calculateDayDifference,
    "str_replace": str_replace,
    "is_integer": is_integer,
    "is_email": is_email,
    "ucfirst": ucfirst
  };

})(wunderlist, html);