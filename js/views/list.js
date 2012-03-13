define('views/list', ['libs/jquery', 'views/base', 'models/list'], function($, BaseView, ListModel) {

  "use strict";

  var ListView = BaseView.extend({

    'el': '#lists',

    'initialize': function() {
      return BaseView.prototype.initialize(this, arguments);
    }

  });

  return ListView;

});