require(['libs/jquery', 'views/base', 'models/list'], function($, BaseView, ListModel) {

  //"use strict";

  //var
  window.ListView = BaseView.extend({
    el: '#lists'
  });

  return ListView;

});