define('views/list',
      ['libs/jquery', 'views/base', 'models/list', 'helpers/language', 'helpers/templates'],
      function($, BaseView, ListModel, language, templates, undefined) {

  "use strict";

  var BaseViewPrototype = BaseView.prototype;
  var template = templates.get('list');
  var ListView = BaseView.extend({
    'template': template,

    'render': function() {
      var self = this,
          model = self.model,
          name = self.model.get('name'),
          label = language.data[name.toLowerCase()] || name;
      self.model.set('label', label);
      return BaseViewPrototype.render.apply(self, arguments);
    }

  });

  return ListView;

});