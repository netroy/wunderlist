/*global Titanium:false, window:false */
define('helpers/settings', ['helpers/titanium'], function(Titanium, undefined) {

  'use strict';

  var hasProperty, getString, setString, propertyMap,
      saveWindowPosition, saveNoteWindowPosition,
      ajaxTimeout = 10 * 1000; // 10s timeout


  // If localStorage is not available & Titanium is then use Titanium
  if(!('localStorage' in window) && undefined !== Titanium) {

    var Properties = Titanium.App.Properties;

    hasProperty = function (property) {
      return Properties.hasProperty(property);
    };

    getString = function(property, defaultValue){
      return Properties.getString(property, defaultValue);
    };

    setString = function(property, value) {
      Properties.setString(property, value.toString());
    };

  } else {
    // Otherwise use localStrorage if available, else use a simple JS object

    propertyMap = window.localStorage || {};

    hasProperty = function(property) {
      return propertyMap.hasOwnProperty(property);
    };

    getString = function(property, defaultValue) {
      return propertyMap[property] || defaultValue;
    };

    setString = function(property, value) {
      propertyMap[property] = value.toString();
    };

  }

  function getInt(property, defaultValue) {
    var val = parseInt(getString(property, defaultValue), 10);
    return  isNaN(val) ? defaultValue : val;
  }

  function setInt(property, value) {
    setString(property, value);
  }




  // For Titanium persist position & size of various windows
  if(undefined !== Titanium) {

    // Save Window Size and Position on exit
    saveWindowPosition = function() {
      var currentWindow = Titanium.UI.getMainWindow();
      if (currentWindow.isMinimized() === false) {
        setString('maximized',   currentWindow.isMaximized());
        setString('user_height', currentWindow.height);
        setString('user_width',  currentWindow.width);
        setString('user_x',      currentWindow.x);
        setString('user_y',      currentWindow.y);
      }
    };

    Titanium.API.addEventListener(Titanium.CLOSE, saveWindowPosition);
    Titanium.API.addEventListener(Titanium.EXIT,  saveWindowPosition);


    // Save Note Window Size and Position on close
    saveNoteWindowPosition = function(noteWindow) {
      if (noteWindow.isMinimized() === false) {
        setString('note_maximized',   noteWindow.isMaximized());
        setString('note_user_height', noteWindow.height);
        setString('note_user_width',  noteWindow.width);
        setString('note_user_x',      noteWindow.x);
        setString('note_user_y',      noteWindow.y);
      }
    };

  }



  // Populate platform info & fix the shortcut key accordingly
  // TODO: add icon before 'command'
  var OS, shortcutKey = 'Ctrl';
  if(undefined !== Titanium && !!Titanium.Platform) {
    OS = Titanium.Platform.name.toLowerCase();
    if(OS === 'darwin') {
      shortcutKey = 'Command';
    }
  } else {
    OS = 'web';
    if(!!window.navigator.platform.match(/^Mac/)) {
      shortcutKey = 'Command';
    }
  }



  // Load defaults for first run
  // TODO: move these to approriate modules
  if(hasProperty('initialized')) {
    // Default background
    setString('theme', 'one');

    // Count how often the program has been started
    setInt('runtime', getInt('runtime', 1) + 1);

    // Set to initialized
    setString('initialized', 'true');

    setString('date_format', 'en');
    setString('delete_prompt', 1);

    // On titanium load default window size
    if(undefined !== Titanium) {
      setString('user_height', 400);
      setString('user_width', 760);
    }

  }


  return {
    'OS': OS,
    'shortcutKey': shortcutKey,
    'ajaxTimeout': ajaxTimeout,
    'hasProperty': hasProperty,
    'getString': getString,
    'setString': setString,
    'getInt': getInt,
    'setInt': setInt,
    'saveWindowPosition': saveWindowPosition,
    'saveNoteWindowPosition': saveNoteWindowPosition
  };

});