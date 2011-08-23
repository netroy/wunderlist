var menu = menu || {};

/**
 * Reset position of Wunderlist (Mac)
 *
 * @author Christian Reber
 */
menu.reset_window_size = function() {
	var currentWindow = Titanium.UI.getMainWindow();
	
	currentWindow.height = 400;
	currentWindow.width  = 600;
	currentWindow.x      = Math.round((screen.width / 2) - 300);
	currentWindow.y      = Math.round((screen.height / 2) - 200);
}

/**
 * Reset position of Wunderlist (Mac)
 *
 * @author Christian Reber
 */
menu.reset_note_window = function() {
	var currentWindows = Titanium.UI.getOpenWindows();
	
	for (x in currentWindows) {
		if (currentWindows[x].noteId != undefined) {
			currentWindows[x].height = 400;
			currentWindows[x].width  = 500;
			currentWindows[x].x      = Math.round((screen.width / 2) - 250);
			currentWindows[x].y      = Math.round((screen.height / 2) - 200);
			currentWindows[x].focus();
		}
	}
}

/**
 * Initialize the whole menu
 *
 * @author Christian Reber
 * @author Dennis Schneider
 * @author Daniel Marschner
 */
menu.initialize = function() {
	var new_menu          = Titanium.UI.createMenu();
	var accountMenuItem	  = new_menu.addItem(wunderlist.language.data.account);
	var extraMenuItem	  = new_menu.addItem(wunderlist.language.data.settings);
	var downloadsMenuItem = new_menu.addItem(wunderlist.language.data.downloads);
	var aboutUsMenuItem   = new_menu.addItem(wunderlist.language.data.about_us);

	accountMenuItem.addItem(wunderlist.language.data.invitation, function() { wunderlist.account.showInviteDialog(); menu.refocus(); });
	accountMenuItem.addSeparatorItem();
	
	// Language Menu
	var languageMenuItem = extraMenuItem.addItem(wunderlist.language.data.language);
	
	for (var ix in wunderlist.language.availableLang)
	{
		languageItem = languageMenuItem.addItem(wunderlist.language.availableLang[ix].translation, function(e) {
			menu.switch_language(e.getTarget().code);
		});
		languageItem.code = wunderlist.language.availableLang[ix].code;
	}

	extraMenuItem.addItem(wunderlist.language.data.add_item_method, function() { dialogs.openSelectAddItemMethodDialog(); menu.refocus(); });
	extraMenuItem.addItem(wunderlist.language.data.switchdateformat, function() { dialogs.openSwitchDateFormatDialog(); menu.refocus(); });
	extraMenuItem.addItem(wunderlist.language.data.sidebar_position, function() { dialogs.openSidebarDialog(); menu.refocus(); });
	extraMenuItem.addItem(wunderlist.language.data.delete_prompt_menu, function() { dialogs.openDeletePromptDialog(); menu.refocus(); });

	var isNaturalDateRecognitionEnabled = Titanium.App.Properties.getInt('enable_natural_date_recognition');
	var enableNaturalDateRecognitionMenuString = wunderlist.language.data.enable_natural_date_recognition;
	if (isNaturalDateRecognitionEnabled === 1) {
		enableNaturalDateRecognitionMenuString = wunderlist.language.data.disable_natural_date_recognition;
	}
	extraMenuItem.addItem(enableNaturalDateRecognitionMenuString, function () {
		var isNaturalDateRecognitionEnabled = Titanium.App.Properties.getInt('enable_natural_date_recognition', 0);
		if (isNaturalDateRecognitionEnabled === 1) {
			Titanium.App.Properties.setInt('enable_natural_date_recognition', 0);
			this.getSubmenu().getItemAt(5).setLabel(wunderlist.language.data.enable_natural_date_recognition);
		} else {
			Titanium.App.Properties.setInt('enable_natural_date_recognition', 1);
			this.getSubmenu().getItemAt(5).setLabel(wunderlist.language.data.disable_natural_date_recognition);
		}
	});
	
	// Extras Menu
	extraMenuItem.addItem(wunderlist.language.data.reset_window_size, function() { menu.reset_window_size(); menu.refocus(); }); // Reset Window Size
	extraMenuItem.addItem(wunderlist.language.data.reset_note_window, menu.reset_note_window); // Reset Note Window

	// Create Tutorials
	extraMenuItem.addItem(wunderlist.language.data.create_tutorials, function() { wunderlist.database.recreateTuts(); menu.refocus(); });

	aboutUsMenuItem.addItem('Knowledge Base',    function() {Titanium.Desktop.openURL('http://support.6wunderkinder.com/kb')});
	//aboutUsMenuItem.addItem(wunderlist.language.data.privacy_policy,  function() {Titanium.Desktop.openURL('http://www.6wunderkinder.com')});
	aboutUsMenuItem.addItem(wunderlist.language.data.credits,         openCreditsDialog);  // About Us Dialog
	aboutUsMenuItem.addItem(wunderlist.language.data.backgrounds,     openBackgroundsDialog);  // Background Credits
	aboutUsMenuItem.addItem(wunderlist.language.data.wunderkinder,    function() {Titanium.Desktop.openURL('http://www.6wunderkinder.com')});
	aboutUsMenuItem.addItem(wunderlist.language.data.wunderkinder_tw, function() {Titanium.Desktop.openURL('http://www.twitter.com/6Wunderkinder')});
	aboutUsMenuItem.addItem(wunderlist.language.data.wunderkinder_fb, function() {Titanium.Desktop.openURL('http://www.facebook.com/6Wunderkinder')});
	//aboutUsMenuItem.addSeparatorItem();
	//aboutUsMenuItem.addItem(wunderlist.language.data.changelog, function() {Titanium.Desktop.openURL('http://www.6wunderkinder.com/wunderlist/changelog')});

	if (wunderlist.account.isLoggedIn())
	{
		accountMenuItem.addItem(wunderlist.language.data.change_login_data, function() { wunderlist.account.editProfile(); menu.refocus(); })
		accountMenuItem.addItem(wunderlist.language.data.delete_account, function() { wunderlist.account.deleteAccount(); menu.refocus(); });
		accountMenuItem.addSeparatorItem();
		accountMenuItem.addItem(wunderlist.language.data.logout, function() {
			menu.refocus();
			wunderlist.sync.fireSync(true);
		});
	}
	else
	{
		accountMenuItem.addItem(wunderlist.language.data.sign_in, function() {
			dialogs.closeEveryone();
			wunderlist.account.showRegisterDialog();
			menu.refocus();
		});
	}

	downloadsMenuItem.addItem('iPhone',  function () { Titanium.Desktop.openURL('http://itunes.apple.com/us/app/wunderlist-to-do-listen/id406644151') });
	downloadsMenuItem.addItem('iPad',    function () { Titanium.Desktop.openURL('http://itunes.apple.com/us/app/wunderlist-hd/id420670429') });
	downloadsMenuItem.addItem('Android', function () { Titanium.Desktop.openURL('http://market.android.com/details?id=com.wunderkinder.wunderlistandroid') });
	downloadsMenuItem.addItem('Mac OSX', function () { Titanium.Desktop.openURL('http://www.6wunderkinder.com/wunderlist') });
	downloadsMenuItem.addItem('Windows', function () { Titanium.Desktop.openURL('http://www.6wunderkinder.com/wunderlist') });

	menu.remove();
	Titanium.UI.setMenu(new_menu);
}

/**
 * Creates a tray icon with menu
 *
 * @author Dennis Schneider
 */
menu.initializeTrayIcon = function() {
	var os = Titanium.Platform.name.toLowerCase();

	// Only for windows and linux
	if(os != 'notray')
	{
        // Create the tray icon and menu and prevent the application from exit on 'x'
        if (os == 'darwin')
        {
        	var wunderlistWindow = menu.preventCloseEvent();
        }
        else
        {
        	var wunderlistWindow = Titanium.UI.getCurrentWindow();
        }

		/*if (os != 'darwin')
			var trayIconPath = Titanium.API.Application.getResourcesPath() + '/images/traywin.png';
		else
			var trayIconPath = Titanium.API.Application.getResourcesPath() + '/images/traymac.png';
		
		// Show the window again in windows and linux, when clicking the tray icon
		if (os != 'darwin')
		{
			var trayIcon = Titanium.UI.addTray(trayIconPath, function () {
				menu.showWindow(wunderlistWindow)
			});
		}
		else
		{
			var trayIcon = Titanium.UI.addTray(trayIconPath);
		}
		trayIcon.setHint('Wunderlist - todo application')

		var trayMenu         = Titanium.UI.createMenu();
		var trayExitItem	 = trayMenu.addItem(wunderlist.language.data.exit_wunderlist, menu.exitWunderlist);
		
		trayIcon.setMenu(trayMenu);*/

		if (os == 'darwin')
		{
			Titanium.on("reopen", function (e) {
				if (!e.hasVisibleWindows) 
				{
					wunderlistWindow.show();
					e.preventDefault();
				}
			});
		}
	}
	else
	{
		var wunderlistWindow = Titanium.UI.getCurrentWindow();	
	
		wunderlistWindow.addEventListener(Titanium.CLOSE, function(event) {
			if (wunderlist.account.isLoggedIn() == true) 
			{
				wunderlist.sync.fireSync(false, true);
				event.stopPropagation();
			}
		});	
	}
}

/**
 * Own exit method for the app
 *
 * @author Dennis Schneider
 */
menu.exitWunderlist = function() {
	// If the user is logged in and internet is available
	if (wunderlist.account.isLoggedIn() && Titanium.Network.online == true)
	{
		wunderlist.sync.fireSync(false, true);
	}
	else
	{
		Titanium.App.exit()
	}

	//Titanium.UI.Tray.remove();
}
 

/**
 * Prevent standard close event
 *
 * @author Dennis Schneider
 */
menu.preventCloseEvent = function() {
	var wunderlistWindow = Titanium.UI.getCurrentWindow();

	wunderlistWindow.addEventListener(Titanium.CLOSE, function(event) {
		wunderlistWindow.hide();
	    event.preventDefault();
	    return false;
	});

	return wunderlistWindow;
}

/**
 * Show the Wunderlist window if it's hidden
 *
 * @author Dennis Schneider
 */
menu.showWindow = function(wunderlistWindow) {
	wunderlistWindow.show();
}

/**
 * Switch language setting
 *
 * @author Dennis Schneider
 */
menu.switch_language = function(code) {
	settings.save_window_position();
	Titanium.App.Properties.setString('language', code);
	Titanium.App.restart();
}

/**
 * Remove the menu
 *
 * @author Dennis Schneider
 */
menu.remove = function() {
	if(Titanium.UI.Menu != undefined)
	{
		Titanium.UI.menu.clear();
	}
}

/**
 * Refocusses the (hidden) Wunderlist window
 *
 * @author Dennis Schneider
 */
menu.refocus = function() {
	var wunderlistWindow = Titanium.UI.getCurrentWindow();
	wunderlistWindow.show();
	wunderlistWindow.focus();
}