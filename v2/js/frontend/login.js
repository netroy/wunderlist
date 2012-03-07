define('frontend/login',
      ['libs/jquery', 'libs/underscore', 'helpers/language'],
      function($, _, language, undefined) {

  "use strict";

  var body = $('body');
  body.addClass('login');
  $.get('templates/login.tmpl', function(response) {
    body.append(_.template(response, language.data));
  });

});