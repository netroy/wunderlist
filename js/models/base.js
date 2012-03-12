define('models/base', ['libs/backbone'], function(Backbone) {

  var BaseModel = Backbone.Model.extend({
    // Keep this base class in case we might need to add some common functionality here
  });

  return BaseModel;

});