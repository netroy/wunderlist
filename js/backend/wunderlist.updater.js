wunderlist.updater = wunderlist.updater || {};

/**
 * Check if the current version of Wunderlist is the newest one
 *
 * @author Daniel Marschner
 */
wunderlist.updater.checkVersion = function() {
	$.ajax({
		url     : 'https://s3.amazonaws.com/wunderlist/version.txt',
		type    : 'GET',
		success : function(response_data, text, xhrobject) {
			var response   = JSON.parse(xhrobject.responseText);
			var curVersion = parseInt(wunderlist.str_replace('.', '', wunderlist.version))
			var newVersion = parseInt(wunderlist.str_replace('.', '', response.version))
			
			if (response.version != undefined && curVersion != newVersion && newVersion > curVersion)
			{
				var updateHTML = '<p>' + wunderlist.replace_links(response.message) + '</p>';
				dialogs.openDialog(dialogs.generateDialog('Update Message', updateHTML));
			}
		}
	});
};