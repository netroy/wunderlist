/**
 * wunderlist.settings.js
 *
 * Class for handling all the settings
 * 
 * @author Christian Reber, Dennis Schneider, Daniel Marschner
 */
var settings = settings || {}

settings.init = function() {
	settings.sidebar_opened_status = 'true';
	settings.invited               = 'false';
	settings.shortcutkey           = (Titanium.Platform.name.toLowerCase() == 'darwin') ? 'command' : 'Ctrl';
	
	// The timeout for sending a request e. g. with AJAX
	settings.REQUEST_TIMEOUT = 100 * 1000;	
	
	// Count how often the program has been started
	var runtime = Titanium.App.Properties.getString('runtime', '1');
	runtimeInt  = parseInt(runtime);
	runtime++;
	Titanium.App.Properties.setString('runtime', runtime.toString());
	
	settings.os = Titanium.Platform.name.toLowerCase();
	
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
		Titanium.App.Properties.setString('dateformat', wunderlist.language.code);
		Titanium.App.Properties.setString('delete_prompt', '1');
		Titanium.App.Properties.setString('invited', settings.invited.toString());
	}
	else
	{
		// Load Window Size and Position
		var currentWindow = Titanium.UI.getMainWindow();
		
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
		settings.sidebar_opened_status = Titanium.App.Properties.getString('settings.sidebar_opened_status', 'true');
	
		// Load the invited status
		settings.invited = Titanium.App.Properties.getString('invited', 'false');
	}
	
	settings.position_saved = false;
	
	Titanium.API.addEventListener(Titanium.CLOSE, settings.save_window_position);
	Titanium.API.addEventListener(Titanium.EXIT,  settings.save_window_position);
	
	Titanium.API.addEventListener(Titanium.CLOSE, settings.save_sidebar_opened_status);
	Titanium.API.addEventListener(Titanium.EXIT,  settings.save_sidebar_opened_status);		
	
	// Change the top header color on blur
	Titanium.API.addEventListener(Titanium.UNFOCUSED, function() {
		$("body").css("border-top", "1px solid #b9b9b9");
	});
	
	// Change the top header color on blur
	Titanium.API.addEventListener(Titanium.FOCUSED, function() {
		$("body").css("border-top", "1px solid #666");
	
	});		
};

// GET the sidebar position
settings.getSidebarPosition = function() {
	return Titanium.App.Properties.getString('sidebar_position', 'right');
};

// GET the selected datformat
settings.getDateformat = function() {
	return Titanium.App.Properties.getString('dateformat', wunderlist.language.code);
};

// GET the selected week start day
settings.getWeekstartday = function() {
	return Titanium.App.Properties.getString('weekstartday', '1');
};

// GET the selected week start day
settings.getDeleteprompt = function() {
	return parseInt(Titanium.App.Properties.getString('delete_prompt', '1'));
};

/**
 * Save Window Size and Position on exit
 *
 * @author Christian Reber
 */
settings.save_window_position = function() {
	var currentWindow = Titanium.UI.getMainWindow();

	if (settings.position_saved == false && currentWindow.isMinimized() == false)
	{
		Titanium.App.Properties.setString('maximized',   currentWindow.isMaximized().toString());
		Titanium.App.Properties.setString('user_height', currentWindow.height.toString());
		Titanium.App.Properties.setString('user_width',  currentWindow.width.toString());
		Titanium.App.Properties.setString('user_x',      currentWindow.x.toString());
		Titanium.App.Properties.setString('user_y',      currentWindow.y.toString());
		settings.position_saved = true;
	}
};

/**
 * Save Note Window Size and Position on close
 *
 * @author Daniel Marschner
 */
settings.save_note_window_position = function(noteWindow) {
	if (noteWindow.isMinimized() == false)
	{
		Titanium.App.Properties.setString('note_maximized',   noteWindow.isMaximized().toString());
		Titanium.App.Properties.setString('note_user_height', noteWindow.height.toString());
		Titanium.App.Properties.setString('note_user_width',  noteWindow.width.toString());
		Titanium.App.Properties.setString('note_user_x',      noteWindow.x.toString());
		Titanium.App.Properties.setString('note_user_y',      noteWindow.y.toString());
	}
};

/**
 * Load last opened list
 *
 * @author Daniel Marschner
 */
settings.load_last_opened_list = function() {
	return Titanium.App.Properties.getString('last_opened_list', '1');
}

/**
 * Save last opened list
 *
 * @author Daniel Marschner
 */
settings.save_last_opened_list = function(list_id) {
	Titanium.App.Properties.setString('last_opened_list', list_id.toString());
};

/**
 * Save last opened list
 *
 * @author Daniel Marschner
 */
settings.clear_last_opened_list = function() {
	Titanium.App.Properties.setString('last_opened_list', '1');
};

/**
 * Save last sidebar opened status
 *
 * @author Daniel Marschner
 */
settings.save_sidebar_opened_status = function() {
	Titanium.App.Properties.setString('sidebar_opened_status', settings.sidebar_opened_status.toString());
};

/**
 * Save the invited status
 *
 * @author Daniel Marschner
 */
settings.save_invited = function(value) {
	settings.invited = value.toString();
	Titanium.App.Properties.setString('invited', settings.invited);
};