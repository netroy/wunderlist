/*global console: false*/
define('frontend/background', ['libs/jquery'], function($, undefined) {
  "use strict";

  var self = {};

  function init() {
    console.log("background init");
  }

  self.init = init;

  return self;

});