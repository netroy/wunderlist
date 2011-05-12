/**
 * wunderlist.sharing.js
 *
 * Class for sharing lists
 * 
 * @author Marvin Labod, Dennis Schneider
 */

wunderlist.sharing = wunderlist.sharing || {};

/**
 * The init method
 *
 * @author Dennis Schneider
 */
wunderlist.sharing.init = function() {
	wunderlist.sharing.domain                   = 'https://sync.wunderlist.net'; 
	wunderlist.sharing.shareUrl                 = wunderlist.sharing.domain + '/share/1.1.2';
	wunderlist.sharing.sharedEmailsUrl          = wunderlist.sharing.domain + '/share/1.1.2/emails';
	wunderlist.sharing.deleteSharedEmailUrl     = wunderlist.sharing.domain + '/share/1.1.2/delete';
	wunderlist.sharing.deleteALLSharedEmailsUrl = wunderlist.sharing.domain + '/share/1.1.2/remove';
	wunderlist.sharing.getOwnerUrl              = wunderlist.sharing.domain + '/share/1.1.2/owner';
	wunderlist.sharing.shareListDialog          = null;
	wunderlist.sharing.deletedMails             = [];
	wunderlist.sharing.openedNoInternetDialog   = false;

	wunderlist.sharing.status_codes = {
        'SHARE_SUCCESS':    800,
        'SHARE_FAILURE':    801,
        'SHARE_DENIED':     802,
        'SHARE_NOT_EXISTS': 803,
		'SHARE_NOT_SHARED': 804,
		'SHARE_OWN_EMAIL':  805
    };

	wunderlist.sharing.addedEmail = false;

	// Hitting Enter on Input Field
	$('.input-sharelist').live('keydown', function(event)
	{
		if (event.keyCode == 13)
		{
			if (wunderlist.sharing.addedEmail == false)
			{
				wunderlist.sharing.addedEmail = true;
				$('#send_share_invitation').click();
				setTimeout(function() {wunderlist.sharing.addedEmail = false}, 1000);
			}
		}
	});

	wunderlist.sharing.clickedSharingButton = false;

	// Called on pressed sharing button
	$('.list div.sharedlist, .list div.sharelist').live('click', function()
	{
		if (Titanium.Network.online == true)
		{
			if (wunderlist.sharing.clickedSharingButton == false)
			{
				wunderlist.sharing.clickedSharingButton = true;
	
				var shareList = $('.sharelistusers');
				shareList.empty();
				$('.invitedpeople').remove();
	
				wunderlist.sharing.deletedMails = [];
	
				list_id   = $(this).parent('b').parent('a').attr('id').replace('list', '');
				list_name = $(this).parent('b').text();
							
				if ($(this).hasClass('sharedlist'))
					wunderlist.sharing.getSharedEmails(list_id);
				else
					wunderlist.sharing.openShareListDialog(list_id, list_name);
				
				$('#share-list-email').blur();
				
				setTimeout(function() { wunderlist.sharing.clickedSharingButton = false; }, 300);
			}
		}
		else
		{
			wunderlist.sharing.openNoInternetShareDialog();
		}
	});

	wunderlist.sharing.deletedEmail = false;

	// Delete Button for remove Sharing for a single E-Mail
	$('.dialog-sharelist li span').live('click', function()
	{
		if (wunderlist.sharing.deletedEmail == false)
		{
			wunderlist.sharing.deletedEmail = true;

			$deleteButton = $(this);

			var shareListItems = $('.sharelistusers').children('li');

			var buttonOptions = {};
			buttonOptions[wunderlist.language.data.no] = function() {$(this).dialog('close')};
			buttonOptions[wunderlist.language.data.yes] = function() {
				var email = $.trim($deleteButton.parent().text());
				wunderlist.sharing.deletedMails.push(email);
				var list_id = $('input#share-list-id').attr('rel');
				
				wunderlist.sharing.deleteSharedEmail(list_id, $deleteButton.parent());
				wunderlist.sharing.deletedMails = [];
				if ($('.sharelistusers').children('li').length == 0)
				{
					$('.invitedpeople').remove();
				}
				$(this).dialog('close');
			};

			wunderlist.sharing.deleteSharedEmailDialog = $('<div><p>'+ wunderlist.language.data.delete_shared_email +'</p></div>').dialog({
				autoOpen      : true,
				draggable     : false,
				modal         : true,
				resizable     : false,
				closeOnEscape : true,
				title         : wunderlist.language.data.delete_shared_title,
				buttons       : buttonOptions
			});
			
			dialogs.openDialog(wunderlist.sharing.deleteSharedEmailDialog);

			if (shareListItems.length == 0)
			{
				$('p.invitedpeople').remove();
			}

			setTimeout(function() {wunderlist.sharing.deletedEmail = false}, 300)
		}
	});

	wunderlist.sharing.sendInvitation = false;

	// Send the invitation
	$('#send_share_invitation').live('click', function()
	{
		// Check if the email is empty
		if ($('#share-list-email').val() == '')
		{
			dialogs.showErrorDialog(wunderlist.language.data.invalid_email);
			return false;
		}	
	
		if (wunderlist.sharing.sendInvitation == false)
		{
			wunderlist.sharing.sendInvitation = true;

			var list_id = $('input#share-list-id').attr('rel');							
							
			// If sync is active at the moment, wait until it is finished and then
			// execute the sharing method
			if (wunderlist.sync.isSyncing == true)
			{
				wunderlist.sharing.syncShareInterval = setInterval(function() {

					if (wunderlist.sync.isSyncing == false)
					{
						wunderlist.sharing.shareLists(list_id);
						clearInterval(wunderlist.sharing.syncShareInterval);
					}

				}, 100);
			}
			else
			{
				wunderlist.sharing.shareLists(list_id);
			}

			dialogs.closeDialog(wunderlist.sharing.shareListDialog);
			
			setTimeout(function() {wunderlist.sharing.sendInvitation = false}, 2000);
		}
	});
	
	// Delete all emails from shared list
	$('.delete-all-shared-lists').live('click', function() {
		wunderlist.sharing.deleteAllSharedEmails($('input#share-list-id').attr('rel').replace('list', ''));
	});
};

/**
 * Check if the list is already shared, then share the list
 *
 * @author Dennis Schneider
 */
wunderlist.sharing.shareLists = function(list_id) {
	// Set list to shared
	list.id     = list_id;
	list.shared = 1;

	wunderlist.sharing.shareEmails = $('#share-list-email').val().split(',');

	// If it is not synced or hasn't been shared before, sync it
	if (wunderlist.database.isSynced(list_id) == false || wunderlist.database.isShared(list_id) == false)
	{
		list.update();
		wunderlist.sync.fireSync(false, false, list_id);
		wunderlist.timer.stop().set(15);
	}
	else
	{
		list.update();	
		wunderlist.sharing.sendSharedList(list_id);
	}
};

/**
 * Deletes an user from a shared list
 *
 * @author Dennis Schneider
 */
wunderlist.sharing.deleteSharedEmail = function(list_id, deletedElement) {
	var offline_list_id = list_id;

	var data         = {};
	user_credentials = wunderlist.account.getUserCredentials();
	data['email']    = user_credentials['email'];
	data['password'] = user_credentials['password'];
	data['list_id']  = wunderlist.database.getListOnlineIdById(list_id);
	data['delete']   = wunderlist.sharing.deletedMails[0];

	$.ajax({
		url: wunderlist.sharing.deleteSharedEmailUrl,
		type: 'POST',
		data: data,
		timeout: settings.REQUEST_TIMEOUT,
		success: function(response_data, text, xhrobject)
		{
			if (response_data != '' && text != '' && xhrobject != undefined)
			{
				if (xhrobject.status == 200)
				{			
					var response = JSON.parse(response_data);

					switch (response.code)
					{
						case wunderlist.sharing.status_codes.SHARE_SUCCESS:
							deletedElement.remove();
							wunderlist.sharing.unshareList(offline_list_id);
							dialogs.showDeletedDialog(wunderlist.language.data.shared_delete_title, wunderlist.language.data.shared_delete_success);
							break;

						case wunderlist.sharing.status_codes.SHARE_FAILURE:
							dialogs.showErrorDialog(wunderlist.language.data.share_failure);
							break;

						case wunderlist.sharing.status_codes.SHARE_DENIED:
							wunderlist.sharing.unshareList(offline_list_id);
							dialogs.showErrorDialog(wunderlist.language.data.share_denied);
							break;

						case wunderlist.sharing.status_codes.SHARE_NOT_EXIST:
							wunderlist.sharing.unshareList(offline_list_id);
							dialogs.showErrorDialog(wunderlist.language.data.sync_not_exist);
							break;

						default:
							dialogs.showErrorDialog(wunderlist.language.data.error_occurred);
							break;
					}
				}
			}
		},
		error: function(xhrobject)
		{
			dialogs.showErrorDialog(wunderlist.language.data.sync_error);
		}
	});
};

/**
 * Collect the entered emails and share the list
 *
 * @author Dennis Schneider
 */
wunderlist.sharing.sendSharedList = function(list_id)
{
	var collected_emails = [];
	var emails           = wunderlist.sharing.shareEmails;

	// Collect the entered emails
	if (emails.length > 0 && emails[0] != '')
	{
		for (value in emails)
		{
			var email = $.trim(emails[value]);

			// If the email is valid
			if (wunderlist.is_email(email))
			{
				collected_emails.push(email);
			}
		}
	}
	// If no emails are available
	else
	{
		if (wunderlist.sharing.deletedMails.length == 0)
		{
			dialogs.showErrorDialog(wunderlist.language.data.shared_not_changed);
			if ($('.sharelistusers').children('li').length == 0)
			{
				$('div#lists a#list' + offline_list_id + ' b div.sharedlist').removeClass('sharedlist').addClass('sharelist');
				
				list.id     = list_id;
				list.shared = 0;
				list.update();
			}
			return false;
		}
	}

	var offline_list_id = list_id;

	var data         = {};
	user_credentials = wunderlist.account.getUserCredentials();
	data['email']    = user_credentials['email'];
	data['password'] = user_credentials['password'];
	data['list_id']  = wunderlist.database.getListOnlineIdById(list_id);
	data['add']	     = collected_emails;	
	
	// Find the user email 
	var idx = data['add'].indexOf(data['email']);
	
	// Remove the user email if found
	if (idx != -1) 
	{	
		dialogs.showErrorDialog(wunderlist.language.data.share_own_email);
		data['add'].splice(idx, 1);
	}
	
	// If no email is used, just end the function
	if (data['add'].length === 0)
	{
		return false;
	}
	
	$.ajax({
		url: wunderlist.sharing.shareUrl,
		type: 'POST',
		data: data,
		timeout: settings.REQUEST_TIMEOUT,
		success: function(response_data, text, xhrobject)
		{			
			if (response_data != '' && text != '' && xhrobject != undefined)
			{
				if (xhrobject.status == 200)
				{		
					var response = JSON.parse(response_data);
					
					switch (response.code)
					{
						case wunderlist.sharing.status_codes.SHARE_SUCCESS:
							$('div#lists a#list' + offline_list_id + ' b div.sharelist').removeClass('sharelist').addClass('sharedlist');
							dialogs.showSharedSuccessDialog(wunderlist.language.data.shared_successfully);
							break;

						case wunderlist.sharing.status_codes.SHARE_FAILURE:
							dialogs.showErrorDialog(wunderlist.language.data.share_failure);
							break;

						case wunderlist.sharing.status_codes.SHARE_DENIED:
							
							dialogs.showErrorDialog(wunderlist.language.data.share_denied);
							break;

						case wunderlist.sharing.status_codes.SHARE_NOT_EXIST:
							wunderlist.sharing.unshareList(offline_list_id);
							dialogs.showErrorDialog(wunderlist.language.data.sync_not_exist);
							break;

						default:
							dialogs.showErrorDialog(wunderlist.language.data.error_occurred);
							break;
					}
				}
			}
		},
		error: function(xhrobject)
		{
			dialogs.showErrorDialog(wunderlist.language.data.sync_error);
		}
	});
};

/**
 * Set the list to unshared locally
 *
 * @author Dennis Schneider
 */
wunderlist.sharing.unshareList = function(offline_list_id)
{
	if ($('.sharelistusers').children('li').length == 0)
	{
		$('div#lists a#list' + offline_list_id + ' b div.sharedlist').removeClass('sharedlist').addClass('sharelist');
		$('p.invitedpeople').remove();
		
		list.id     = offline_list_id;
		list.shared = 0;
		list.update();
	}
};

/**
 * Get the emails for the shared list from the server
 *
 * @author Dennis Schneider
 */
wunderlist.sharing.getSharedEmails = function(list_id)
{
	var data         = {};
	user_credentials = wunderlist.account.getUserCredentials();
	data['email']    = user_credentials['email'];
	data['password'] = user_credentials['password'];
	data['list_id']  = wunderlist.database.getListOnlineIdById(list_id);

	$.ajax({
		url: wunderlist.sharing.sharedEmailsUrl,
		type: 'POST',
		data: data,
		timeout: settings.REQUEST_TIMEOUT,
		success: function(response_data, text, xhrobject)
		{
			if (response_data != '' && text != '' && xhrobject != undefined)
			{
				if (xhrobject.status == 200)
				{
					var response = JSON.parse(response_data);
					
					switch (response.code)
					{
						case wunderlist.sharing.status_codes.SHARE_SUCCESS:
					
							wunderlist.sharing.openShareListDialog(list_id, list_name);

							var shareList      = $('.sharelistusers');
							var shareListItems = shareList.children('li');
							shareListItems = shareList.children('li');							

							if (response.emails != undefined && response.emails.length > 0)
							{
								if (shareListItems.length == 0)
								{
									shareHTML  = "<p class='invitedpeople'>";
									shareHTML += "<b>"+ wunderlist.language.data.currently_shared_with +":</b>";
									shareHTML += "<button class='input-button delete-all-shared-lists'>"+ wunderlist.language.data.delete_all_shared_lists +"</button>";
									shareHTML += "</p>";
									
									shareList.before(shareHTML);
								}
								
								for (value in response.emails)
									shareList.append('<li><span></span> ' + $.trim(response.emails[value]) + '</li>');
							}
							break;

						case wunderlist.sharing.status_codes.SHARE_FAILURE:
							dialogs.showErrorDialog(wunderlist.language.data.share_failure);
							break;

						case wunderlist.sharing.status_codes.SHARE_DENIED:
							wunderlist.sharing.getOwnerOfList(data['list_id']);
							break;

						case wunderlist.sharing.status_codes.SHARE_NOT_EXIST:
							dialogs.showErrorDialog(wunderlist.language.data.sync_not_exist);
							break;

						case wunderlist.sharing.status_codes.SHARE_NOT_SHARED:
							wunderlist.sharing.openShareListDialog(list_id, list_name);
							wunderlist.sharing.unshareList(list_id);
							break;

						default:
							dialogs.showErrorDialog(wunderlist.language.data.error_occurred);
							break;
					}
				}
			}
		},
		error: function(xhrobject)
		{
			dialogs.showErrorDialog(wunderlist.language.data.sync_error);
		}
	});
};

/**
 * Get the owner of the list
 *
 * @author Dennis Schneider
 */
wunderlist.sharing.getOwnerOfList = function(online_list_id)
{
	var data = {'list_id' : online_list_id};

	$.ajax({
		url: wunderlist.sharing.getOwnerUrl,
		type: 'POST',
		data: data,
		timeout: settings.REQUEST_TIMEOUT,
		success: function(response_data, text, xhrobject)
		{
			if (response_data != '' && text != '' && xhrobject != undefined)
			{
				if (xhrobject.status == 200)
				{
					var response = JSON.parse(response_data);

					switch (response.code)
					{
						case wunderlist.sharing.status_codes.SHARE_SUCCESS:
							if (response.list_id == online_list_id)
							{
								dialogs.showErrorDialog(wunderlist.language.data.share_denied + '<br /><b>' + response.owner + '</b>');
							}
							else
							{
								dialogs.showErrorDialog(wunderlist.language.data.share_denied);
							}
							break;

						case wunderlist.sharing.status_codes.SHARE_FAILURE:
							dialogs.showErrorDialog(wunderlist.language.data.share_failure);
							break;

						case wunderlist.sharing.status_codes.SHARE_NOT_EXIST:
							dialogs.showErrorDialog(wunderlist.language.data.sync_not_exist);
							break;

						default:
							dialogs.showErrorDialog(wunderlist.language.data.error_occurred);
							break;
					}
				}
			}
		},
		error: function(xhrobject)
		{
			dialogs.showErrorDialog(wunderlist.language.data.sync_error);
		}
	});
};

/**
 * Deletes an user from a shared list
 *
 * @author Dennis Schneider, Daniel Marschner
 */
wunderlist.sharing.deleteAllSharedEmails = function(list_id) {
	var data         = {};
	user_credentials = wunderlist.account.getUserCredentials();
	data['email']    = user_credentials['email'];
	data['password'] = user_credentials['password'];
	data['list_id']  = wunderlist.database.getListOnlineIdById(list_id);

	$.ajax({
		url     : wunderlist.sharing.deleteALLSharedEmailsUrl,
		type    : 'POST',
		data    : data,
		success : function(response_data, text, xhrobject) {
			if (response_data != '' && text != '' && xhrobject != undefined)
			{
				if (xhrobject.status == 200)
				{				
					var response = JSON.parse(response_data);
										
					switch (response.code)
					{
						case wunderlist.sharing.status_codes.SHARE_SUCCESS:
							wunderlist.sharing.shareListDialog.dialog('close');
							dialogs.showDeletedDialog(wunderlist.language.data.shared_delete_all_success);
							
							wunderlist.sharing.unshareList(list_id);
							break;

						case wunderlist.sharing.status_codes.SHARE_FAILURE:
							dialogs.showErrorDialog(wunderlist.language.data.share_failure);
							break;

						default:
							dialogs.showErrorDialog(wunderlist.language.data.error_occurred);
							break;
					}
				}
			}
		},
		error: function() {
			dialogs.showErrorDialog(wunderlist.language.data.share_failure);
		}
	});
};

/**
 * Open Sharing Dialog
 *
 * @author Marvin Labod
 */
wunderlist.sharing.openShareListDialog = function(list_id)
{
	wunderlist.sharing.shareListDialog = dialogs.generateDialog(wunderlist.language.data.sharing_is_caring + list_name, html.generateShareListDialogHTML(list_id),'dialog-sharelist');
	dialogs.openDialog(wunderlist.sharing.shareListDialog);
};

/**
 * Open a dialog when no internet connection is available
 *
 * @author Dennis Schneider
 */
wunderlist.sharing.openNoInternetShareDialog = function()
{
	if (wunderlist.sharing.openedNoInternetDialog == false)
	{
		wunderlist.sharing.openedNoInternetDialog = true;
		dialogs.showErrorDialog('Sharing is only possible if you have an active internet connection');
		setTimeout(function() {wunderlist.sharing.openedNoInternetDialog = false}, 1000);
	}
};