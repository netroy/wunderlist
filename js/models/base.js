define('models/base', ['libs/backbone'], function(Backbone) {

  var BaseModel = Backbone.Model.extend({

    'initialize': function() {
      // Keep this base constructor
      // just in case we might need to add some common functionality across
    }

  });

  return BaseModel;

});