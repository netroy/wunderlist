define('views/list', ['libs/jquery', 'views/base', 'models/list'], function($, BaseView, ListModel) {

  "use strict";

  var ListView = BaseView.extend({

    'template': '<li<%= (inbox == 1)?" class=\'inbox\'":""%>><label><%=name%></label><span class="taskCount"><%=task_count%></span><a class="share"></a><a class="delete"></a><a class="edit"></a><a class="save"></a></li>',

    'initialize': function() {
      return BaseView.prototype.initialize(this, arguments);
    }

  });

  return ListView;

});