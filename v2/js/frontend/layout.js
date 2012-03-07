/*global console: false, require:false */
define('frontend/layout',
      ['libs/jquery', 'helpers/settings', 'helpers/language'],
      function($, settings, language, undefined) {

  "use strict";

  var self = {};

  function init() {
    require(['frontend/sidebar', 'frontend/filters', 'frontend/background'], function(sidebar, filters, background) {
      sidebar.init();
      filters.init();
      background.init();
      console.log("layout init");
    });
  }

  self.init = init;
  return self;

});