define('views/base', ['libs/jquery', 'libs/underscore', 'libs/backbone'], function($, _, Backbone, undefined) {

  "use strict";

  var doc = $(document);

  var BaseModel = Backbone.View.extend({

    'initialize': function() {
      var self = this;
      self.el = $(self.el);
      if(typeof self.template === 'string') {
        self.template = _.template(self.template);
      }

      // on language_change event refresh all the view
      doc.on("language_changed", function(e, code) {
        self.render();
      });

      _.bindAll(this, 'render');

      return self;
    },

    'render': function() {
      var self = this, newEl;
      if(self.model === undefined) return;

      if(self.template !== undefined) {
        newEl = $(self.template(self.model.toJSON()));
        if(self.el instanceof $) {
          self.el.replaceWith(newEl).remove();
          delete self.el;
        }
        self.el = newEl;
      }
      
      return self;
    }

  });

  return BaseModel;

});