/* global wunderlist */
wunderlist.menu = (function(window, $, wunderlist, Titanium, undefined){
  "use strict";

  var recreateTutsClicked = false;
  var switchDateFormatDialog;


  function recreateTutorials() {
      if (recreateTutsClicked === false) {
          recreateTutsClicked = true;
          //wunderlist.recreateTutorials();
      }
      window.setTimeout(function() {
          recreateTutsClicked = false;
      }, 200);
  }


  function initMenuEvents(){
    var menuUl = $("ul.menu");
    menuUl.delegate("a", "click", function(){
      $("#menublur").click();
    });

    $('a.change_login_data', menuUl).click( wunderlist.account.editProfile );
    $('a.delete_account', menuUl).click( wunderlist.account.deleteAccount );
    $('a.invitation', menuUl).click( wunderlist.account.showInviteDialog );
    $('a.logout', menuUl).click( wunderlist.account.logout );

    $('a.credits', menuUl).click( wunderlist.helpers.dialogs.openCreditsDialog );
    $('a.backgrounds', menuUl).click( wunderlist.helpers.dialogs.openBackgroundsDialog );
    $('a.switchdateformat', menuUl).click( wunderlist.helpers.dialogs.openSwitchDateFormatDialog );
    $('a.deleteprompt', menuUl).click( wunderlist.helpers.dialogs.openDeletePromptDialog );
    $('a.sidebarposition', menuUl).click( wunderlist.helpers.dialogs.openSidebarPositionDialog );
    $('a.create_tutorials', menuUl).click( recreateTutorials );
    $('a.lang', menuUl).click(function() {
        wunderlist.language.switchLang($(this).attr('rel'));
    });
  }


  function initializeTrayIcon(){
  
  }

  function remove(){
    
  }

  /**
   * Reset position of Wunderlist (Mac)
   * @author Christian Reber
   */
  function resetWindowSize() {
    var currentWindow = Titanium.UI.getMainWindow();
    currentWindow.height = 400;
    currentWindow.width  = 600;
    currentWindow.x      = Math.round((window.screen.width / 2) - 300);
    currentWindow.y      = Math.round((window.screen.height / 2) - 200);
  }

  function resetNotesWindow() {
    var currentWindows = Titanium.UI.getOpenWindows();
    for (var x in currentWindows) {
      if (currentWindows[x].noteId !== undefined) {
        currentWindows[x].height = 400;
        currentWindows[x].width  = 500;
        currentWindows[x].x      = Math.round((window.screen.width / 2) - 250);
        currentWindows[x].y      = Math.round((window.screen.height / 2) - 200);
        currentWindows[x].focus();
      }
    }
  }

  /**
   * MenuItemClass - use this to build the DOM menu
   */
  function Item(label, handler, cssClass){
    this.label = label || "";
    this.elem = $("<li/>").html(label);
    this.cssClass = cssClass;
    if(typeof cssClass !== 'undefined'){
      this.elem.addClass(cssClass);
    }

    if(typeof handler === 'function'){
      this.elem.click(handler);
    } else if(typeof handler === 'string') {
      this.elem.html("<a href=" + handler + " target='_blank'>" + label + "</a>");
    }
  }

  Item.prototype = {
    addItem: function(label, handler, cssClass){
      var item = new Item(label, handler, cssClass);
      if(typeof this.submenu === 'undefined'){
        this.submenu = $('<ul/>').addClass(this.cssClass);
        this.elem.append(this.submenu);
      }
      this.submenu.append(item.elem);
      return item;
    },
    addSeparatorItem: function(){
      this.submenu.append("<li class='separator' />");
    },
    clear: function(){
      this.submenu.remove();
      this.elem.remove();
    },
    setLabel: function(label){
      this.label = label;
      this.elem.html(label || "");
    }
  };

  function createMenu(container){
    var root = new Item();
    root.submenu = $(container);
    return root;
  }

  function setMenu(menu){
    // Do something
  }

  function setBadge(count){
    // update some badge
  }

  function initialize() {
    var menu = createMenu("ul.menu");
    var accountMenuItem   = menu.addItem(wunderlist.language.data.account,  undefined, 'account');
    var settingsMenuItem  = menu.addItem(wunderlist.language.data.settings, undefined, 'icon settings');
    var downloadsMenuItem = menu.addItem(wunderlist.language.data.downloads,undefined, 'icon downloads');
    var aboutUsMenuItem   = menu.addItem(wunderlist.language.data.about_us, undefined, 'icon aboutus');

    /*
     * Accounts
     */
    accountMenuItem.addItem(wunderlist.language.data.invitation, wunderlist.account.showInviteDialog);
    //accountMenuItem.addSeparatorItem();
    if (wunderlist.account.isLoggedIn()) {
      accountMenuItem.addItem(wunderlist.language.data.change_login_data, wunderlist.account.editProfile);
      accountMenuItem.addItem(wunderlist.language.data.delete_account, wunderlist.account.deleteAccount);
      accountMenuItem.addSeparatorItem();
      var logOutParent = (wunderlist.settings.os === "web") ? menu : accountMenuItem;
      logOutParent.addItem(wunderlist.language.data.logout, function() {
        wunderlist.sync.fireSync(true);
      }, 'icon logout');
    } else {
      accountMenuItem.addItem(wunderlist.language.data.sign_in, function() {
        wunderlist.helpers.dialogs.closeEveryone();
        wunderlist.account.showRegisterDialog();
      });
    }

    // Language Menu
    var languageMenuItem = settingsMenuItem.addItem(wunderlist.language.data.language, undefined, 'language');
    var languages = wunderlist.language.availableLang, languageItem;
    $.each(languages, function(language){
      languageItem = languageMenuItem.addItem(languages[language].translation);
      languageItem.elem.attr("class", languages[language].code);
    });
    languageMenuItem.elem.delegate('li', 'click', function(e) {
      wunderlist.language.switchLanguage(e.target.className);
    });

    settingsMenuItem.addSeparatorItem();
    settingsMenuItem.addItem(wunderlist.language.data.add_item_method, wunderlist.helpers.dialogs.openSelectAddItemMethodDialog);
    settingsMenuItem.addItem(wunderlist.language.data.switchdateformat, wunderlist.helpers.dialogs.openSwitchDateFormatDialog);
    settingsMenuItem.addItem(wunderlist.language.data.sidebar_position, wunderlist.helpers.dialogs.openSidebarPositionDialog);
    settingsMenuItem.addItem(wunderlist.language.data.delete_prompt_menu, wunderlist.helpers.dialogs.openDeletePromptDialog);

    var isNaturalDateRecognitionEnabled = wunderlist.settings.getInt('enable_natural_date_recognition', 0);
    var enableNaturalDateRecognitionMenuString = wunderlist.language.data.enable_natural_date_recognition;
    var enableNaturalDateRecognitionMenuItem;
    if (isNaturalDateRecognitionEnabled === 1) {
      enableNaturalDateRecognitionMenuString = wunderlist.language.data.disable_natural_date_recognition;
    }
    enableNaturalDateRecognitionMenuItem = settingsMenuItem.addItem(enableNaturalDateRecognitionMenuString, function () {
      var isNaturalDateRecognitionEnabled = wunderlist.settings.getInt('enable_natural_date_recognition', 0);
      if (isNaturalDateRecognitionEnabled === 1) {
        wunderlist.settings.setInt('enable_natural_date_recognition', 0);
        enableNaturalDateRecognitionMenuItem.setLabel(wunderlist.language.data.enable_natural_date_recognition);
      } else {
        wunderlist.settings.setInt('enable_natural_date_recognition', 1);
        enableNaturalDateRecognitionMenuItem.setLabel(wunderlist.language.data.disable_natural_date_recognition);
      }
    });
    settingsMenuItem.addSeparatorItem();

    // Reset Window Positions
    settingsMenuItem.addItem(wunderlist.language.data.reset_window_size, resetWindowSize);
    settingsMenuItem.addItem(wunderlist.language.data.reset_note_window, resetNotesWindow);

    // Create Tutorials
    settingsMenuItem.addItem(wunderlist.language.data.create_tutorials, wunderlist.database.recreateTuts);

    /*
     * About Wunderlist
     */
    aboutUsMenuItem.addItem(wunderlist.language.data.knowledge_base, 'http://support.6wunderkinder.com/kb');
    //aboutUsMenuItem.addItem(wunderlist.language.data.privacy_policy, 'http://www.6wunderkinder.com');
    aboutUsMenuItem.addItem(wunderlist.language.data.wunderkinder_tw, 'http://www.twitter.com/6Wunderkinder');
    aboutUsMenuItem.addItem(wunderlist.language.data.wunderkinder_fb, 'http://www.facebook.com/6Wunderkinder');
    aboutUsMenuItem.addSeparatorItem();
    //aboutUsMenuItem.addItem(wunderlist.language.data.changelog, 'http://www.6wunderkinder.com/wunderlist/changelog');
    aboutUsMenuItem.addItem(wunderlist.language.data.backgrounds, wunderlist.helpers.dialogs.openBackgroundsDialog);
    aboutUsMenuItem.addItem(wunderlist.language.data.about_wunderlist, wunderlist.helpers.dialogs.openCreditsDialog);
    aboutUsMenuItem.addItem(wunderlist.language.data.about_wunderkinder, 'http://www.6wunderkinder.com/');

    /*
     * Downloads
     */
    downloadsMenuItem.addItem('iPhone',  'http://itunes.apple.com/us/app/wunderlist-to-do-listen/id406644151');
    downloadsMenuItem.addItem('iPad',    'http://itunes.apple.com/us/app/wunderlist-hd/id420670429');
    downloadsMenuItem.addItem('Android', 'http://market.android.com/details?id=com.wunderkinder.wunderlistandroid');
		if (wunderlist.settings.os !== 'darwin') {
      downloadsMenuItem.addItem('Mac OSX', 'http://www.6wunderkinder.com/wunderlist/');
		}
		if (wunderlist.settings.os !== 'windows') {
      downloadsMenuItem.addItem('Windows', 'http://www.6wunderkinder.com/wunderlist/');
		}
		if (wunderlist.settings.os !== 'linux') {
		  downloadsMenuItem.addItem('Linux',   'http://www.6wunderkinder.com/wunderlist/');
		}

    $("#email").live('click', function(){
      menu.submenu.toggle();
    });
    $("body").click(function(){
      menu.submenu.hide();
    });

/*
    var blurActive = 0;

    $("#left ul a").each(function() {
      if ($(this).next("ul").length !== 0) {
        $(this).parent().addClass("hasChild");
      }
    });

    $("#left a:first").click(function() {
      window.clearTimeout(menuTimer);
      $(this).next().show();
      $("#menublur").show();
    });

    $("#left ul a").mouseenter(function() {
      window.clearTimeout(menuTimer);
      $(this).parent().parent().find("ul").hide();
      var submenu = $(this).next("ul");
      submenu.show();
      $(this).parent().parent().find("li").removeClass("currenttree");
      $(this).parent("li").addClass("currenttree");
    });

    $("#menublur").mouseenter(function() {
      menuTimer = window.setTimeout(function() {
        $("#left ul").hide();
        $("#left a:first").removeClass("active");
        $("#left li").removeClass("currenttree");
        $("#menublur").hide();
        $('#backgroundList').fadeOut(100);
      }, 350);
    });
  
    initMenuEvents();
*/
  }


  return {
    "initialize": initialize,
    "initializeTrayIcon": initializeTrayIcon,
    "remove": remove,
    "createMenu": createMenu,
    "setMenu": setMenu,
    "setBadge": setBadge
  };
})(window, jQuery, wunderlist, Titanium);