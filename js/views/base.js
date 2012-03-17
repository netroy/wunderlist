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

      return self;
    },

    'render': function() {
      var self = this;
      if(self.model === undefined) return;

      if(self.el instanceof $) {
        self.el.remove();
        delete self.el;
      }

      self.el = $(self.template(self.model.toJSON()));
      return self;
    }

  });

  return BaseModel;

});