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
	sharing.shareUrl        = 'https://sync.wunderlist.net/share';
	sharing.sharedEmailsUrl = 'https://sync.wunderlist.net/share/%s/emails';
	sharing.shareListDialog = null;

	sharing.status_codes =
	{
        'CONST_SHARE_SUCCESS':    800,
        'CONST_SHARE_FAILURE':    801,
        'CONST_SHARE_DENIED':     802,
        'CONST_SHARE_NOT_EXISTS': 803
    };

	// Called on pressed sharing button
	$('div#lists a div.sharep').click(function()
	{
		if(Titanium.Network.online == true)
		{
			sharing.openShareListDialog();
		}
		else
		{
			sharing.openNoInternetShareDialog();
		}
	});

	// Delete emails button
	$('.dialog-sharelist li span').live('click', function()
	{
		$(this).parent().remove();
	});

	// Send the invitation
	$('div#sharebox input#send_invitation').live('click', function()
	{
		sharing.shareLists();
		closeDialog(sharing.shareListDialog);
	});
}

/**
 * Share the list to the given emails
 *
 * @author Dennis Schneider
 */
sharing.shareLists = function()
{
	list_id              = $('div#lists a.ui-state-disabled').attr('id');
	var data             = {};
	var user_credentials = wunderlist.getUserCredentials();
	data['email']        = user_credentials['email'];
	data['password']     = user_credentials['password'];
	data['list_id']      = wunderlist.getOnlineIdByListId(list_id);
	data['add']	         = {};
	data['delete']       = {};

	$.ajax({
		url: sharing.shareUrl,
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
				switchSyncSymbol(xhrobject.status);

				if(xhrobject.status == 200)
				{
					var response = eval('(' + response_data + ')');

					switch(response.code)
					{
						case sync.status_codes.SYNC_SUCCESS:
							sharing.shareSuccess(response);
							break;

						case sync.status_codes.SYNC_FAILURE:
							showErrorDialog(language.data.sync_failure);
							break;

						case sync.status_codes.SYNC_DENIED:
							showErrorDialog(language.data.sync_denied);
							break;

						case sync.status_codes.SYNC_NOT_EXIST:
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
 * When the sharing request was successful
 *
 * @author Dennis Schneider
 */
sharing.shareSuccess = function(response)
{
	// Do stuff with the response
}

/**
 * Get the emails for the shared list from the server
 *
 * @author Dennis Schneider
 */
sharing.getSharedEmails = function()
{
	var data             = {};
	var user_credentials = wunderlist.getUserCredentials();
	data['email']        = user_credentials['email'];
	data['password']     = user_credentials['password'];

	list_id  = $('div#lists a.ui-state-disabled').attr('id');
	list_id  = wunderlist.getOnlineIdByListId(list_id);
	emailUrl = sharing.sharedEmailsUrl.split('%s').join(list_id);

	$.ajax({
		url: emailUrl,
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
				switchSyncSymbol(xhrobject.status);

				if(xhrobject.status == 200)
				{
					var response = eval('(' + response_data + ')');

					switch(response.code)
					{
						case sync.status_codes.SYNC_SUCCESS:
							// @TODO FILL DIALOG WITH EMAIL ADDRESSES
							break;

						case sync.status_codes.SYNC_FAILURE:
							showErrorDialog(language.data.sync_failure);
							break;

						case sync.status_codes.SYNC_DENIED:
							showErrorDialog(language.data.sync_denied);
							break;

						case sync.status_codes.SYNC_NOT_EXIST:
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
 * Open Sharing Dialog
 *
 * @author Marvin Labod
 */
sharing.openShareListDialog = function()
{
	sharing.shareListDialog = generateDialog('Share List', generateShareListDialogHTML(), 'dialog-sharelist')
	openDialog(sharing.shareListDialog);
}

/**
 * Open a dialog when no internet connection is available
 *
 * @author Dennis Schneider
 */
sharing.openNoInternetShareDialog = function()
{
	// @TODO Put code here
}

// Load on start
$(function() {
	sharing.init();
});