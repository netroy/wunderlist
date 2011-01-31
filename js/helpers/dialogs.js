var dialogs = dialogs || {};

// Dialogs
dialogs.confirmationDialog  = null;
dialogs.okDialog            = null;
dialogs.shareOwnEmailDialog = null;
dialogs.deleteDialog        = null;
dialogs.whileSyncDialog     = null;
dialogs.cloudAppDialog      = null;
dialogs.shareSuccessDialog  = null;
dialogs.modalDialog         = false;

/**
 * Generates a dialog window
 *
 * @author Daniel Marschner
 */
dialogs.generateDialog = function(title, html_code, dialogClass) {
	if(title == undefined) title = '';
	if(html_code == undefined) html = '';
	if(dialogClass == undefined) dialogClass = '';

	return $('<div></div>').html(html_code).dialog({
		autoOpen: false,
		draggable: false,
		resizable: false,
		modal: true,
		dialogClass: dialogClass,
		title: title
	});
}

/**
 * Opens a custom dialog
 *
 * @author Daniel Marschner
 */
dialogs.openDialog = function(customDialog) {
	$(customDialog).dialog('open');
	dialogs.modalDialog = true;
}

/**
 * Closes a custom dialog
 *
 * @author Daniel Marschner
 */
dialogs.closeDialog = function(customDialog) {
	$(customDialog).dialog('close');
	dialogs.modalDialog = false;
}

/**
 * Shows a small error dialog
 *
 * @author Christian Reber
 */
dialogs.showErrorDialog = function(message) {
	dialogs.openDialog(dialogs.generateDialog(language.data.error_occurred, '<p class="pl8">' + message + '</p>'));
}

/**
 * Shows a small confirmation dialog to inform the user
 *
 * @author Dennis Schneider
 */
dialogs.showConfirmationDialog = function() {
	dialogs.confirmationDialog = dialogs.generateDialog(language.data.account_deleted, '<p>' + language.data.account_del_successful + '</p><input class="input-button" type="submit" id="okay" value="' + language.data.okay + '" />');
	dialogs.openDialog(dialogs.confirmationDialog);
	$('input#okay').click(function() {dialogs.closeDialog(dialogs.confirmationDialog);});
}

dialogs.showShareOwnEmailDialog = function() {

	if(dialogs.shareOwnEmailDialog == undefined)
	{
		dialogs.shareOwnEmailDialog = $('<div></div>').dialog({
			autoOpen: true,
			draggable: false,
			resizable: false,
			modal: true,
			title: language.data.share_own_email,
			buttons: {
				'OK': function() {
					$(this).dialog('close');
				}
			}
		});
	}
	else
	{
		dialogs.openDialog(dialogs.shareOwnEmailDialog);
	}
}

/**
 * Show an ok dialog for data change
 *
 * @author Dennis Schneider
 */
dialogs.showOKDialog = function(title) {

	if(dialogs.okDialog == undefined)
	{
		dialogs.okDialog = $('<div></div>').dialog({
			autoOpen: true,
			draggable: false,
			modal: true,
			resizable: false,
			title: title,
			buttons: {
				'OK': function() {
					$(this).dialog('close');
				}
			}
		});
	}
	else
	{
		dialogs.openDialog(dialogs.okDialog);
	}
}

/**
 * Show a dialog when sharing was successful
 *
 * @author Dennis Schneider
 */
dialogs.showSharedSuccessDialog = function(title) {
	
	if(dialogs.shareSuccessDialog == undefined)
	{
		dialogs.shareSuccessDialog = $('<div></div>').dialog({
			autoOpen: true,
			draggable: false,
			modal: true,
			title: title,
			resizable: false,
			buttons: {
				'OK': function() {
					$(this).dialog('close');
				}
			}
		});
	}
	else
	{
		dialogs.openDialog(dialogs.shareSuccessDialog);
	}
}

/**
 * Show an ok dialog deleting a shared list user
 *
 * @author Dennis Schneider
 */
dialogs.showDeletedDialog = function(title) {

	if(dialogs.deleteDialog == undefined)
	{
		dialogs.deleteDialog = $('<div></div>').dialog({
			autoOpen  : true,
			draggable : false,
			modal     : true,
			title     : title,
			resizable: false,
			buttons   : {
				'OK'  : function() {
					$(this).dialog('close');
				}
			}
		});
	}
	else
	{
		dialogs.openDialog(dialogs.deleteDialog);
	}
}

/**
 * Confirmation Dialog for Cloud App
 *
 * @author Dennis Schneider
 */
dialogs.showCloudAppDialog = function() {
	if(dialogs.cloudAppDialog == undefined)
	{
		dialogs.cloudAppDialog = $('<div><p>' + language.data.cloudapp_1 + '</p><p class="small">' + language.data.cloudapp_2 + '</p></div>').dialog({
			autoOpen  : true,
			draggable : false,
			resizable: false,
			modal     : true,
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
	{
		dialogs.openDialog(dialogs.cloudAppDialog);
	}
}

/**
 * Show a dialog when syncing and trying to logout
 *
 * @author Dennis Schneider
 */
dialogs.showWhileSyncDialog = function(title) {
	if(dialogs.whileSyncDialog == undefined)
	{
		dialogs.whileSyncDialog = $('<div></div>').dialog({
			autoOpen  : true,
			draggable : false,
			resizable: false,
			modal     : true,
			title     : title,
			buttons   : {
				'OK'  : function() {
					$(this).dialog('close');
				}
			}
		});
	}
	else
	{
		dialogs.openDialog(dialogs.whileSyncDialog);
	}
}