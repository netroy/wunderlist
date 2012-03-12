/*global console: false, require:false */
define('frontend/layout',
      ['libs/jquery', 'libs/underscore', 'helpers/settings', 'helpers/language'],
      function($, _, settings, language, undefined) {

  'use strict';

  var self = {};

  function loaded() {
    $('body').css({'opacity': '1.0'});
  }

  function init() {
    if(settings.getString('logged_in', 'false') !== 'false') {
      require(
        ['frontend/sidebar', 'frontend/filters', 'frontend/background'],
        function(sidebar, filters, background) {

        var body = $('body');
        body.addClass('logged');

        $.get('templates/layout.tmpl', function(response) {
          body.html(_.template(response, language.data));
        });

        sidebar.init();
        filters.init();
        background.init();
        console.log('layout init');
        loaded();
      });
    } else {
      require(['frontend/login'], loaded);
    }
  }

  self.init = init;
  return self;

});