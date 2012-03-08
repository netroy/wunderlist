/*global console: false, require:false */
define('frontend/layout',
      ['libs/jquery', 'helpers/settings', 'helpers/language'],
      function($, settings, language, undefined) {

  "use strict";

  var self = {};

  function init() {
    if(settings.getString('logged_in', 'false') !== 'false') {
      require(['frontend/sidebar', 'frontend/filters', 'frontend/background'], function(sidebar, filters, background) {
        sidebar.init();
        filters.init();
        background.init();
        console.log("layout init");
      });
    } else {
      require(['frontend/login']);
    }
    $('body').show();
  }

  self.init = init;
  return self;

});