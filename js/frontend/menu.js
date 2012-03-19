/*global define:false */
define('frontend/menu',
      ['libs/jquery',
       'views/base', 'models/base', 'helpers/language', 'helpers/settings',
       'backend/account', 'backend/sync', 'frontend/dialogs'],
      function($, BaseView, BaseModel, language, settings, account, sync, dialogs, undefined) {

  "use strict";

  var Item = BaseView.extend({

    tagName: 'li',

    initialize: function(label, handler, cssClass) {
      var self = this;
      BaseView.prototype.initialize.apply(self, []);

      // On label change the item should re-render
      self.label = label;
      self.bind('change:label', self.render);

      self.span = $('<span/>');
      self.el.append(self.span);

      self.handler = handler;
      self.cssClass = cssClass;
      if(typeof handler === 'function') {
        self.el.click(handler);
      }
    },

    addItem: function(label, handler, cssClass) {
      var self = this;
      var item = new Item(label, handler, cssClass);
      if(typeof self.submenu === 'undefined') {
        self.submenu = $('<ul/>').addClass(self.cssClass);
        self.el.append(self.submenu);
      }
      this.submenu.append(item.render().el);
      return item;
    },

    addSeparator: function() {
      this.submenu.append("<li class='separator' />");
    },

    clear: function() {
      this.submenu.remove();
      this.el.remove();
    },

    setLabel: function(label) {
      this.label = label;
      this.trigger("change:label");
    },

    render: function() {
      var self = this,
          el = self.el,
          span = self.span,
          cssClass = self.cssClass,
          handler = self.handler,
          label = self.label;

      label = language.data[label] || label;
      if(typeof cssClass !== 'undefined') {
        el.addClass(cssClass);
      }

      if(typeof handler === 'string') {
        el.html("<a href=" + handler + " target='_blank'>" + label + "</a>");
      } else {
        span.html(label);
      }

      return self;
    }

  });


  // TODO: all external functions & module references should be removed
  // A message bus like structure should be used to better decouple the modules
  function init() {
    var menu = new Item();
    menu.submenu = $('#bottomBar ul.menu');

    var accountMenuItem   = menu.addItem('account',  undefined, 'account');
    var settingsMenuItem  = menu.addItem('settings', undefined, 'settings');
    var downloadsMenuItem = menu.addItem('downloads',undefined, 'downloads');
    var aboutUsMenuItem   = menu.addItem('about_us', undefined, 'aboutus');

    /*
     * Accounts
     */
    accountMenuItem.addItem('invitation', account.showInviteDialog);
    if (account.isLoggedIn()) {
      accountMenuItem.addItem('change_login_data', account.editProfile);
      accountMenuItem.addItem('delete_account', account.deleteAccount);
      accountMenuItem.addSeparator();
      var logOutParent = (settings.os === "web") ? menu : accountMenuItem;
      logOutParent.addItem('logout', function() {
        sync.fireSync(true);
      }, 'logout');
    } else {
      accountMenuItem.addItem('sign_in', account.showRegisterDialog);
    }

    // Language Menu
    var languageMenuItem = settingsMenuItem.addItem('language', undefined, 'language');
    var languages = language.availableLang, languageItem;
    $.each(languages, function(code) {
      languageItem = languageMenuItem.addItem(languages[code].translation);
      languageItem.el.attr("class", code);
    });
    languageMenuItem.el.delegate('li', 'click', function(e) {
      language.setLanguage(e.currentTarget.className);
    });


    settingsMenuItem.addSeparator();
    settingsMenuItem.addItem('add_item_method', dialogs.openSelectAddItemMethodDialog);
    settingsMenuItem.addItem('switchdateformat', dialogs.openSwitchDateFormatDialog);
    settingsMenuItem.addItem('sidebar_position', dialogs.openSidebarPositionDialog);
    settingsMenuItem.addItem('delete_prompt_menu', dialogs.openDeletePromptDialog);

    var isNaturalDateRecognitionEnabled = settings.getInt('enable_natural_date_recognition', 0);
    var enableNaturalDateRecognitionMenuString = 'enable_natural_date_recognition';
    var enableNaturalDateRecognitionMenuItem;
    if (isNaturalDateRecognitionEnabled === 1) {
      enableNaturalDateRecognitionMenuString = 'disable_natural_date_recognition';
    }
    enableNaturalDateRecognitionMenuItem = settingsMenuItem.addItem(enableNaturalDateRecognitionMenuString, function () {
      var isNaturalDateRecognitionEnabled = settings.getInt('enable_natural_date_recognition', 0);
      if (isNaturalDateRecognitionEnabled === 1) {
        settings.setInt('enable_natural_date_recognition', 0);
        enableNaturalDateRecognitionMenuItem.setLabel('enable_natural_date_recognition');
      } else {
        settings.setInt('enable_natural_date_recognition', 1);
        enableNaturalDateRecognitionMenuItem.setLabel('disable_natural_date_recognition');
      }
    });
    settingsMenuItem.addSeparator();

    // Reset Window Positions
    settingsMenuItem.addItem('reset_window_size', undefined);
    settingsMenuItem.addItem('reset_note_window', undefined);

    // Create Tutorials
    //settingsMenuItem.addItem('create_tutorials', database.recreateTuts);

    /*
     * About Wunderlist
     */

    aboutUsMenuItem.addItem('knowledge_base', 'http://support.6wunderkinder.com/kb');
    //aboutUsMenuItem.addItem('privacy_policy', 'http://www.6wunderkinder.com');
    aboutUsMenuItem.addItem('wunderkinder_tw', 'http://www.twitter.com/6Wunderkinder');
    aboutUsMenuItem.addItem('wunderkinder_fb', 'http://www.facebook.com/6Wunderkinder');
    aboutUsMenuItem.addSeparator();
    aboutUsMenuItem.addItem('changelog', 'http://www.6wunderkinder.com/wunderlist/changelog');
    aboutUsMenuItem.addItem('backgrounds', dialogs.openBackgroundsDialog);
    aboutUsMenuItem.addItem('about_wunderlist', dialogs.openCreditsDialog);
    aboutUsMenuItem.addItem('about_wunderkinder', 'http://www.6wunderkinder.com/');


    /*
     * Downloads
     */
    downloadsMenuItem.addItem('iphone',    'http://itunes.apple.com/us/app/wunderlist-to-do-listen/id406644151');
    downloadsMenuItem.addItem('ipad',      'http://itunes.apple.com/us/app/wunderlist-hd/id420670429');
    downloadsMenuItem.addItem('android',   'http://market.android.com/details?id=com.wunderkinder.wunderlistandroid');
    if (settings.os !== 'darwin') {
      downloadsMenuItem.addItem('macosx',  'http://www.6wunderkinder.com/wunderlist/');
    }
    if (settings.os !== 'windows') {
      downloadsMenuItem.addItem('windows', 'http://www.6wunderkinder.com/wunderlist/');
    }
    if (settings.os !== 'linux') {
      downloadsMenuItem.addItem('linux',   'http://www.6wunderkinder.com/wunderlist/');
    }
  }

  return {
    "init": init
  };

});