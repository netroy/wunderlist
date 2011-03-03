/**
 * sharing.js
 *
 * Class for sharing lists
 * 
 * @author Marvin Labod, Dennis Schneider
 */

var sharing = sharing || {};

/**
 * The init method
 *
 * @author Dennis Schneider
 */
sharing.init = function()
{
	sharing.domain                 = 'https://sync.wunderlist.net'; 
	sharing.shareUrl               = sharing.domain + '/share/1.1.2';
	sharing.sharedEmailsUrl        = sharing.domain + '/share/1.1.2/emails';
	sharing.deleteSharedEmailUrl   = sharing.domain + '/share/1.1.2/delete';
	sharing.getOwnerUrl            = sharing.domain + '/share/1.1.2/owner';
	sharing.shareListDialog        = null;
	sharing.deletedMails           = [];
	sharing.openedNoInternetDialog = false;

	sharing.status_codes =
	{
        'SHARE_SUCCESS':    800,
        'SHARE_FAILURE':    801,
        'SHARE_DENIED':     802,
        'SHARE_NOT_EXISTS': 803,
		'SHARE_NOT_SHARED': 804,
		'SHARE_OWN_EMAIL':  805
    };

	sharing.addedEmail = false;

	// Hitting Enter on Input Field
	$('.input-sharelist').live('keydown', function(event)
	{
		if(event.keyCode == 13)
		{
			if(sharing.addedEmail == false)
			{
				sharing.addedEmail = true;
				$('#send_share_invitation').click();
				setTimeout(function() {sharing.addedEmail = false}, 1000);
			}
		}
	});

	sharing.clickedSharingButton = false;

	// Called on pressed sharing button
	$('#listfunctions a.list-share').live('click', function()
	{
		if (Titanium.Network.online == true)
		{
			if (sharing.clickedSharingButton == false)
			{
				sharing.clickedSharingButton = true;

				$('#share-list-email').val('');

				var shareList = $('.sharelistusers');
				shareList.empty();
				$('.invitedpeople').remove();

				sharing.deletedMails = [];

				var list_id = $('div#lists a.ui-state-disabled').attr('id');

				// Only request shared emails, if list is already shared
				if (wunderlist.listIsAlreadyShared(list_id) == true)
				{
					sharing.getSharedEmails(list_id);
				}
				else
				{
					sharing.openShareListDialog();
				}

				$('input#share-list-id').attr('rel', list_id);

				$('#share-list-email').blur();
				setTimeout(function() {sharing.clickedSharingButton = false}, 300);
			}
		}
		else
		{
			sharing.openNoInternetShareDialog();
		}
	});

	sharing.deletedEmail = false;

	// Delete Button for remove Sharing for a single E-Mail
	$('.dialog-sharelist li span').live('click', function()
	{
		if (sharing.deletedEmail == false)
		{
			sharing.deletedEmail = true;

			$deleteButton = $(this);

			var shareListItems = $('.sharelistusers').children('li');

			if (sharing.deleteSharedEmailDialog == undefined)
			{
				sharing.deleteSharedEmailDialog = $('<div></div>').dialog({
					autoOpen  : true,
					draggable : false,
					modal     : false,
					resizable: false,
					title     : language.data.delete_shared_email,
					buttons   : {
						'No'  : function() {
							$(this).dialog('close');
						},
						'Yes' : function() {
							var email = $.trim($deleteButton.parent().text());
							sharing.deletedMails.push(email);
							var list_id = $('input#share-list-id').attr('rel');
							sharing.deleteSharedEmail(list_id, $deleteButton.parent());
							sharing.deletedMails = [];
							if ($('.sharelistusers').children('li').length == 0)
							{
								$('.invitedpeople').remove();
							}
							$(this).dialog('close');
						}
					}
				});
			}
			else
			{
				dialogs.openDialog(sharing.deleteSharedEmailDialog);
			}

			if (shareListItems.length == 0)
			{
				$('p.invitedpeople').remove();
			}

			setTimeout(function() {sharing.deletedEmail = false}, 300)
		}
	});

	sharing.sendInvitation = false;

	// Send the invitation
	$('#send_share_invitation').live('click', function()
	{
		if (sharing.sendInvitation == false)
		{
			sharing.sendInvitation = true;

			var list_id = $('input#share-list-id').attr('rel');
			
			// If sync is active at the moment, wait until it is finished and then
			// execute the sharing method
			if (sync.isSyncing == true)
			{
				sharing.syncShareInterval = setInterval(function() {

					if (sync.isSyncing == false)
					{
						sharing.shareLists(list_id);
						clearInterval(sharing.syncShareInterval);
					}

				}, 100);
			}
			else
			{
				sharing.shareLists(list_id);
			}

			dialogs.closeDialog(sharing.shareListDialog);
			
			setTimeout(function() {sharing.sendInvitation = false}, 2000);
		}
	});
}

/**
 * Check if the list is already shared, then share the list
 *
 * @author Dennis Schneider
 */
sharing.shareLists = function(list_id)
{
	if ($('#share-list-email').val() == '')
	{
		dialogs.showErrorDialog(language.data.invalid_email);
		return false;
	}

	// Check whether the list has already been shared or not
	var is_already_shared = wunderlist.listIsAlreadyShared(list_id);

	// Set list to shared
	wunderlist.setListToShared(list_id);

	// If it is not synced or hasn't been shared before, sync it
	if (wunderlist.isAlreadySynced(list_id) == false || is_already_shared == false)
	{
		sync.fireSync(false, false, list_id);
		timer.stop().set(15);
	}
	else
	{
		sharing.sendSharedList(list_id);
	}
}

/**
 * Deletes an user from a shared list
 *
 * @author Dennis Schneider
 */
sharing.deleteSharedEmail = function(list_id, deletedElement)
{
	var offline_list_id = list_id;

	var data         = {};
	user_credentials = wunderlist.getUserCredentials();
	data['email']    = user_credentials['email'];
	data['password'] = user_credentials['password'];
	data['list_id']  = wunderlist.getOnlineIdByListId(list_id);
	data['delete']   = sharing.deletedMails[0];

	$.ajax({
		url: sharing.deleteSharedEmailUrl,
		type: 'POST',
		data: data,
		timeout: config.REQUEST_TIMEOUT,
		beforeSend: function()
		{
			// @TODO Show loading indicator on invitation dialog
		},
		success: function(response_data, text, xhrobject)
		{
			if(response_data != '' && text != '' && xhrobject != undefined)
			{
				if(xhrobject.status == 200)
				{
					console.log(response_data);
			
					var response = eval('(' + response_data + ')');

					switch(response.code)
					{
						case sharing.status_codes.SHARE_SUCCESS:
							deletedElement.remove();
							sharing.unshareList(offline_list_id);
							dialogs.showDeletedDialog(language.data.shared_delete_success);
							break;

						case sharing.status_codes.SHARE_FAILURE:
							dialogs.showErrorDialog(language.data.share_failure);
							break;

						case sharing.status_codes.SHARE_DENIED:
							sharing.unshareList(offline_list_id);
							dialogs.showErrorDialog(language.data.share_denied);
							break;

						case sharing.status_codes.SHARE_NOT_EXIST:
							sharing.unshareList(offline_list_id);
							dialogs.showErrorDialog(language.data.sync_not_exist);
							break;

						default:
							dialogs.showErrorDialog(language.data.error_occurred);
							break;
					}
				}
			}
		},
		error: function(xhrobject)
		{
			dialogs.showErrorDialog(language.data.sync_error);
		}
	});
}

/**
 * Collect the entered emails and share the list
 *
 * @author Dennis Schneider
 */
sharing.sendSharedList = function(list_id)
{
	var collected_emails = [];
	var emails           = $('#share-list-email').val().split(',');

	// Collect the entered emails
	if (emails.length > 0 && emails[0] != '')
	{
		for (value in emails)
		{
			var email = $.trim(emails[value]);

			// If the email is valid
			if (sync.validateEmail(email))
			{
				collected_emails.push(email);
			}
			else
			{
				dialogs.showErrorDialog(language.data.invalid_email);
				if ($('.sharelistusers').children('li').length == 0)
				{
					$('div#lists a#' + list_id + ' b').removeClass('shared');
					wunderlist.setListToUnShared(list_id);
				}
				return false;
			}
		}
	}
	// If no emails are available
	else
	{
		if (sharing.deletedMails.length == 0)
		{
			dialogs.showErrorDialog(language.data.shared_not_changed);
			if ($('.sharelistusers').children('li').length == 0)
			{
				$('div#lists a#' + list_id + ' b').removeClass('shared');
				wunderlist.setListToUnShared(list_id);
			}
			return false;
		}
	}

	var offline_list_id = list_id;

	var data         = {};
	user_credentials = wunderlist.getUserCredentials();
	data['email']    = user_credentials['email'];
	data['password'] = user_credentials['password'];
	data['list_id']  = wunderlist.getOnlineIdByListId(list_id);
	data['add']	     = collected_emails;

	// @TODO Vor dem Abschicken der Liste bereits prüfen, ob eigene E-Mail-Adresse
	// mitgeschickt wird und dann einfach entfernen - dann kann der Fehler erst gar nicht entstehen

	$.ajax({
		url: sharing.shareUrl,
		type: 'POST',
		data: data,
		timeout: config.REQUEST_TIMEOUT,
		beforeSend: function()
		{
			// @TODO Show loading indicator on invitation dialog
		},
		success: function(response_data, text, xhrobject)
		{			
			if (response_data != '' && text != '' && xhrobject != undefined)
			{
				if (xhrobject.status == 200)
				{
					var response = eval('(' + response_data + ')');

					switch (response.code)
					{
						case sharing.status_codes.SHARE_SUCCESS:
							$('div#lists a#' + offline_list_id + ' b').addClass('shared');

							var show_ok = true;

							for (var i = 0; i < collected_emails.length; i++)
							{
								if (collected_emails[i] == data['email'])
								{
									dialogs.showShareOwnEmailDialog();
									// If there was only the own email shared, remove shared symbol
									if (collected_emails.length == 1)
									{
										show_ok = false;
										$('div#lists a#' + offline_list_id + ' b').removeClass('shared');
										wunderlist.setListToUnShared(offline_list_id);
										sync.fireSync();
									}
									break;
								}
							}

							if (show_ok == true)
							{
								dialogs.showSharedSuccessDialog(language.data.shared_successfully);
							}
							break;

						case sharing.status_codes.SHARE_FAILURE:
							dialogs.showErrorDialog(language.data.share_failure);
							break;

						case sharing.status_codes.SHARE_DENIED:
							sharing.unshareList(offline_list_id);
							dialogs.showErrorDialog(language.data.share_denied);
							break;

						case sharing.status_codes.SHARE_NOT_EXIST:
							sharing.unshareList(offline_list_id);
							dialogs.showErrorDialog(language.data.sync_not_exist);
							break;

						default:
							dialogs.showErrorDialog(language.data.error_occurred);
							break;
					}
				}
			}
		},
		error: function(xhrobject)
		{
			dialogs.showErrorDialog(language.data.sync_error);
		}
	});
}

/**
 * Set the list to unshared locally
 *
 * @author Dennis Schneider
 */
sharing.unshareList = function(offline_list_id)
{
	if ($('.sharelistusers').children('li').length == 0)
	{
		$('div#lists a#' + offline_list_id + ' b').removeClass('shared');
		wunderlist.setListToUnShared(offline_list_id);
	}
}

/**
 * Get the emails for the shared list from the server
 *
 * @author Dennis Schneider
 */
sharing.getSharedEmails = function(list_id)
{
	var data         = {};
	user_credentials = wunderlist.getUserCredentials();
	data['email']    = user_credentials['email'];
	data['password'] = user_credentials['password'];
	data['list_id']  = wunderlist.getOnlineIdByListId(list_id);

	$.ajax({
		url: sharing.sharedEmailsUrl,
		type: 'POST',
		data: data,
		timeout: config.REQUEST_TIMEOUT,
		beforeSend: function()
		{
			// Show loading indicator on invitation dialog
		},
		success: function(response_data, text, xhrobject)
		{
			if (response_data != '' && text != '' && xhrobject != undefined)
			{
				if (xhrobject.status == 200)
				{
					console.log(response_data);

					var response = eval('(' + response_data + ')');

					switch (response.code)
					{
						case sharing.status_codes.SHARE_SUCCESS:
							sharing.openShareListDialog();

							var shareList      = $('.sharelistusers');
							var shareListItems = shareList.children('li');
							shareListItems = shareList.children('li');

							if (response.emails != undefined && response.emails.length > 0)
							{
								if (shareListItems.length == 0)
								{
									shareList.before("<p class='invitedpeople'><b>"+ language.data.currently_shared_with +":</b></p>");
								}
								
								for (value in response.emails)
								{
									shareList.append('<li><span></span> ' + $.trim(response.emails[value]) + '</li>');
								}
							}
							break;

						case sharing.status_codes.SHARE_FAILURE:
							dialogs.showErrorDialog(language.data.share_failure);
							break;

						case sharing.status_codes.SHARE_DENIED:
							sharing.getOwnerOfList(data['list_id']);
							break;

						case sharing.status_codes.SHARE_NOT_EXIST:
							dialogs.showErrorDialog(language.data.sync_not_exist);
							break;

						case sharing.status_codes.SHARE_NOT_SHARED:
							sharing.openShareListDialog();
							break;

						default:
							dialogs.showErrorDialog(language.data.error_occurred);
							break;
					}
				}
			}
		},
		error: function(xhrobject)
		{
			dialogs.showErrorDialog(language.data.sync_error);
		}
	});
}

/**
 * Get the owner of the list
 *
 * @author Dennis Schneider
 */
sharing.getOwnerOfList = function(online_list_id)
{
	var data = {'list_id' : online_list_id};

	$.ajax({
		url: sharing.getOwnerUrl,
		type: 'POST',
		data: data,
		timeout: config.REQUEST_TIMEOUT,
		beforeSend: function()
		{
			// Show loading indicator on invitation dialog
		},
		success: function(response_data, text, xhrobject)
		{
			if (response_data != '' && text != '' && xhrobject != undefined)
			{
				if (xhrobject.status == 200)
				{
					var response = eval('(' + response_data + ')');

					switch (response.code)
					{
						case sharing.status_codes.SHARE_SUCCESS:
							if (response.list_id == online_list_id)
							{
								dialogs.showErrorDialog(language.data.share_denied + '<br /><b>' + response.owner + '</b>');
							}
							else
							{
								dialogs.showErrorDialog(language.data.share_denied);
							}
							break;

						case sharing.status_codes.SHARE_FAILURE:
							dialogs.showErrorDialog(language.data.share_failure);
							break;

						case sharing.status_codes.SHARE_NOT_EXIST:
							dialogs.showErrorDialog(language.data.sync_not_exist);
							break;

						default:
							dialogs.showErrorDialog(language.data.error_occurred);
							break;
					}
				}
			}
		},
		error: function(xhrobject)
		{
			dialogs.showErrorDialog(language.data.sync_error);
		}
	});
}

/**
 * Open Sharing Dialog
 *
 * @author Marvin Labod
 */
sharing.openShareListDialog = function()
{
	if(sharing.shareListDialog == undefined)
	{
		sharing.shareListDialog = dialogs.generateDialog('Sharing is caring!', html.generateShareListDialogHTML(), 'dialog-sharelist')
	}
	dialogs.openDialog(sharing.shareListDialog);
}

/**
 * Open a dialog when no internet connection is available
 *
 * @author Dennis Schneider
 */
sharing.openNoInternetShareDialog = function()
{
	if(sharing.openedNoInternetDialog == false)
	{
		sharing.openedNoInternetDialog = true;
		dialogs.showErrorDialog('Sharing is only possible if you have an active internet connection');
		setTimeout(function() {sharing.openedNoInternetDialog = false}, 1000);
	}
}

// Load on start
$(function() {
	sharing.init();
});