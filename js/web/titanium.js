(function($, window, navigator, wunderlist, undefined){
  "use strict";


  if(typeof Titanium !== 'undefined'){
    return;
  }

  var Titanium = {};
  var App = Titanium.App = {};
  var Properties = App.Properties = {};
  var UI = Titanium.UI = {};
  var API = Titanium.API = {};
  var JSON = Titanium.JSON = {};
  var Codec = Titanium.Codec = {};
  var Network = Titanium.Network = {};
  var Desktop = Titanium.Desktop = {};
  



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
  App.version = "0.0.1";



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
  Network.online = window.navigator.onLine;
  $(window).bind("offline",function(e){
    Network.online = false;
  }).bind("online",function(e){
    Network.online = true;
  });


  /**
   * Desktop Utils
   */
  Desktop.openURL = function(url){
    window.open(url);
  };

  // Re-assign the variable to the global scope
  window.Titanium = Titanium;
})(jQuery, window, window.navigator, wunderlist);