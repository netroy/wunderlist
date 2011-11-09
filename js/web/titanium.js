(function($, window, navigator, wunderlist, undefined){
  "use strict";


  if(typeof Titanium !== 'undefined'){
    return;
  }

  var Titanium = {};
  var App = Titanium.App = {};
  var Properties = App.Properties = {};
  var Platform = Titanium.Platform = {};
  var UI = Titanium.UI = {};
  var API = Titanium.API = {};
  var Filesystem = Titanium.Filesystem = {};
  var JSON = Titanium.JSON = {};
  var Notification = Titanium.Notification = {};
  var Codec = Titanium.Codec = {};
  var Network = Titanium.Network = {};
  



  /**
   * Localization stuff
   */
  var propertyMap = window.localStorage || {};//
  Properties.getInt= function(property, defaultValue){
    return parseInt(propertyMap[property], 10) || defaultValue;
  };

  Properties.setInt= function(property, value){
    propertyMap[property] = value;
  };

  Properties.getString = function(property, defaultValue){
    return propertyMap[property] || defaultValue;
  };

  Properties.setString = function(property, value){
    propertyMap[property] = value.toString();
  };

  Properties.hasProperty = function(property){
    return propertyMap.hasOwnProperty(property);
  };




  /**
   * Platform Info
   */
  Platform.name = navigator.platform;
  App.version = "0.0.1";




  /**
   * FileSystem APIs (should mock via browser DBs or XHR)
   */

  Filesystem.getResourcesDirectory = function(){
    // over HTTP there is no base resource directory
    return "";
  };

  Filesystem.getFile = function(dir, filename){
    var data;
    var file = {
      read: function(){
        return data;
      }
    };
    $.ajax({
      url: dir + "/" + filename,
      success: function(response){
        data = response;
      },
      dataType: 'text',
      async:   false
    });
    return file;
  };




  /**
   * APIs
   */
  API.addEventListener = function(eventType, handler){
    
  };




  /**
   * UI
   */
  UI.createWindow = function() {
    
  };

  UI.getCurrentWindow = function() {
    return window;
  };

  UI.getMainWindow = function() {
    return window;
  };


  /**
   * Menus
   */
  UI.createMenu = function() {
    wunderlist.menu.createMenu();
  };

  UI.setMenu = function(menu) {
    wunderlist.menu.setMenu(menu);
  };

  UI.setBadge = function() {
    wunderlist.menu.setBadge();
  };





  /**
   * Notifications
   */
  function NotificationWindow(){
    
  }
  NotificationWindow.prototype = {
    setTitle: function(title){
      this.title = title;
    },
    setMessage: function(message){
      this.message = message;
    },
    show: function(){
      
    }
  };
  Notification.createNotification = function(){
    return new NotificationWindow();
  };




  /**
   * Crypto Codecs
   */
  Codec.MD5 = "md5";
  Codec.digestToHex = function(codec, string){
    if(codec === Codec.MD5){
      return window.md5(string);
    } else {
      throw new Error("invalid codec supplied, only MD5 currently supported");
    }
  };




  /**
   * JSON utils
   */
  JSON.parse = function(){
    return window.JSON.parse.apply(window.JSON, arguments);
  };




  /**
   * Network utils
   */
  Network.online = false;//DEBUG: window.navigator.onLine;
  $(window).bind("offline",function(e){
    Network.online = false;
  }).bind("online",function(e){
    Network.online = true;
  });



  // Re-assign the variable to the global scope
  window.Titanium = Titanium;
})(jQuery, window, window.navigator, wunderlist);