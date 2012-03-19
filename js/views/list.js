define('views/list',
      ['libs/jquery', 'views/base', 'models/list', 'helpers/language'],
      function($, BaseView, ListModel, language, undefined) {

  "use strict";

  var BaseViewPrototype = BaseView.prototype;
  var ListView = BaseView.extend({

    'template': '<li<%= (inbox == 1)?" class=\'inbox\'":""%>><label><%=label%></label><span class="taskCount"><%=task_count%></span><a class="share"></a><a class="delete"></a><a class="edit"></a><a class="save"></a></li>',

    'initialize': function() {
      return BaseViewPrototype.initialize.apply(this, arguments);
    },

    'render': function() {
      var self = this,
          model = self.model,
          name = self.model.get('name'),
          label = language.data[name.toLowerCase()] || name;
      self.model.set('label', label);
      return BaseViewPrototype.render.apply(this, arguments);
    }

  });

  return ListView;

});