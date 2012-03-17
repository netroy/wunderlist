define('models/list', ['models/base'], function(BaseModel) {

  "use strict";

  var ListModel = BaseModel.extend({
    
    'defaults': {
      'online_id': 0,
      'position': 0,
      'deleted': 0,
      'shared': 0,
      'task_count': 0,
      'inbox': 0
    },

    'initialize': function() {
      return BaseModel.prototype.initialize(this, arguments);
    }

  });

  return ListModel;

});