/**
 * wunderlist.wunderlist.timer.js
 * Class for handling date and time functionality
 * @author Christian Reber, Dennis Schneider, Daniel Marschner, Sebastian Kreutzberger
 */

wunderlist.timer = (function(window, $, wunderlist, Titanium, undefined){

  "use strict";

  var isPaused, auto_update_seconds, auto_update_interval, self, 
      interval, former_date, daychange_interval, total_seconds;


  /**
   * Returns the current date in the format YYYYMMDD
   * @author Sebastian Kreutzberger
   */
  function getCurrentDate() {
    var now = new Date();
    var ymd = now.getFullYear()+""+now.getMonth()+""+now.getDay();
    return ymd;
  }


  /**
   * Sets the timer with given seconds
   * @author Dennis Schneider
   */
  function set(seconds) {
    if(typeof seconds === 'undefined') {
      total_seconds = 15;
    }
    total_seconds = parseInt(seconds, 10);
    return self;
  }


  /**
   * Starts the timer countdown
   * @author Dennis Schneider
   */
  function start() {
    interval = window.setInterval(function() {
      if(isPaused === false) {
        total_seconds--;
        if(total_seconds === 0) {
          if(wunderlist.account.isLoggedIn() && Titanium.Network.online === true) {
            $('#sync').click();
          }
          window.clearInterval(wunderlist.timer.interval);
        }
      }
    }, 1000);
    return self;
  }


  /**
   * Stops the timer
   * @author Dennis Schneider
   */
  function stop() {
    window.clearInterval(interval);
    return self;
  }


  /**
   * Pauses both timers
   * @author Dennis Schneider
   */
  function pause() {
    isPaused = true;
    return self;
  }


  /**
   * Resumes both timers
   * @author Dennis Schneider
   */
  function resume() {
    isPaused = false;
    return self;
  }


  /**
   * Return the timezone offset of the current user; is needed for login and register (Stats)
   * @author Daniel Marschner
   */
  function getTimezoneOffset() {
    return (new Date().getTimezoneOffset() / 60) * (-1);
  }


  /**
   * Starts the auto update
   * @author Dennis Schneider
   */
  function init() {
    isPaused = false;
    auto_update_seconds = 60 * 15;
    auto_update_interval = window.setInterval(function() {
      if(isPaused === false) {
        auto_update_seconds--;
        if(auto_update_seconds === 0) {
          if(wunderlist.account.isLoggedIn() && Titanium.Network.online === true){
            $('#sync').click();
          }
          window.clearInterval(auto_update_interval);
          init();
        }
      }
    }, 1000);

    // check every 10 seconds if day changed (overnight)
    former_date = 0; //init
    daychange_interval = window.setInterval(function() {
      var current_date = getCurrentDate();
      if(former_date !== current_date && former_date !== 0 && typeof former_date !== 'undefined') {
        wunderlist.account.loadInterface();
      }
      former_date = current_date;
    }, 10000);
  }

  self = {
    "init": init,
    "set": set,
    "start": start,
    "stop": stop,
    "pause": pause,
    "resume": resume,
    "getTimezoneOffset": getTimezoneOffset
  };
  
  return self;

})(window, jQuery, wunderlist, Titanium);
