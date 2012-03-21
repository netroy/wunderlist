/*global console: false*/
define('frontend/bottombar',
      ['libs/jquery', 'views/base', 'helpers/templates'],
      function($, BaseView, templates, undefined) {

  "use strict";

  function init() {
    var sharingView = new BaseView();
    sharingView.template = templates.get('bottombar');
    $('#layout').append(sharingView.render().el);
  }

  return  {
    "init": init
  };

});