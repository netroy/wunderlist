define('helpers/templates', ['libs/jquery', 'libs/underscore', 'helpers/settings'], function($, _, settings, undefined) {

  "use strict";

  var templateCache = {};

  function get(name) {
    var template = templateCache[name];
    if(template !== undefined) {
      return template;
    } else {
      throw new Error('No template named ' + name);
    }
  }

  function init(isLoggedIn, callback) {
    $.getJSON(
      '/templates/' + (isLoggedIn ? 'app': 'login') + '-min.templates', 
      function(templates) {
        for(var name in templates) {
          templateCache[name] = _.template(templates[name]);
        }
        if(typeof callback === 'function'){
          callback();
        }
      }
    );
  }

  return {
    "init": init,
    "get": get
  };

});