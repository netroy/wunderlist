var confirmationDialog;
var okDialog;
var whileSyncDialog;
var cloudAppDialog;

/**
 * Generates a dialog window
 *
 * @author Daniel Marschner
 */
function generateDialog(title, html, dialogClass) {
	if(title == undefined) title = '';
	if(html == undefined) html = '';
	if(dialogClass == undefined) dialogClass = '';

	return $('<div></div>').html(html).dialog({
		autoOpen: false,
		draggable: false,
		modal: false,
		dialogClass: dialogClass,
		title: title
	});
}

/**
 * Opens a custom dialog
 *
 * @author Daniel Marschner
 */
function openDialog(customDialog) {
	$(customDialog).dialog('open');
}

/**
 * Closes a custom dialog
 *
 * @author Daniel Marschner
 */
function closeDialog(customDialog) {
	$(customDialog).dialog('close');
}

/**
 * Shows a small error dialog
 *
 * @author Christian Reber
 */
function showErrorDialog(message) {
	openDialog(generateDialog(language.data.error_occurred, '<p class="pl8">' + message + '</p>'));
}

/**
 * Shows a small confirmation dialog to inform the user
 *
 * @author Dennis Schneider
 */
function showConfirmationDialog() {
	confirmationDialog = generateDialog(language.data.account_deleted, '<p>' + language.data.account_del_successful + '</p><input class="input-button" type="submit" id="okay" value="' + language.data.okay + '" />');
	openDialog(confirmationDialog);
	$('input#okay').click(function() {closeDialog(confirmationDialog);});
}

/**
 * Show an ok dialog for data change
 *
 * @author Dennis Schneider
 */
function showOKDialog(title) {
	if(okDialog == undefined)
	{
		okDialog = $('<div></div>').dialog({
			autoOpen: true,
			draggable: false,
			modal: false,
			title: title,
			buttons: {
				'OK': function() {
					$(this).dialog('close');
				}
			}
		});
	}
	else
		openDialog(okDialog);
}

/**
 * Confirmation Dialog for Cloud App
 *
 * @author Dennis Schneider
 */
function showCloudAppDialog() {
	if(cloudAppDialog == undefined)
	{
		cloudAppDialog = $('<div><p>CloudApp allows you to share your tasks from anywhere in the world through an intuitive web interface. If you click yes, a secret URL will be generated you can send anyone of your colleagues or friends. They don\'t need a wunderlist or CloudApp account!<br><br>But be sure: If anyone knows the generated URL, your tasks are public!</p></div>').dialog({
			autoOpen  : true,
			draggable : false,
			modal     : false,
			title     : 'Are you sure to publish your tasks?',
			buttons   : {
				'No'  : function() {
					$(this).dialog('close');
				},
				'Yes' : function() {
					share.share_with_cloudapp();
					$(this).dialog('close');
				}
			}
		});
	}
	else
		openDialog(cloudAppDialog);
}

/**
 * Show a dialog when syncing and trying to logout
 *
 * @author Dennis Schneider
 */
function showWhileSyncDialog(title) {
	if(whileSyncDialog == undefined)
	{
		whileSyncDialog = $('<div></div>').dialog({
			autoOpen: true,
			draggable: false,
			modal: false,
			title: title,
			buttons: {
				'OK': function() {
					$(this).dialog('close');
				}
			}
		});
	}
	else
		openDialog(whileSyncDialog);
}