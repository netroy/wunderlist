var menu = menu || {};

/**
 * Reset position of Wunderlist (Mac)
 *
 * @author Christian Reber
 */
menu.reset_window_size = function() {
	var currentWindow = Titanium.UI.getCurrentWindow();
	
	currentWindow.height = 400;
	currentWindow.width  = 600;
	currentWindow.x      = Math.round((screen.width / 2) - 300);
	currentWindow.y      = Math.round((screen.height / 2) - 200);
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

	accountMenuItem.addItem(wunderlist.language.data.invitation, wunderlist.account.showInviteDialog);
	accountMenuItem.addSeparatorItem();

	var languageMenuItem  = extraMenuItem.addItem(wunderlist.language.data.language);

	// Language Menu
	languageMenuItem.addItem('Deutsch',    function() {menu.switch_language('de')});
	languageMenuItem.addItem('English',    function() {menu.switch_language('en')});
	languageMenuItem.addItem('Español',    function() {menu.switch_language('es')});
	languageMenuItem.addItem('Català',     function() {menu.switch_language('ca')});
	languageMenuItem.addItem('Français',   function() {menu.switch_language('fr')});
	languageMenuItem.addItem('Polski',     function() {menu.switch_language('pl')});
	languageMenuItem.addItem('Português',  function() {menu.switch_language('pt')});
	languageMenuItem.addItem('Italiano',   function() {menu.switch_language('it')});
	languageMenuItem.addItem('Slovensky',  function() {menu.switch_language('sk')});
	languageMenuItem.addItem('Nederlands', function() {menu.switch_language('nl')});
	languageMenuItem.addItem('Pусский',    function() {menu.switch_language('ru')});
	languageMenuItem.addItem('Українське', function() {menu.switch_language('uk')});
	languageMenuItem.addItem('Dansk',      function() {menu.switch_language('da')});
	languageMenuItem.addItem('České',      function() {menu.switch_language('cs')});
	languageMenuItem.addItem('中文',        function() {menu.switch_language('zh')});
	languageMenuItem.addItem('Türkçe',     function() {menu.switch_language('tr')});
	languageMenuItem.addItem('عربي',        function() {menu.switch_language('ar')});
	languageMenuItem.addItem('Svenska',    function() {menu.switch_language('se')});
	languageMenuItem.addItem('日本語',      function() {menu.switch_language('ja')});
	languageMenuItem.addItem('Magyar',     function() {menu.switch_language('hu')});
	languageMenuItem.addItem('한국어',      function() {menu.switch_language('ko')});
	languageMenuItem.addItem('Hrvatski',   function() {menu.switch_language('hr')});
	languageMenuItem.addItem('Norsk',      function() {menu.switch_language('no')});
	languageMenuItem.addItem('Српска',     function() {menu.switch_language('sr')});
	languageMenuItem.addItem('Galego',     function() {menu.switch_language('gl')});
	languageMenuItem.addItem('Română',     function() {menu.switch_language('ro')});
	languageMenuItem.addItem('Português (Brazilian)',     function() {menu.switch_language('pt-br')});	

	extraMenuItem.addItem(wunderlist.language.data.add_item_method, dialogs.openSelectAddItemMethodDialog);
	extraMenuItem.addItem(wunderlist.language.data.switchdateformat, dialogs.openSwitchDateFormatDialog);
	extraMenuItem.addItem(wunderlist.language.data.sidebar_position, dialogs.openSidebarDialog);
	extraMenuItem.addItem(wunderlist.language.data.delete_prompt_menu, dialogs.openDeletePromptDialog);

	// Extras Menu
	extraMenuItem.addItem(wunderlist.language.data.reset_window_size, menu.reset_window_size); // Reset Window Size

	// Create Tutorials
	extraMenuItem.addItem(wunderlist.language.data.create_tutorials, wunderlist.database.recreateTuts);

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
		accountMenuItem.addItem(wunderlist.language.data.change_login_data, wunderlist.account.editProfile)
		accountMenuItem.addItem(wunderlist.language.data.delete_account, function() {wunderlist.account.deleteAccount()});
		accountMenuItem.addSeparatorItem();
		accountMenuItem.addItem(wunderlist.language.data.logout, function() {
			wunderlist.sync.fireSync(true);
		});
	}
	else
	{
		accountMenuItem.addItem(wunderlist.language.data.sign_in, function() {
			dialogs.closeEveryone();
			wunderlist.account.showRegisterDialog();
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
menu.switch_language = function(lang) {
	settings.save_window_position();
	Titanium.App.Properties.setString('language', lang);
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