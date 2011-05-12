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
dialogs.deleteTaskDialog    = null;

// On startup bind the dialolgclose event
$(function() { 
	$("[role='dialog']").live("dialogclose", function(event, ui) {
		$(this).dialog('destroy');
		$(this).children().remove();
		$(this).remove();
		
		switchDateFormatDialog = undefined;
		sidebarDialog          = undefined;
		deletePromptDialog     = undefined;
	});
});

/**
 * Close all dialogs in the system
 *
 * @author Daniel Marschner
 */
dialogs.closeEveryone = function() {
	$('[role="dialog"]').dialog('destroy');
	$('[role="dialog"]').children().remove();
	$('[role="dialog"]').remove();
	
	switchDateFormatDialog = undefined;
	sidebarDialog          = undefined;
	deletePromptDialog     = undefined;
};

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
		autoOpen      : false,
		draggable     : false,
		resizable     : false,
		modal         : true,
		dialogClass   : dialogClass,
		title         : title,
		closeOnEscape : true
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
	dialogs.openDialog(dialogs.generateDialog(wunderlist.language.data.error_occurred, '<p class="pl8">' + message + '</p>'));
}

/**
 * Shows a small confirmation dialog to inform the user
 *
 * @author Dennis Schneider
 */
dialogs.showConfirmationDialog = function() {
	dialogs.confirmationDialog = dialogs.generateDialog(wunderlist.language.data.account_deleted, '<p>' + wunderlist.language.data.account_del_successful + '</p><input class="input-button" type="submit" id="okay" value="' + wunderlist.language.data.okay + '" />');
	dialogs.openDialog(dialogs.confirmationDialog);
	$('input#okay').click(function() {dialogs.closeDialog(dialogs.confirmationDialog);});
	$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');
}

dialogs.showShareOwnEmailDialog = function() {
	dialogs.shareOwnEmailDialog = $('<div></div>').dialog({
		autoOpen: true,
		draggable: false,
		resizable: false,
		modal: true,
		closeOnEscape: true,
		title: wunderlist.language.data.share_own_email,
		buttons: {
			'OK': function() {
				$(this).dialog('close');
			}
		}
	});

	dialogs.openDialog(dialogs.shareOwnEmailDialog);
	
	$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');	
}

/**
 * Show an ok dialog for data change
 *
 * @author Dennis Schneider
 */
dialogs.showOKDialog = function(title) {
	dialogs.okDialog = $('<div></div>').dialog({
		autoOpen: true,
		draggable: false,
		modal: true,
		resizable: false,
		title: title,
		closeOnEscape: true,
		buttons: {
			'OK': function() {
				$(this).dialog('close');
			}
		}
	});
	
	dialogs.openDialog(dialogs.okDialog);
	
	$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');	
}

/**
 * Show a dialog when sharing was successful
 *
 * @author Dennis Schneider
 */
dialogs.showSharedSuccessDialog = function(title) {
	dialogs.shareSuccessDialog = $('<div></div>').dialog({
		autoOpen: true,
		draggable: false,
		modal: true,
		title: title,
		resizable: false,
		closeOnEscape: true,
		buttons: {
			'OK': function() {
				$(this).dialog('close');
			}
		}
	});

	dialogs.openDialog(dialogs.shareSuccessDialog);
	
	$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');	
}

/**
 * Show an ok dialog deleting a shared list user
 *
 * @author Dennis Schneider
 */
dialogs.showDeletedDialog = function(title, content) {
	if (content == undefined)
	{
		content = '';
	}

	dialogs.deleteDialog = $('<div><p>' + content +  '</p></div>').dialog({
		autoOpen  : true,
		draggable : false,
		modal     : true,
		title     : title,
		resizable : false,
		closeOnEscape: true,
		buttons   : {
			'OK'  : function() {
				$(this).dialog('close');
			}
		}
	});
	
	dialogs.openDialog(dialogs.deleteDialog);
	
	$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');	
}

/**
 * Confirmation Dialog for Cloud App
 *
 * @author Dennis Schneider
 */
dialogs.showCloudAppDialog = function() {
	var buttons = {};
	buttons[wunderlist.language.data.no]  = function() { $(this).dialog('close'); };
	buttons[wunderlist.language.data.yes] = function() {
		share.share_with_cloudapp();
		$(this).dialog('close');
	};

	dialogs.cloudAppDialog = $('<div><p>' + wunderlist.language.data.cloudapp_1 + '</p><p class="small">' + wunderlist.language.data.cloudapp_2 + '</p></div>').dialog({
		autoOpen      : true,
		draggable     : false,
		resizable     : false,
		dialogClass   : 'dialog-cloudapp',
		modal         : true,
		closeOnEscape : true,
		title         : wunderlist.language.data.cloudapp_sharing,
		buttons       : buttons
	});	
	
	dialogs.openDialog(dialogs.cloudAppDialog);		
	
	$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');	
}

/**
 * Show a dialog when syncing and trying to logout
 *
 * @author Dennis Schneider
 */
dialogs.showWhileSyncDialog = function(title) {
	dialogs.whileSyncDialog = $('<div></div>').dialog({
		autoOpen  : true,
		draggable : false,
		resizable: false,
		modal     : true,
		closeOnEscape: true,
		title     : title,
		buttons   : {
			'OK'  : function() {
				$(this).dialog('close');
			}
		}
	});

	dialogs.openDialog(dialogs.whileSyncDialog);
	
	$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');
}

/**
 * Open a prompt asking for the deletion of a task
 *
 * @author Dennis Schneider, Daniel Marschner
 */
dialogs.openTaskDeleteDialog = function(deleteElement) {
	var buttons = {};
	buttons[wunderlist.language.data.delete_task_no]  = function() { $(this).dialog('close'); };
	buttons[wunderlist.language.data.delete_task_yes] = function() {
		tasks.deletes(deleteElement);
		dialogs.closeDialog(dialogs.deleteTaskDialog);
	};

	dialogs.deleteTaskDialog = $('<div></div>').dialog({
		autoOpen    : false,
		draggable   : false,
		modal       : true,
		closeOnEscape: true,
		dialogClass : 'dialog-delete-task',
		title       : wunderlist.language.data.delete_task_question,
		buttons     : buttons,
		open        : function(event, ui) {
			$('.ui-dialog-buttonset button:last').focus();
			$('.ui-dialog-buttonset button:last').addClass("input-bold");
		}
	});

	dialogs.openDialog(dialogs.deleteTaskDialog);
	
	$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');
};

/**
 * Open a prompt asking for the deletion of a list
 *
 * @author Dennis Schneider
 */
dialogs.createDeleteListDialog = function(listId, listElement) {	
	var buttonOptions = {};
	buttonOptions[wunderlist.language.data.list_delete_no]  = function() { $(this).dialog('close'); $('a.list input').focus(); };
	buttonOptions[wunderlist.language.data.list_delete_yes] = function() { if (listId != 1) deleteList(listId, listElement); $(this).dialog('close'); };

	delete_dialog = $('<div></div>').dialog({
		autoOpen    : false,
		modal       : true,
		resizable   : false,
		draggable   : false,
		closeOnEscape: true,
		dialogClass : 'dialog-delete-list',
		title       : wunderlist.language.data.delete_list_question,
		buttons     : buttonOptions,
		open        : function() {
			$('.ui-dialog-buttonset button:last').focus();
		}
	});
	
	dialogs.openDialog(delete_dialog);
	
	$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');
};

/**
 * Open the switch date format dialog
 *
 * @author Dennis Schneider
 */
dialogs.openSwitchDateFormatDialog = function() {
	if ($("[role='dialog']").length == 0)
	{
		dialogs.switchDateFormatDialog = dialogs.generateDialog(wunderlist.language.data.switchdateformat, html.generateSwitchDateFormatHTML());
		dialogs.openDialog(dialogs.switchDateFormatDialog, 'switchdateformat-credits');
		
		$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');	

		$('input#cancel-dateformat').die();
		$('input#confirm-dateformat').die();
	
		var dateformat = settings.getDateformat();
		$('div.radios#date-format-radios input#date_' + dateformat).attr('checked', 'checked');
	
		var weekstart_day = settings.getWeekstartday();
		$('div.radios#week-start-day-radios input#startday_' + weekstart_day).attr('checked', 'checked');
	
		$('input#cancel-dateformat').live('click', function() {
			dialogs.closeDialog(dialogs.switchDateFormatDialog);
		});
	
		$('input#confirm-dateformat').live('click', function() {
			var new_dateformat = $('div.radios#date-format-radios input:checked').val();
			var weekstart_day  = $('div.radios#week-start-day-radios input:checked').val();
	
			Titanium.App.Properties.setString('weekstartday', weekstart_day.toString());
			Titanium.App.Properties.setString('dateformat', new_dateformat);
	
			$('div.add input.datepicker').datepicker('destroy');
			html.createDatepicker();
			html.make_timestamp_to_string();
	
			dialogs.closeDialog(dialogs.switchDateFormatDialog);
		});
	}
}

/**
 * Open the switch date format dialog
 *
 * @author Dennis Schneider
 */
dialogs.openSidebarDialog = function() {
	if ($("[role='dialog']").length == 0)
	{
		dialogs.sidebarDialog = dialogs.generateDialog(wunderlist.language.data.sidebar_position, html.generateSidebarHTML());
		dialogs.openDialog(dialogs.sidebarDialog);

		$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');	
	
		$('input#cancel-settings').die();
		$('input#confirm-settings').die();
	
		var sidebar_position = (Titanium.App.Properties.getString('sidebar_position', 'right') == 'right') ? 0 : 1;
		$('div.radios#sidebar-position-radios input#sidebar_position_' + sidebar_position).attr('checked', 'checked');
	
		$('input#cancel-settings').live('click', function() {
			dialogs.closeDialog(dialogs.sidebarDialog);
		});
	
		$('input#confirm-settings').live('click', function() {
			var new_sidebar_position = ($('div.radios#sidebar-position-radios input:checked').val() == 0) ? 'right' : 'left';
			Titanium.App.Properties.setString('sidebar_position', new_sidebar_position);
				
			sidebar.initPosition();
						
			dialogs.closeDialog(dialogs.sidebarDialog);
		});
	}
};

/**
 * Open the delete prompt settings dialog
 *
 * @author Dennis Schneider
 */
dialogs.openDeletePromptDialog = function() {
	if ($("[role='dialog']").length == 0)
	{
		dialogs.deletePromptDialog = dialogs.generateDialog(wunderlist.language.data.delete_prompt_menu, html.generateDeletePromptHTML());
		dialogs.openDialog(dialogs.deletePromptDialog);
		
		$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');	
		
		$('input#cancel-settings').die();
		$('input#confirm-settings').die();	
		
		var delete_prompt = Titanium.App.Properties.getString('delete_prompt', '1');
		$('div.radios#task-delete-radios input#task_delete_' + delete_prompt).attr('checked', 'checked');
		
		$('input#cancel-settings').live('click', function() {
			dialogs.closeDialog(dialogs.deletePromptDialog);
		});
		
		$('input#confirm-settings').live('click', function() {
			var new_delete_prompt = $('div.radios#task-delete-radios input:checked').val();
			Titanium.App.Properties.setString('delete_prompt', new_delete_prompt.toString());		
			dialogs.closeDialog(dialogs.deletePromptDialog);
		});	
	}
};

/**
 * Open a dialog to set the shortcut for adding tasks and lists
 *
 * @author Daniel Marschner
 */
dialogs.openSelectAddItemMethodDialog = function() {
	if ($("[role='dialog']").length == 0)
	{
		dialogs.addItemMethodDialog = dialogs.generateDialog(wunderlist.language.data.add_item_method, html.generateAddItemMethodHTML());
		dialogs.openDialog(dialogs.addItemMethodDialog);
		
		$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');	
		
		$('input#cancel-settings').die();
		$('input#confirm-settings').die();	
		
		var add_item_method = Titanium.App.Properties.getString('add_item_method', '0');
		$('div.radios#add-item-method-radios input#add_item_method_' + add_item_method).attr('checked', 'checked');
		
		$('input#cancel-settings').live('click', function() {
			dialogs.closeDialog(dialogs.addItemMethodDialog);
		});
		
		$('input#confirm-settings').live('click', function() {
			var new_add_item_method = $('div.radios#add-item-method-radios input:checked').val();
			Titanium.App.Properties.setString('add_item_method', new_add_item_method.toString());		
			dialogs.closeDialog(dialogs.addItemMethodDialog);
		});	
	}
};

/**
 * Help dialog for the shortcuts
 *
 * @author Daniel Marschner
 */
dialogs.showHelpDialog = function() {
	var shortcutPrefix     = settings.shortcutkey + ' + ';
	var deleteListShortcut = (settings.os === 'darwin') ? shortcutPrefix + wunderlist.language.data.hotkey_help_backspace : wunderlist.language.data.hotkey_help_del;
	var helpHTML  = '<p><b>' + shortcutPrefix + 'L:</b> ' + wunderlist.language.data.hotkey_help_list + '</p>';
		helpHTML += '<p><b>' +  deleteListShortcut  + ':</b> ' + wunderlist.language.data.hotkey_help_delete + '</p>';
		helpHTML += '<p><b>' + shortcutPrefix + 'I:</b> ' + wunderlist.language.data.hotkey_help_inbox + '</p>';
	    helpHTML += '<p><b>' + wunderlist.language.data.hotkey_help_updown_key + ':</b> ' + wunderlist.language.data.hotkey_help_updown + '</p>';
	    helpHTML += '<p><b>' + shortcutPrefix + 'T/N:</b> ' + wunderlist.language.data.hotkey_help_task + '</p>';
	    helpHTML += '<p><b>' + shortcutPrefix + 'F:</b> ' + wunderlist.language.data.hotkey_help_search + '</p>';
	    helpHTML += '<p><b>' + shortcutPrefix + '1-8:</b> ' + wunderlist.language.data.hotkey_help_filters + '</p>';
	    helpHTML += '<p><b>' + shortcutPrefix + 'B:</b> ' + wunderlist.language.data.hotkey_help_sidebar + '</p>';
	
	dialogs.helpDialog = $('<div>' + helpHTML + '</div>').dialog({
		autoOpen  : true,
		draggable : false,
		resizable : false,
		modal     : true,
		closeOnEscape: true,
		title     : wunderlist.language.data.hotkey_help_title
	});
	
	dialogs.openDialog(dialogs.helpDialog);
	
	$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');	
};

/**
 * Opens the credits dialog
 *
 * @author Daniel Marschner
 */
openCreditsDialog = function() {
	if ($("[role='dialog']").length == 0)
		dialogs.openDialog(dialogs.generateDialog('What is Wunderlist?', html.generateCreditsDialogHTML(), 'dialog-credits'));
};

openBackgroundsDialog = function() {
	if ($("[role='dialog']").length == 0)
		dialogs.openDialog(dialogs.generateDialog('Background Credits', html.generateBackgroundsDialogHTML(), 'background-credits'));
};