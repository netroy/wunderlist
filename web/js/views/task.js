define('views/task', ['libs/jquery', 'views/base', 'models/task'], function($, BaseView, TaskModel) {

  "use strict";

  var TaskView = BaseView.extend({

    'initialize': function() {
      return BaseView.prototype.initialize(this, arguments);
    }

  });

  return TaskView;

});