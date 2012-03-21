define('views/base',
      ['libs/jquery', 'libs/underscore', 'libs/backbone', 'helpers/language'],
      function($, _, Backbone, language, undefined) {

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
      var self = this,
          el = self.el,
          template = self.template,
          model = self.model,
          newEl;
      if(template !== undefined) {
        if(model !== undefined) {
          newEl = $(template(model.toJSON()));
          if(el instanceof $) {
            el.replaceWith(newEl).remove();
            delete self.el;
          }
          self.el = newEl;
        } else {
          self.el = $(template(language.data));
        }
      }
      return self;
    }

  });

  return BaseModel;

});