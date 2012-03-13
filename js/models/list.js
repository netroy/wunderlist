define('models/list', ['models/base'], function(BaseModel) {

  //"use strict";

  //var
  window.ListModel = BaseModel.extend({

    'initialize': function() {
      return BaseModel.prototype.initialize(this, arguments);
    }

  });

  return ListModel;

});