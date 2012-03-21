define('models/task', ['models/base'], function(BaseModel) {

  "use strict";

  var TaskModel = BaseModel.extend({

    'initialize': function() {
      return BaseModel.prototype.initialize(this, arguments);
    }

  });

  return TaskModel;

});