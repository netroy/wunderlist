define('frontend/login',
      ['libs/jquery', 'libs/underscore', 'helpers/language', 'helpers/templates'],
      function($, _, language, templates, undefined) {

  "use strict";

  function init() {
    var body = $('body').addClass('login');
    body.append(templates.get('login')(language.data));
  }

  return {
    "init": init
  };

});