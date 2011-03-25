var Menu = Menu || {};

/**
 * Reset position of Wunderlist (Mac)
 *
 * @author Christian Reber
 */
function reset_window_size() {
	currentWindow.height = 400;
	currentWindow.width = 600;
	currentWindow.x = Math.round((screen.width / 2) - 300);
	currentWindow.y = Math.round((screen.height / 2) - 200);
}

/**
 * Initialize the whole menu
 *
 * @author Christian Reber
 * @author Dennis Schneider
 * @author Daniel Marschner
 */
Menu.initialize = function() {
	var new_menu         = Titanium.UI.createMenu();
	var accountMenuItem	 = new_menu.addItem(language.data.account);
	var languageMenuItem = new_menu.addItem(language.data.language);
	var extraMenuItem	 = new_menu.addItem(language.data.extra);

	accountMenuItem.addItem(language.data.invitation, account.showInviteDialog);
	accountMenuItem.addSeparatorItem();

	// Language Menu
	languageMenuItem.addItem('Deutsch',    function() {Menu.switch_language('de')});
	languageMenuItem.addItem('English',    function() {Menu.switch_language('en')});
	languageMenuItem.addItem('Español',    function() {Menu.switch_language('es')});
	languageMenuItem.addItem('Català',     function() {Menu.switch_language('ca')});
	languageMenuItem.addItem('Français',   function() {Menu.switch_language('fr')});
	languageMenuItem.addItem('Polski',     function() {Menu.switch_language('pl')});
	languageMenuItem.addItem('Português',  function() {Menu.switch_language('pt')});
	languageMenuItem.addItem('Italiano',   function() {Menu.switch_language('it')});
	languageMenuItem.addItem('Slovensky',  function() {Menu.switch_language('sk')});
	languageMenuItem.addItem('Nederlands', function() {Menu.switch_language('nl')});
	languageMenuItem.addItem('Pусский',    function() {Menu.switch_language('ru')});
	languageMenuItem.addItem('Українське', function() {Menu.switch_language('uk')});
	languageMenuItem.addItem('Dansk',      function() {Menu.switch_language('da')});
	languageMenuItem.addItem('České',      function() {Menu.switch_language('cs')});
	languageMenuItem.addItem('中文',        function() {Menu.switch_language('zh')});
	languageMenuItem.addItem('Türkçe',     function() {Menu.switch_language('tr')});
	languageMenuItem.addItem('عربي',        function() {Menu.switch_language('ar')});
	languageMenuItem.addItem('Svenska',    function() {Menu.switch_language('se')});
	languageMenuItem.addItem('日本語',      function() {Menu.switch_language('ja')});
	languageMenuItem.addItem('Magyar',     function() {Menu.switch_language('hu')});
	languageMenuItem.addItem('한국어',      function() {Menu.switch_language('ko')});
	languageMenuItem.addItem('Hrvatski',   function() {Menu.switch_language('hr')});
	languageMenuItem.addItem('Norsk',      function() {Menu.switch_language('no')});
	languageMenuItem.addItem('Српска',     function() {Menu.switch_language('sr')});
	languageMenuItem.addItem('Galego',     function() {Menu.switch_language('gl')});
	languageMenuItem.addItem('Română',     function() {Menu.switch_language('ro')});
	languageMenuItem.addItem('Português (Brazilian)',     function() {Menu.switch_language('pt-br')});

	languageMenuItem.addSeparatorItem();
	languageMenuItem.addItem(language.data.switchdateformat, openSwitchDateFormatDialog);

	extraMenuItem.addItem(language.data.settings, openSettingsDialog);

	// Extras Menu
	extraMenuItem.addItem(language.data.reset_window_size, reset_window_size); // Reset Window Size

	// Create Tutorials
	extraMenuItem.addItem(language.data.create_tutorials, wunderlist.recreateTutorials);

	extraMenuItem.addSeparatorItem();
	extraMenuItem.addItem('Knowledge Base',    function() {Titanium.Desktop.openURL('http://support.6wunderkinder.com/kb')});
	extraMenuItem.addItem(language.data.credits,         openCreditsDialog);  // About Us Dialog
	extraMenuItem.addItem(language.data.backgrounds,     openBackgroundsDialog);  // Background Credits
	extraMenuItem.addItem(language.data.wunderkinder,    function() {Titanium.Desktop.openURL('http://www.6wunderkinder.com')});
	extraMenuItem.addItem(language.data.wunderkinder_tw, function() {Titanium.Desktop.openURL('http://www.twitter.com/6Wunderkinder')});
	extraMenuItem.addItem(language.data.wunderkinder_fb, function() {Titanium.Desktop.openURL('http://www.facebook.com/6Wunderkinder')});
	extraMenuItem.addSeparatorItem();
	extraMenuItem.addItem(language.data.changelog, function() {Titanium.Desktop.openURL('http://www.6wunderkinder.com/wunderlist/changelog')});

	if(wunderlist.isUserLoggedIn())
	{
		accountMenuItem.addItem(language.data.change_login_data, account.editProfile)
		accountMenuItem.addItem(language.data.delete_account, function() {account.deleteAccount()});
		accountMenuItem.addSeparatorItem();
		accountMenuItem.addItem(language.data.logout, function() {
			sync.fireSync(true);
		});
	}
	else
	{
		accountMenuItem.addItem(language.data.sign_in, account.showRegisterDialog);
	}

	Menu.remove();
	Titanium.UI.setMenu(new_menu);
}

/**
 * Creates a tray icon with menu
 *
 * @author Dennis Schneider
 */
Menu.initializeTrayIcon = function() {
	var os = Titanium.Platform.name.toLowerCase();

	// Only for windows and linux
	if(os != 'darwin')
	{
		// Create the tray icon and menu and prevent the application from exit on 'x'
		var wunderlistWindow = Menu.preventCloseEvent();

		if (os != 'darwin')
		{
			var trayIconPath = Titanium.API.Application.getResourcesPath() + '/images/traywin.png';
		} 
		else
		{
			var trayIconPath = Titanium.API.Application.getResourcesPath() + '/images/traymac.png';
		}

		var trayIcon     = Titanium.UI.addTray(trayIconPath, function () {
			Menu.showWindow(wunderlistWindow)
		});
		trayIcon.setHint('Wunderlist - todo application')

		var trayMenu         = Titanium.UI.createMenu();
		var trayExitItem	 = trayMenu.addItem(language.data.exit_wunderlist, Menu.exitWunderlist);
		trayIcon.setMenu(trayMenu);
	}
	else
	{
		var wunderlistWindow = Titanium.UI.getCurrentWindow();	
	
		wunderlistWindow.addEventListener(Titanium.CLOSE, function(event) {
			sync.fireSync(false, true);
			event.stopPropagation();
		});	
	}
}

/**
 * Own exit method for the app
 *
 * @author Dennis Schneider
 */
Menu.exitWunderlist = function() {
	// If the user is logged in and internet is available
	if(wunderlist.isUserLoggedIn() && Titanium.Network.online == true)
	{
		sync.fireSync(false, true);
	}
	else
	{
		Titanium.App.exit()
	}

	Titanium.UI.Tray.remove();
}
 

/**
 * Prevent standard close event
 *
 * @author Dennis Schneider
 */
Menu.preventCloseEvent = function() {
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
Menu.showWindow = function(wunderlistWindow) {
	wunderlistWindow.show();
}

/**
 * Switch language setting
 *
 * @author Dennis Schneider
 */
Menu.switch_language = function(lang) {
	Titanium.App.Properties.setString('language', lang);
	Titanium.App.restart();
}

/**
 * Remove the menu
 *
 * @author Dennis Schneider
 */
Menu.remove = function() {
	if(Titanium.UI.Menu != undefined)
	{
		Titanium.UI.Menu.clear();
	}
}

/**
 * Opens the credits dialog
 *
 * @author Daniel Marschner
 */
function openCreditsDialog() {
	dialogs.openDialog(dialogs.generateDialog('What is Wunderlist?', html.generateCreditsDialogHTML(), 'dialog-credits'));
}

function openBackgroundsDialog() {
	dialogs.openDialog(dialogs.generateDialog('Background Credits', html.generateBackgroundsDialogHTML(), 'background-credits'));
}

var switchDateFormatDialog;

/**
 * Open the switch date format dialog
 *
 * @author Dennis Schneider
 */
function openSwitchDateFormatDialog() {
	if(switchDateFormatDialog == undefined || $(switchDateFormatDialog).dialog('isOpen') == false)
		switchDateFormatDialog = dialogs.generateDialog(language.data.switchdateformat, html.generateSwitchDateFormatHTML());

	dialogs.openDialog(switchDateFormatDialog, 'switchdateformat-credits');

	$('input#cancel-dateformat').die();
	$('input#confirm-dateformat').die();

	var dateformat = Titanium.App.Properties.getString('dateformat', language.code);
	$('div.radios#date-format-radios input#date_' + dateformat).attr('checked', 'checked');

	var weekstart_day = Titanium.App.Properties.getString('weekstartday', '1');
	$('div.radios#week-start-day-radios input#startday_' + weekstart_day).attr('checked', 'checked');

	$('input#cancel-dateformat').live('click', function() {
		$(switchDateFormatDialog).dialog('close')
	});

	$('input#confirm-dateformat').live('click', function() {
		var new_dateformat = $('div.radios#date-format-radios input:checked').val();
		var weekstart_day  = $('div.radios#week-start-day-radios input:checked').val();

		Titanium.App.Properties.setString('weekstartday', weekstart_day.toString());
		Titanium.App.Properties.setString('dateformat', new_dateformat);

		$('div.add input.datepicker').datepicker('destroy');
		html.createDatepicker();
		html.make_timestamp_to_string();

		$(switchDateFormatDialog).dialog('close')
	});
}

var settingsDialog;

/**
 * Open the switch date format dialog
 *
 * @author Dennis Schneider
 */
function openSettingsDialog() {

	if(settingsDialog == undefined || $(settingsDialog).dialog('isOpen') == false)
	{
		settingsDialog = dialogs.generateDialog(language.data.settings, html.generateSettingsHTML());
	}

	dialogs.openDialog(settingsDialog);

	$('input#cancel-settings').die();
	$('input#confirm-settings').die();

	var task_delete = Titanium.App.Properties.getString('task_delete', '1');
	$('div.radios#task-delete-radios input#task_delete_' + task_delete).attr('checked', 'checked');

	$('input#cancel-settings').live('click', function() {
		$(settingsDialog).dialog('close')
	});

	$('input#confirm-settings').live('click', function() {
		var new_task_delete = $('div.radios#task-delete-radios input:checked').val();
		Titanium.App.Properties.setString('task_delete', new_task_delete.toString());
		$(settingsDialog).dialog('close')
	});
}
