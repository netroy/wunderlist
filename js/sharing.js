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
	sharing.shareUrl               = 'https://sync.wunderlist.net/share';
	sharing.sharedEmailsUrl        = 'https://sync.wunderlist.net/share/emails';
	sharing.shareListDialog        = null;
	sharing.deletedMails           = new Array();
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
				setTimeout(function() {sharing.addedEmail = false}, 300);
			}
		}
	});

	sharing.clickedSharingButton = false;

	// Called on pressed sharing button
	$('#listfunctions a.list-share').live('click', function()
	{
		if(Titanium.Network.online == true)
		{
			if(sharing.clickedSharingButton == false)
			{
				sharing.clickedSharingButton = true;

				$('#share-list-email').val('');

				var shareList      = $('.sharelistusers');
				shareList.empty();
				$('.invitedpeople').remove();

				var list_id = $('div#lists a.ui-state-disabled').attr('id');
				sharing.deletedMails = new Array();

				// Only request shared emails, if list is already shared
				if(wunderlist.listIsAlreadyShared(list_id) == true)
				{
					sharing.getSharedEmails(list_id);
				}
				else
				{
					sharing.openShareListDialog();
				}

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
		if(sharing.deletedEmail == false)
		{
			sharing.deletedEmail = true;

			var shareListItems      = $('.sharelistusers').children('li');

			if(sharing.deleteSharedEmail == undefined)
			{
				sharing.deleteSharedEmail = $('<div></div>').dialog({
					autoOpen  : true,
					draggable : false,
					modal     : false,
					title     : language.data.delete_shared_email,
					buttons   : {
						'No'  : function() {
							$(this).dialog('close');
						},
						'Yes' : function() {
							var email = $.trim($('.dialog-sharelist li span').parent().text());
							sharing.deletedMails.push(email);
							var list_id = $('div#lists a.ui-state-disabled').attr('id');
							sharing.sendSharedList(list_id, 'delete');
							sharing.deletedMails = new Array();
							if($('.sharelistusers').children('li').length == 0)
							{
								$('.invitedpeople').remove();
							}
							$(this).dialog('close');
						}
					}
				});
			}
			else
				openDialog(sharing.deleteSharedEmail);

			if(shareListItems.length == 0)
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
		if(sharing.sendInvitation == false)
		{
			sharing.sendInvitation = true;
			sharing.shareLists();
			closeDialog(sharing.shareListDialog);
			
			setTimeout(function() {sharing.sendInvitation = false}, 2000);
		}
	});
}

/**
 * Check if the list is already shared, then share the list
 *
 * @author Dennis Schneider
 */
sharing.shareLists = function()
{
	if($('#share-list-email').val() == '')
	{
		showErrorDialog(language.data.invalid_email);
		return false;
	}

	list_id = $('div#lists a.ui-state-disabled').attr('id');
	
	// If list is not shared, set it to shared and sync it
	if(wunderlist.listIsAlreadyShared(list_id) == false)
	{
		wunderlist.setListToShared(list_id);
		sync.fireSync(false, false, list_id);
	}
	else
	{
		sharing.sendSharedList(list_id);
	}
}

/**
 * Collect the entered emails and share the list
 *
 * @author Dennis Schneider
 */
sharing.sendSharedList = function(list_id, type)
{
	if(type == undefined)
	{
		type = 'share';
	}

	var collected_emails = new Array();
	var emails           = $('#share-list-email').val().split(',');

	// Collect the entered emails
	if(emails.length > 0 && emails[0] != '')
	{
		for(value in emails)
		{
			var email = $.trim(emails[value]);

			// If the email is valid
			if(sync.validateEmail(email))
			{
				collected_emails.push(email);
			}
			else
			{
				showErrorDialog(language.data.invalid_email);
				if($('.sharelistusers').children('li').length == 0)
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
		if(sharing.deletedMails.length == 0)
		{
			showErrorDialog(language.data.shared_not_changed);
			if($('.sharelistusers').children('li').length == 0)
			{
				$('div#lists a#' + list_id + ' b').removeClass('shared');
				wunderlist.setListToUnShared(list_id);
			}
			return false;
		}
	}

	offline_list_id = list_id;

	var data         = {};
	user_credentials = wunderlist.getUserCredentials();
	data['email']    = user_credentials['email'];
	data['password'] = user_credentials['password'];
	data['list_id']  = wunderlist.getOnlineIdByListId(list_id);
	data['add']	     = collected_emails;
	data['delete']   = sharing.deletedMails;

	$.ajax({
		url: sharing.shareUrl,
		type: 'POST',
		data: data,
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
					var response = eval('(' + response_data + ')');

					switch(response.code)
					{
						case sharing.status_codes.SHARE_SUCCESS:
							if(type == 'share')
							{
								$('div#lists a#' + offline_list_id + ' b').addClass('shared');
								if(response.email != undefined && data['email'] == response.email)
								{
									showShareOwnEmailDialog();
									// If there was only the own email shared, remove shared symbol
									if(collected_emails.length == 1)
									{
										$('div#lists a#' + offline_list_id + ' b').removeClass('shared');
										wunderlist.setListToUnShared(offline_list_id);
									}
									else
									{
										showOKDialog(language.data.shared_successfully);
									}
								}
								else
								{
									showOKDialog(language.data.shared_successfully);
								}
							}
							else
							{
								$('.dialog-sharelist li span').parent().remove();
								if($('.sharelistusers').children('li').length == 0)
								{
									$('div#lists a#' + offline_list_id + ' b').removeClass('shared');
									wunderlist.setListToUnShared(offline_list_id);
								}
								showDeletedDialog(language.data.shared_delete_success);
							}
							break;

						case sharing.status_codes.SHARE_FAILURE:
							showErrorDialog(language.data.share_failure);
							break;

						case sharing.status_codes.SHARE_DENIED:
							showErrorDialog(language.data.share_denied);
							break;

						case sharing.status_codes.SHARE_NOT_EXIST:
							showErrorDialog(language.data.sync_not_exist);
							break;

						default:
							showErrorDialog(language.data.error_occurred);
							break;
					}
				}
			}
		},
		error: function(xhrobject)
		{
			showErrorDialog(language.data.sync_error);
		}
	});
}

/**
 * Get the emails for the shared list from the server
 *
 * @author Dennis Schneider
 */
sharing.getSharedEmails = function(list_id)
{
	list_id          = wunderlist.getOnlineIdByListId(list_id);

	var data         = {};
	user_credentials = wunderlist.getUserCredentials();
	data['email']    = user_credentials['email'];
	data['password'] = user_credentials['password'];
	data['list_id']  = list_id;

	$.ajax({
		url: sharing.sharedEmailsUrl,
		type: 'POST',
		data: data,
		beforeSend: function()
		{
			// Show loading indicator on invitation dialog
		},
		success: function(response_data, text, xhrobject)
		{
			if(response_data != '' && text != '' && xhrobject != undefined)
			{
				if(xhrobject.status == 200)
				{
					var response = eval('(' + response_data + ')');

					switch(response.code)
					{
						case sharing.status_codes.SHARE_SUCCESS:
							sharing.openShareListDialog();

							var shareList      = $('.sharelistusers');
							var shareListItems = shareList.children('li');
							shareListItems = shareList.children('li');

							if(response.emails != undefined && response.emails.length > 0)
							{
								if(shareListItems.length == 0)
								{
									shareList.before("<p class='invitedpeople'><b>"+ language.data.currently_shared_with +":</b></br></p>");
								}
								
								for(value in response.emails)
								{
									shareList.append('<li><span></span> ' + $.trim(response.emails[value]) + '</li>');
								}
							}
							break;

						case sharing.status_codes.SHARE_FAILURE:
							showErrorDialog(language.data.share_failure);
							break;

						case sharing.status_codes.SHARE_DENIED:
							showErrorDialog(language.data.share_denied);
							break;

						case sharing.status_codes.SHARE_NOT_EXIST:
							showErrorDialog(language.data.sync_not_exist);
							break;

						case sharing.status_codes.SHARE_NOT_SHARED:
							sharing.openShareListDialog();
							break;

						default:
							showErrorDialog(language.data.error_occurred);
							break;
					}
				}
			}
		},
		error: function(xhrobject)
		{
			showErrorDialog(language.data.sync_error);
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
		sharing.shareListDialog = generateDialog('Sharing is caring!', generateShareListDialogHTML(), 'dialog-sharelist')
	}
	openDialog(sharing.shareListDialog);
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
		showErrorDialog('Sharing is only possible if you have an active internet connection');
		setTimeout(function() {sharing.openedNoInternetDialog = false}, 1000);
	}
}

// Load on start
$(function() {
	sharing.init();
});