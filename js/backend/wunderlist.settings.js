/**
 * wunderlist.settings.js
 * Class for handling all the settings
 * @author Christian Reber, Dennis Schneider, Daniel Marschner
 */
wunderlist.settings = (function(window, wunderlist, Titanium, undefined){
  "use strict";

  var os, self,
      shortcutkey = "Ctrl",
      REQUEST_TIMEOUT = 100 * 1000,
      position_saved;

  var isLocalStorageAvailable = 'localStorage' in window;    
  var hasProperty, getString, setString, propertyMap;

  if(isLocalStorageAvailable){
    propertyMap = window.localStorage || {};

    hasProperty = function(property){
      return propertyMap.hasOwnProperty(property);
    };

    getString = function(property, defaultValue){
      return propertyMap[property] || defaultValue;
    };

    setString = function(property, value){
      propertyMap[property] = value.toString();
    };

  } else {
    var Properties = Titanium.App.Properties;

    hasProperty = function(property) {
      return Properties.hasProperty(property);
    };

    getString = function(property, defaultValue){
      return Properties.getString(property, defaultValue);
    };

    setString = function(property, value) {
      Properties.setString(property, value.toString());
    };
  }

  function getInt(property, defaultValue){
    return parseInt(getString(property, defaultValue), 10) || defaultValue;
  }

  function setInt(property, value){
    setString(property, value);
  }


  /**
   * Save Window Size and Position on exit
   * @author Christian Reber
   */
  function saveWindowPosition() {
    var currentWindow = Titanium.UI.getMainWindow();
    if (position_saved === false && currentWindow.isMinimized() === false) {
      setString('maximized',   currentWindow.isMaximized());
      setString('user_height', currentWindow.height);
      setString('user_width',  currentWindow.width);
      setString('user_x',      currentWindow.x);
      setString('user_y',      currentWindow.y);
      position_saved = true;
    }
  }


  /**
   * Save Note Window Size and Position on close
   * @author Daniel Marschner
   */
  function saveNoteWindowPosition(noteWindow) {
    if (noteWindow.isMinimized() === false) {
      setString('note_maximized',   noteWindow.isMaximized());
      setString('note_user_height', noteWindow.height);
      setString('note_user_width',  noteWindow.width);
      setString('note_user_x',      noteWindow.x);
      setString('note_user_y',      noteWindow.y);
    }
  }

  function init() {

    // Populate platform info
    if(Titanium && Titanium.Platform){
      os = Titanium.Platform.name.toLowerCase();
      if(os === 'darwin') {
        shortcutkey = "command";
      }
    } else {
      os = "web";
      if(!!window.navigator.platform.match(/^Mac/)) {
        shortcutkey = "command";
      }
    }
    self.os = os;
    self.shortcutkey = shortcutkey;
  
    // The timeout for sending a request e. g. with AJAX
    self.REQUEST_TIMEOUT = REQUEST_TIMEOUT;  
  
    // Count how often the program has been started
    setInt('runtime', getInt('runtime', 1) + 1);
  
  
    /**
     * Load default App Settings
     * @author Dennis Schneider
     */
    if (hasProperty('first_run') === false) {
      setString('active_theme', 'bgone');
      setString('first_run', 0);
      setString('user_height', 400);
      setString('user_width', 760);
      setString('runtime', 1);
      setString('dateformat', wunderlist.language.code);
      setString('delete_prompt', 1);
      setString('invited', false);
    } else {
      // Load Window Size and Position
      var currentWindow = Titanium.UI.getMainWindow();
    
      if (getString('maximized', 'false') == 'true') {
        currentWindow.maximize();
      } else {
        currentWindow.height = getInt('user_height', 400);
        currentWindow.width  = getInt('user_width',760);
        var user_x = getInt('user_x', 0);
        var user_y = getInt('user_y', 0);
  
        if(user_x !== 0) {
          currentWindow.x = user_x;
        }

        if(user_y !== 0) {
          currentWindow.y = user_y;
        } 
      }
    }
  
    position_saved = false;
  
    Titanium.API.addEventListener(Titanium.CLOSE, saveWindowPosition);
    Titanium.API.addEventListener(Titanium.EXIT,  saveWindowPosition);
  
    // Change the top header color on blur/focus
    /*
    Titanium.API.addEventListener(Titanium.UNFOCUSED, function() {
      $("body").css("border-top", "1px solid #b9b9b9");
    });
    Titanium.API.addEventListener(Titanium.FOCUSED, function() {
      $("body").css("border-top", "1px solid #666");
    });
    */
  }


  
  self = {
    "init": init,
    "hasProperty": hasProperty,
    "getString": getString,
    "setString": setString,
    "getInt": getInt,
    "setInt": setInt,
    "saveWindowPosition": saveWindowPosition,
    "saveNoteWindowPosition": saveNoteWindowPosition
  };

  return self;
})(window, wunderlist, Titanium);