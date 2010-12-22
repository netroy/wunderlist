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
	sharing.shareUrl        = 'http://192.168.178.58/share';//'https://sync.wunderlist.net/share';
	sharing.sharedEmailsUrl = 'http://192.168.178.58/share/emails';//'https://sync.wunderlist.net/share/emails';
	sharing.shareListDialog = null;
	sharing.deletedMails    = new Array();

	sharing.status_codes =
	{
        'SHARE_SUCCESS':    800,
        'SHARE_FAILURE':    801,
        'SHARE_DENIED':     802,
        'SHARE_NOT_EXISTS': 803,
		'SHARE_NOT_SHARED': 804
    };

	sharing.addedEmail = false;

	// Hitting Enter on Input Field
	$('.input-sharelist').live('keydown', function(event)
	{
		if(event.keyCode == 29)
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
	$('div#lists a div.sharep').live('click', function()
	{
		if(Titanium.Network.online == true)
		{
			if(sharing.clickedSharingButton == false)
			{
				sharing.clickedSharingButton = true;

				var shareList      = $('.sharelistusers');
				shareList.empty();
				$('.invitedpeople').remove();

				var list_id = $(this).parent().attr('id');

				// Only request shared emails, if list is already shared
				if(wunderlist.listIsAlreadyShared(list_id) == true)
				{
					sharing.deletedMails = new Array();
					sharing.getSharedEmails(list_id);
				}
				else
				{
					sharing.openShareListDialog();
				}

				setTimeout(function() {sharing.clickedSharingButton = false}, 1000);
			}
		}
		else
		{
			sharing.openNoInternetShareDialog();
		}
	});

	// Delete Button for remove Sharing for a single E-Mail
	$('.dialog-sharelist li span').live('click', function()
	{
		$(this).parent().remove();
		
		var shareListItems = $('.sharelistusers').children('li');

		var email = $(this).parent().text();
		sharing.deletedMails.push(email);

		console.log(sharing.deletedMails);

		if(shareListItems.length == 0)
		{
			$('p.invitedpeople').remove();
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
			
			setTimeout(function() {sharing.sendInvitation = false}, 5000);
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
sharing.sendSharedList = function(list_id)
{
	var collected_emails = new Array();
	var emails           = $('#share-list-email').val().split(',');

	// Collect the entered emails
	for(value in emails)
	{
		var email = $.trim(emails[value]);
		if(sync.validateEmail(email))
		{
			collected_emails.push(email);
		}
		else
		{
			showErrorDialog(language.data.invalid_email);
			return false;
		}
	}

	var data         = {};
	user_credentials = wunderlist.getUserCredentials();
	data['email']    = user_credentials['email'];
	data['password'] = user_credentials['password'];
	data['list_id']  = wunderlist.getOnlineIdByListId(list_id);
	data['add']	     = collected_emails;
	data['delete']   = new Array();

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
							showOKDialog(language.data.shared_successfully);
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

							console.log(shareListItems.length);

							if(response.emails != undefined && response.emails.length > 0)
							{
								if(shareListItems.length == 0)
								{
									shareList.before("<p class='invitedpeople'><b>Currently invited people</b></br></p>");
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
							// Do nothing
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
		sharing.shareListDialog = generateDialog('Share List', generateShareListDialogHTML(), 'dialog-sharelist')
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
	showErrorDialog('Sharing is only possible if you have an active internet connection');
}

// Load on start
$(function() {
	sharing.init();
});