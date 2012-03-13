/*global console: false*/
define('frontend/sharing', ['libs/jquery', 'helpers/settings'], function($, settings, undefined) {

  "use strict";

  function init() {
    $('#sharing').addClass('slideTransition');
  }

  return  {
    "init": init
  };

});