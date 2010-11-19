var Menu = Menu || {};

/**
 * Reset position of wunderlist (Mac)
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
	languageMenuItem.addItem('Català',     function() { Menu.switch_language('ca') });
	languageMenuItem.addItem('Dansk',      function() { Menu.switch_language('da') });
	languageMenuItem.addItem('Deutsch',    function() { Menu.switch_language('de') });
	languageMenuItem.addItem('English',    function() { Menu.switch_language('en') });
	languageMenuItem.addItem('Español',    function() { Menu.switch_language('es') });
	languageMenuItem.addItem('Français',   function() { Menu.switch_language('fr') });
	languageMenuItem.addItem('Italiano',   function() { Menu.switch_language('it') });
	languageMenuItem.addItem('Nederlands', function() { Menu.switch_language('nl') });
	languageMenuItem.addItem('Polski',     function() { Menu.switch_language('pl') });
	languageMenuItem.addItem('Português',  function() { Menu.switch_language('pt') });
	languageMenuItem.addItem('Slovensky',  function() { Menu.switch_language('sk') });

	languageMenuItem.addSeparatorItem();
	languageMenuItem.addItem(language.data.switchdateformat, openSwitchDateFormatDialog);

	// Extras Menu
	extraMenuItem.addItem(language.data.reset_window_size, reset_window_size); // Reset Window Size

	// Create Tutorials
	extraMenuItem.addItem(language.data.create_tutorials, wunderlist.recreateTutorials);

	extraMenuItem.addSeparatorItem();
	extraMenuItem.addItem(language.data.credits, openCreditsDialog);  // About Us Dialog
	extraMenuItem.addItem(language.data.backgrounds, openBackgroundsDialog);  // Background Credits
	extraMenuItem.addItem(language.data.wunderkinder, function() { Titanium.Desktop.openURL('http://www.6wunderkinder.com') });
	extraMenuItem.addItem(language.data.wunderkinder_tw, function() { Titanium.Desktop.openURL('http://www.twitter.com/6Wunderkinder') });
	extraMenuItem.addItem(language.data.wunderkinder_fb, function() { Titanium.Desktop.openURL('http://www.facebook.com/6Wunderkinder') });
	extraMenuItem.addSeparatorItem();
	extraMenuItem.addItem(language.data.changelog, function() { Titanium.Desktop.openURL('http://www.6wunderkinder.com/wunderlist/changelog') });

	if(wunderlist.isUserLoggedIn())
	{
		accountMenuItem.addItem(language.data.change_login_data, account.editProfile)
		accountMenuItem.addItem(language.data.delete_account, function() { account.deleteAccount() });
		accountMenuItem.addSeparatorItem();
		accountMenuItem.addItem(language.data.logout, account.logout);
	}
	else
	{
		accountMenuItem.addItem(language.data.sign_in, account.showRegisterDialog);
	}

	Menu.remove();
	Titanium.UI.setMenu(new_menu);
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
	if(Titanium.UI.Menu != undefined) {
		Titanium.UI.Menu.clear();
	}
}

/**
 * Opens the credits dialog
 *
 * @author Daniel Marschner
 */
function openCreditsDialog() {
	openDialog(generateDialog('What is wunderlist?', generateCreditsDialogHTML(), 'dialog-credits'));
}

function openBackgroundsDialog() {
	openDialog(generateDialog('Background Credits', generateBackgroundsDialogHTML(), 'background-credits'));
}

var switchDateFormatDialog;

function openSwitchDateFormatDialog() {
	if(switchDateFormatDialog == undefined || $(switchDateFormatDialog).dialog('isOpen') == false)
		switchDateFormatDialog = generateDialog(language.data.switchdateformat, generateSwitchDateFormatHTML());

	openDialog(switchDateFormatDialog, 'switchdateformat-credits');

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
		createDatepicker();
		make_timestamp_to_string();

		$(switchDateFormatDialog).dialog('close')
	});
}