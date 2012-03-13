/*global console: false, require:false */
define('frontend/layout',
      ['libs/jquery', 'libs/underscore', 'helpers/settings', 'helpers/language'],
      function($, _, settings, language, undefined) {

  'use strict';

  function loaded() {
    $('body').css({'opacity': '1.0'});
  }

  function loadData() {
    require(['models/list', 'views/list', 'models/task', 'views/task'],
      function(ListModel, ListView, TaskModel, TaskView) {

      var listModel = new ListModel();
      var listView = new ListView({
        'model': listModel
      });

    });
  }

  function init() {
    if(settings.getString('logged_in', 'false') !== 'false') {
      require(
        ['frontend/sidebar', 'frontend/filters', 'frontend/background', 'frontend/sharing', 'frontend/menu'],
        function(sidebar, filters, background, sharing, menu) {

        var body = $('body');
        body.addClass('logged');

        $.get('templates/layout.tmpl', function(response) {
          body.html(_.template(response, language.data));

          background.init();
          menu.init();

          loaded();

          sidebar.init();
          sharing.init();
          /*filters.init();
          console.log('layout init');*/

          loadData();
        });

      });
    } else {
      require(['frontend/login'], loaded);
    }
  }

  return {
    "init": init
  };

});