define('models/base', ['libs/backbone', 'libs/jquery'], function(Backbone, $) {

  var BaseModel = Backbone.Model.extend({
    // on language_change event refresh all the view
  });

  return BaseModel;

});