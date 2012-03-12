define('views/base', ['libs/jquery', 'libs/underscore', 'libs/backbone'], function($, _, Backbone) {

  "use strict";

  var doc = $(document);

  var BaseModel = Backbone.View.extend({

    'initialize': function() {
      var self = this;
      self.el = $(self.el);
      self.template = _.template(self.template || "");

      // on language_change event refresh all the view
      doc.on("language_changed", function(e, code) {
        self.render();
      });

      _.bindAll(this, 'render');
    },

    'render': function() {
      var self = this;
      self.el.html(self.template(self.model.toJSON()));
      return self;
    }

  });

  return BaseModel;

});