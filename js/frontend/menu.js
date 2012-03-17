/*global define:false */
define('frontend/menu',
      ['libs/jquery', 'views/base', 'helpers/language', 'helpers/settings', 'backend/account', 'backend/sync', 'frontend/dialogs'],
      function($, BaseView, language, settings, account, sync, dialogs, undefined) {

  "use strict";

  function openURL(url) {
    return function() {
      window.open(url);
    };
  }

  var Item = BaseView.extend({

    initialize: function(label, handler, cssClass) {
      var self = this;

      self.label = label || "";
      self.elem = $("<li/>").html(label);
      self.cssClass = cssClass;
      if(typeof cssClass !== 'undefined') {
        self.elem.addClass(cssClass);
      }

      // BaseView.prototype.initialize(self, arguments);

      if(typeof handler === 'function') {
        self.elem.click(handler);
      } else if(typeof handler === 'string') {
        self.elem.html("<a href=" + handler + " target='_blank'>" + label + "</a>");
      }

    },

    addItem: function(label, handler, cssClass) {
      var self = this;
      var item = new Item(label, handler, cssClass);
      if(typeof self.submenu === 'undefined'){
        self.submenu = $('<ul/>').addClass(self.cssClass);
        self.elem.append(self.submenu);
      }
      this.submenu.append(item.elem);
      return item;
    },

    addSeparatorItem: function() {
      this.submenu.append("<li class='separator' />");
    },

    clear: function() {
      this.submenu.remove();
      this.elem.remove();
    },

    setLabel: function(label) {
      this.label = label;
      this.elem.html(label || "");
    }
  });


  // TODO: all external functions & module references should be removed
  // A message bus like structure should be used to better decouple the modules
  function init() {
    var menu = new Item();
    menu.submenu = $('#bottomBar ul.menu');


    var accountMenuItem   = menu.addItem(language.data.account,  undefined, 'account');
    var settingsMenuItem  = menu.addItem(language.data.settings, undefined, 'icon settings');
    var downloadsMenuItem = menu.addItem(language.data.downloads,undefined, 'icon downloads');
    var aboutUsMenuItem   = menu.addItem(language.data.about_us, undefined, 'icon aboutus');

    /*
     * Accounts
     */
    accountMenuItem.addItem(language.data.invitation, account.showInviteDialog);
    if (account.isLoggedIn()) {
      accountMenuItem.addItem(language.data.change_login_data, account.editProfile);
      accountMenuItem.addItem(language.data.delete_account, account.deleteAccount);
      accountMenuItem.addSeparatorItem();
      var logOutParent = (settings.os === "web") ? menu : accountMenuItem;
      logOutParent.addItem(language.data.logout, function() {
        sync.fireSync(true);
      }, 'icon logout');
    } else {
      accountMenuItem.addItem(language.data.sign_in, function() {
        //helpers.dialogs.closeEveryone();
        account.showRegisterDialog();
      });
    }

    // Language Menu
    var languageMenuItem = settingsMenuItem.addItem(language.data.language, undefined, 'language');
    var languages = language.availableLang, languageItem;
    $.each(languages, function(code) {
      languageItem = languageMenuItem.addItem(languages[code].translation);
      languageItem.elem.attr("class", code);
    });
    languageMenuItem.elem.delegate('li', 'click', function(e) {
      language.setLanguage(e.target.className);
    });


    settingsMenuItem.addSeparatorItem();
    settingsMenuItem.addItem(language.data.add_item_method, dialogs.openSelectAddItemMethodDialog);
    settingsMenuItem.addItem(language.data.switchdateformat, dialogs.openSwitchDateFormatDialog);
    settingsMenuItem.addItem(language.data.sidebar_position, dialogs.openSidebarPositionDialog);
    settingsMenuItem.addItem(language.data.delete_prompt_menu, dialogs.openDeletePromptDialog);

    var isNaturalDateRecognitionEnabled = settings.getInt('enable_natural_date_recognition', 0);
    var enableNaturalDateRecognitionMenuString = language.data.enable_natural_date_recognition;
    var enableNaturalDateRecognitionMenuItem;
    if (isNaturalDateRecognitionEnabled === 1) {
      enableNaturalDateRecognitionMenuString = language.data.disable_natural_date_recognition;
    }
    enableNaturalDateRecognitionMenuItem = settingsMenuItem.addItem(enableNaturalDateRecognitionMenuString, function () {
      var isNaturalDateRecognitionEnabled = settings.getInt('enable_natural_date_recognition', 0);
      if (isNaturalDateRecognitionEnabled === 1) {
        settings.setInt('enable_natural_date_recognition', 0);
        enableNaturalDateRecognitionMenuItem.setLabel(language.data.enable_natural_date_recognition);
      } else {
        settings.setInt('enable_natural_date_recognition', 1);
        enableNaturalDateRecognitionMenuItem.setLabel(language.data.disable_natural_date_recognition);
      }
    });
    settingsMenuItem.addSeparatorItem();

    // Reset Window Positions
    //settingsMenuItem.addItem(language.data.reset_window_size, resetWindowSize);
    //settingsMenuItem.addItem(language.data.reset_note_window, resetNotesWindow);

    // Create Tutorials
    //settingsMenuItem.addItem(language.data.create_tutorials, database.recreateTuts);

    /*
     * About Wunderlist
     */
    aboutUsMenuItem.addItem(language.data.knowledge_base, 'http://support.6wunderkinder.com/kb');
    //aboutUsMenuItem.addItem(language.data.privacy_policy, 'http://www.6wunderkinder.com');
    aboutUsMenuItem.addItem(language.data.wunderkinder_tw, 'http://www.twitter.com/6Wunderkinder');
    aboutUsMenuItem.addItem(language.data.wunderkinder_fb, 'http://www.facebook.com/6Wunderkinder');
    aboutUsMenuItem.addSeparatorItem();
    aboutUsMenuItem.addItem(language.data.changelog, 'http://www.6wunderkinder.com/wunderlist/changelog');
    aboutUsMenuItem.addItem(language.data.backgrounds, dialogs.openBackgroundsDialog);
    aboutUsMenuItem.addItem(language.data.about_wunderlist, dialogs.openCreditsDialog);
    aboutUsMenuItem.addItem(language.data.about_wunderkinder, 'http://www.6wunderkinder.com/');

    /*
     * Downloads
     */
    downloadsMenuItem.addItem('iPhone',  'http://itunes.apple.com/us/app/wunderlist-to-do-listen/id406644151');
    downloadsMenuItem.addItem('iPad',    'http://itunes.apple.com/us/app/wunderlist-hd/id420670429');
    downloadsMenuItem.addItem('Android', 'http://market.android.com/details?id=com.wunderkinder.wunderlistandroid');
    if (settings.os !== 'darwin') {
      downloadsMenuItem.addItem('Mac OSX', 'http://www.6wunderkinder.com/wunderlist/');
    }
    if (settings.os !== 'windows') {
      downloadsMenuItem.addItem('Windows', 'http://www.6wunderkinder.com/wunderlist/');
    }
    if (settings.os !== 'linux') {
      downloadsMenuItem.addItem('Linux',   'http://www.6wunderkinder.com/wunderlist/');
    }
  }

  return {
    "init": init
  };

});