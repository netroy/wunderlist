var updater = updater || {};

/**
 * Do all neccessary updates
 *
 * @author Daniel Marschner
 */
updater.init = function() {
	// Update to version 1.1.0
	updater.to_110();
};

/**
 * Check the version for doing the update to version 1.1.0
 *
 * @author Daniel Marschner
 */
updater.to_110 = function() {
	if (Titanium.App.Properties.hasProperty('version') == false || parseInt(Titanium.App.Properties.getString('version')) < 110)
	{
		Titanium.App.Properties.setString('version', Titanium.App.version.toString().split('.').join(''));	
		wunderlist.update_110();	
	}
};