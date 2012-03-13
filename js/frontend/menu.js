/*global define:false */
define('frontend/menu', ['libs/jquery'], function($, undefined) {

  "use strict";

  function openURL(url) {
    return function() {
      window.open(url);
    };
  }

  function init() {
    var menu = $('#bottomBar ul.menu');
  }

  return {
    "init": init
  };

});