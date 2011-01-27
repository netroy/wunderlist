var sidebar_opened_status = 'true';
var invited				  = 'false';
var wunderlist_window     = Titanium.UI.getMainWindow();

// Save the special key for OS
var shortcutkey = (Titanium.Platform.name.toLowerCase() == 'darwin') ? 'command' : 'Ctrl';
var os = Titanium.Platform.name.toLowerCase();

// Count how often the program has been started
var runtime = Titanium.App.Properties.getString('runtime', '1');
runtimeInt  = parseInt(runtime);
runtime++;
Titanium.App.Properties.setString('runtime', runtime.toString());

/**
 * Load default App Settings
 *
 * @author Dennis Schneider
 */
if (Titanium.App.Properties.hasProperty('first_run') == false)
{
	Titanium.App.Properties.setString('active_theme', 'bgone');
	Titanium.App.Properties.setString('first_run', '0');
	Titanium.App.Properties.setString('user_height', '400');
	Titanium.App.Properties.setString('user_width', '760');
	Titanium.App.Properties.setString('runtime', '1');
	Titanium.App.Properties.setString('dateformat', language.code);
	Titanium.App.Properties.setString('invited', invited.toString());
}
else
{
	// Load Window Size and Position
	currentWindow = Titanium.UI.getMainWindow();
	if (Titanium.App.Properties.getString('maximized', 'false') == 'true') {
		currentWindow.maximize();
	}
	else
	{
		currentWindow.height = parseInt(Titanium.App.Properties.getString('user_height', '400'));
		currentWindow.width  = parseInt(Titanium.App.Properties.getString('user_width',  '760'));
		var user_x = Titanium.App.Properties.getString('user_x', 'none');
		var user_y = Titanium.App.Properties.getString('user_y', 'none');

		if(user_x != 'none') currentWindow.x = parseInt(user_x);
		if(user_y != 'none') currentWindow.y = parseInt(user_y);
	}

	// Load the sidebar opened status
	sidebar_opened_status = Titanium.App.Properties.getString('sidebar_opened_status', 'true');

	// Load the invited status
	invited = Titanium.App.Properties.getString('invited', 'false');
}

var position_saved = false;

Titanium.API.addEventListener(Titanium.CLOSE, save_window_position);
Titanium.API.addEventListener(Titanium.EXIT, save_window_position);


// Change the top header color on blur
Titanium.API.addEventListener(Titanium.UNFOCUSED, function(){
	$("#top").addClass("blurred");
	$("#macmenu a").css("opacity", "0.5");
});

// Change the top header color on blur
Titanium.API.addEventListener(Titanium.FOCUSED, function(){
	$("#top").removeClass("blurred");
	$("#macmenu a").css("opacity", "1.0");

});

/**
 * Save Window Size and Position on exit
 *
 * @author Christian Reber
 */
function save_window_position()
{
	currentWindow = Titanium.UI.getMainWindow();

	if (position_saved == false && currentWindow.isMinimized() == false)
	{
		Titanium.App.Properties.setString('maximized', currentWindow.isMaximized().toString());
		Titanium.App.Properties.setString('user_height', currentWindow.height.toString());
		Titanium.App.Properties.setString('user_width', currentWindow.width.toString());
		Titanium.App.Properties.setString('user_x', currentWindow.x.toString());
		Titanium.App.Properties.setString('user_y', currentWindow.y.toString());
		position_saved = true;
		currentWindow.hide();
	}
}

/**
 * Load last opened list
 *
 * @author Daniel Marschner
 */
function load_last_opened_list()
{
	return Titanium.App.Properties.getString('last_opened_list', '1');
}

/**
 * Save last opened list
 *
 * @author Daniel Marschner
 */
function save_last_opened_list(list_id)
{
	Titanium.App.Properties.setString('last_opened_list', list_id.toString());
}

/**
 * Save last opened list
 *
 * @author Daniel Marschner
 */
function clear_last_opened_list()
{
	Titanium.App.Properties.setString('last_opened_list', '1');
}

Titanium.API.addEventListener(Titanium.CLOSE, save_sidebar_opened_status);
Titanium.API.addEventListener(Titanium.EXIT, save_sidebar_opened_status);

/**
 * Save last sidebar opened status
 *
 * @author Daniel Marschner
 */
function save_sidebar_opened_status()
{
	Titanium.App.Properties.setString('sidebar_opened_status', sidebar_opened_status.toString());
}

/**
 * Save the invited status
 *
 * @author Daniel Marschner
 */
function save_invited(value)
{
	invited = value.toString();
	Titanium.App.Properties.setString('invited', invited);
}

/**
 * Little workaround bugfix for Mac OS X (sorry, but there is no way around)
 * Shortcut Bind Command (or Ctrl) + Q
 *
 * @author Christian Reber
 */
$(function()
{
	if (os == 'darwin')
	{
		$(document).bind('keydown', shortcutkey + '+q', function (event) {
			if (listShortcutListener == 0)
				Titanium.App.exit();
		});
	}
	
});