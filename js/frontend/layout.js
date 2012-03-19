/*global console: false, require:false */
define('frontend/layout',
      ['libs/jquery', 'libs/underscore', 'helpers/settings', 'helpers/language', 'helpers/templates'],
      function($, _, settings, language, templates, undefined) {

  'use strict';

  function loaded() {
    $('body').css({'opacity': '1.0'});
    setTimeout(function(){
      $('#sidebar, #sharing').addClass('slideTransition');
    }, 1000);
  }

  function loadData() {
    require(['models/list', 'views/list', 'models/task', 'views/task'],
      function(ListModel, ListView, TaskModel, TaskView) {

      var listsEl = $('#lists').first().empty();
      _.forEach(window.Lists, function(list) {
        // Don't render deleted lists
        if(list.deleted === '1') {
          return;
        }

        var renderedListEl = new ListView({
          'model': new ListModel(list)
        }).render().el;
        listsEl.append(renderedListEl);
      });

    });
  }

  function render(sidebar, filters, background, sharing, menu) {
    var body = $('body').addClass('logged');
    body.html(templates.get('layout')(language.data));

    background.init();
    menu.init();

    loaded();

    sidebar.init();
    sharing.init();
    /*filters.init();*/

    loadData();
  }

  function init() {
    if(settings.getString('logged_in', 'false') !== 'false') {
      require(['libs-min'], function() {
        require(['app-min'], function() {
          require(
            ['frontend/sidebar', 'frontend/filters', 'frontend/background', 'frontend/sharing', 'frontend/menu'],
            function() {
              var args = arguments;
              templates.init(true, function() {
                render.apply(null, args);
              });
            });
        });
      });
    } else {
      require(['frontend/login'], function(login) {
        var args = arguments;
        templates.init(false, function() {
          loaded();
          login.init();
        });
      });
    }
  }

  return {
    "init": init
  };

});