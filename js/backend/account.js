define('backend/account', ['helpers/settings'], function(settings, undefined) {

  "use strict";

  var loggedIn = false;

  function isLoggedIn() {
    loggedIn = (settings.getString('logged_in', 'false') === 'true');
    return loggedIn;
  }


  return {
    "isLoggedIn": isLoggedIn
  };

});