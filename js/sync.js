/**
 * sync.js
 *
 * Class for logging in into sync server, sync sending and retrieval
 * @author Dennis Schneider
 */

var sync = sync || {};

$(function()
{
	sync.init();
});

/**
 * Initializes the sync class
 *
 * @author Dennis Schneider
 */
sync.init = function()
{
	this.syncDomain 		= 'https://sync.wunderlist.net';
	this.syncUrl			= this.syncDomain;
	this.alreadyRegistered 	= false;
	this.timeOutInterval 	= '';
	this.isSyncing			= false;

	this.status_codes =
	{
        'SYNC_SUCCESS': 				300,
        'SYNC_FAILURE': 				301,
        'SYNC_DENIED':	 				302,
        'SYNC_NOT_EXIST':				303
    };

	$('#sync').click(function()
	{
		if(sync.isSyncing == false)
		{
			timer.stop();
			sync.fireSync();
			return false;
		}
	});

}

/**
 * Validate the email
 *
 * @author Dennis Schneider
 */
sync.validateEmail = function(email)
{
	var reg = /^([A-Za-z0-9\+_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
	if(reg.test(email) == false) {
		$('.error').text(language.data.error_invalid_email);
		return false;
	}
	else {
		return true;
	}
}

/**
 * Sync the application data
 *
 * @author Dennis Schneider
 */
sync.fireSync = function(logOutAfterSync, exitAfterSync)
{
	// Should the user be logged out after sync?
	if(logOutAfterSync == undefined)
	{
		logOutAfterSync = false;
	}
	
	if(exitAfterSync == undefined)
	{
		exitAfterSync = false;
	}
	
	if(wunderlist.isUserLoggedIn() == false)
	{
		setTimeout(stopSyncAnimation, 10);
		var html  = '<div>' + language.data.sync_not_logged_in + '</div>';
			html += '<input class="input-button register" type="submit" id="notloggedin-yes" value="' + language.data.sync_not_logged_in_yes + '" />' +
					'<input class="input-button" type="submit" id="notloggedin-cancel" value="' + language.data.sync_not_logged_in_no + '" />';

	  	var notloggedin_dialog = generateDialog(language.data.sync_not_logged_in_title, html, 'dialog-login');

		$(notloggedin_dialog).dialog('open');

		// If not logged in and want to sync
		$('#notloggedin-yes').live('click', function() {
			Layout.stopLoginAnimation();
			$(register_dialog).dialog('open');
			$(notloggedin_dialog).dialog('close');
		});

		$('#notloggedin-cancel').live('click', function() {
			$(notloggedin_dialog).dialog('close');
		});
	}
	else
	{
		// SYNC STEP 1
		var data = {};
		user_credentials			    = wunderlist.getUserCredentials();
		data['email']					= user_credentials['email'];
		data['password']				= user_credentials['password'];
		data['step']					= 1;
		data['sync_table']				= {};
		data['sync_table']['lists']		= wunderlist.getDataForSync('lists', 'online_id, version', 'online_id != 0');
		data['sync_table']['tasks']		= wunderlist.getDataForSync('tasks', 'online_id, version', 'online_id != 0');
		data['sync_table']['new_lists']	= wunderlist.getDataForSync('lists', '*', 'online_id = 0 AND deleted = 0');

		var syncSuccessful  = false;
		this.isSyncing		= true;

		$.ajax({
			url: this.syncDomain,
			type: 'POST',
			data: data,
			beforeSend: function()
			{
    			startSyncAnimation();
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
								sync.syncSuccess(response, logOutAfterSync, exitAfterSync, data['sync_table']['new_lists']);
								syncSuccessful = true;
								clearInterval(sync.timeOutInterval);
								sync.timeOutInterval = '';
								break;

							case sync.status_codes.SYNC_FAILURE:
								sync.isSyncing = false;
								showErrorDialog(language.data.sync_failure);
								break;

							case sync.status_codes.SYNC_DENIED:
								sync.isSyncing = false;
								showErrorDialog(language.data.sync_denied);
								break;

							case sync.status_codes.SYNC_NOT_EXIST:
								sync.isSyncing = false;
								showErrorDialog(language.data.sync_not_exist);
								account.logout();
								break;

							default:
								sync.isSyncing = false;
								showErrorDialog(language.data.error_occurred);
								break;
						}
					}
				}
				else
				{
					switchSyncSymbol(0);
				}
			},
			error: function(xhrobject)
			{
				showErrorDialog(language.data.sync_error);
				switchSyncSymbol(0);
				sync.isSyncing = false;
			}
		});
	}

	// Create a timeout interval, if not already created
	// and check for a successful sync
	if(sync.timeOutInterval == '')
	{
		setTimeout(function() {
			sync.timeOutInterval = setInterval(function() {
				if(syncSuccessful == false)
				{
					switchSyncSymbol(0);
					sync.isSyncing = false;
				}
				else
				{
					clearInterval(sync.timeOutInterval);
				}
			}, 2000);
		}, 10000);
	}
}

/**
 * Callback on sync success
 *
 * @author Dennis Schneider
 */
sync.syncSuccess = function(response_step1, logOutAfterSync, exitAfterSync, new_lists)
{
	// SYNC STEP 2
	if(response_step1.sync_table != undefined)
	{
		var sync_table_step1 = response_step1.sync_table;
		var synced_lists 	 = sync_table_step1.synced_lists;

		if(synced_lists != undefined)
		{
			for(var i = 0, max = synced_lists.length; i < max; i++)
			{
				$.each(synced_lists[i], function(offline_id, online_id)
				{
					wunderlist.updateListId(offline_id, online_id);
				});
			}
		}

		// Update or create new lists
		if(sync_table_step1.new_lists != undefined)
		{
			var lists = sync_table_step1.new_lists;

			if(lists.length > 0)
			{
				for(var i = 0, max = lists.length; i < max; i++)
				{
					// If list is already in database
					if(wunderlist.elementExists(lists[i].online_id, 'lists'))
					{
						wunderlist.updateListByOnlineId(lists[i].online_id, lists[i].name, lists[i].deleted, lists[i].position, lists[i].version, lists[i].inbox, lists[i].shared);
					}
					else
					{
						// Create a whole new list with the given uid
						wunderlist.createListByOnlineId(lists[i].online_id, lists[i].name, lists[i].deleted, lists[i].position, lists[i].version, lists[i].inbox, lists[i].shared);
					}
				}
			}
		}

		// Update or create new tasks
		if(sync_table_step1.new_tasks != undefined)
		{
			var tasks = sync_table_step1.new_tasks;

			if(tasks.length > 0)
			{
				for(var i = 0, max = tasks.length; i < max; i++)
				{
					var sync_offline_list_id = wunderlist.getListIdByOnlineId(tasks[i].list_id);

					// If task is already in database
					if(wunderlist.elementExists(tasks[i].online_id, 'tasks'))
					{
						wunderlist.updateTaskByOnlineId(tasks[i].online_id, tasks[i].name, tasks[i].date, tasks[i].done, sync_offline_list_id, tasks[i].position, tasks[i].important, tasks[i].done_date, tasks[i].deleted, tasks[i].version, tasks[i].note);
					}
					else
					{
						// Create a whole new task with the given id
						wunderlist.createTaskByOnlineId(tasks[i].online_id, tasks[i].name, tasks[i].date, tasks[i].done, sync_offline_list_id, tasks[i].position, tasks[i].important, tasks[i].done_date, tasks[i].deleted, tasks[i].version, tasks[i].note);
					}
				}
			}
		}
	}

	// SYNC STEP 3
	data								 = {};
	data['sync_table']					 = {};
	data['sync_table']['new_tasks']		 = sync.setTaskListIdToListOnlineId(wunderlist.getDataForSync('tasks', '*', 'online_id = 0'));
	data['sync_table']['required_lists'] = {};
	data['sync_table']['required_tasks'] = {};
	data['email']						 = user_credentials['email'];
	data['password']					 = user_credentials['password'];
	data['step']						 = 2;

	// Only if there is a response or new tasks
	if(sync_table_step1 != undefined || data['sync_table']['new_tasks'] != undefined)
	{
		// Collect the tasks and lists, that the server requires
		if(sync_table_step1 != undefined)
		{
			if(sync_table_step1.required_tasks != undefined)
			{
				for(var i = 0, max = sync_table_step1.required_tasks.length; i < max; i++)
				{
					data['sync_table']['required_tasks'][i] = wunderlist.getDataForSync('tasks', '*', 'online_id = ' + sync_table_step1.required_tasks[i], false);
				}

				data['sync_table']['required_tasks'] = sync.setTaskListIdToListOnlineId(data['sync_table']['required_tasks']);
			}

			if(sync_table_step1.required_lists != undefined)
			{
				for(var i = 0, max = sync_table_step1.required_lists.length; i < max; i++)
				{
					data['sync_table']['required_lists'][i] = wunderlist.getDataForSync('lists', '*', 'online_id = ' + sync_table_step1.required_lists[i], false);
				}
			}
		}

		$.ajax({
			url: this.syncDomain,
			type: 'POST',
			data: data,
			success: function(response_data, text, xhrobject)
			{
				switchSyncSymbol(xhrobject.status);

				if(xhrobject.status == 200)
				{
					var response = eval('(' + response_data + ')');

					switch(response.code)
					{
						case sync.status_codes.SYNC_SUCCESS:
							if(response.sync_table != undefined)
							{
								// SYNC STEP 4
								var sync_table   = response.sync_table;
								var synced_tasks = sync_table.synced_tasks;
								if(synced_tasks != undefined)
								{
									for(var i = 0, max = synced_tasks.length; i < max; i++)
									{
										$.each(synced_tasks[i], function(offline_id, online_id)
										{
											wunderlist.updateTaskId(offline_id, online_id);
										});
									}
								}
							}
							break;
					}
				}
			},
			error: function(xhrobject)
			{
				showErrorDialog(language.data.sync_error);
			}
		});

		// Only if there is a sync table
		if(sync_table_step1 != undefined)
		{
			// Delete elements from database forever
			this.deleteElementsAfterSync(sync_table_step1);

			// Only, if there are new elements from online to fetch and to insert locally
			if(sync_table_step1.new_lists != undefined || sync_table_step1.new_tasks != undefined)
			{
				account.loadInterface();
			}

			// Notifications for received new lists
			if(sync_table_step1.new_lists != undefined && sync_table_step1.new_lists.length > 0)
			{
				sync.showSyncNotification(sync_table_step1.new_lists, 'list', 'Added');
			}

			// Notifications for received new tasks
			if(sync_table_step1.new_tasks != undefined && sync_table_step1.new_tasks.length > 0)
			{
				sync.showSyncNotification(sync_table_step1.new_tasks, 'task', 'Added');
			}

			// Show a notification for edited lists
			if(data['sync_table']['required_lists'] != undefined)
			{
				var required_lists_data = Titanium.JSON.stringify(data['sync_table']['required_lists']);
				required_lists_data     = eval('(' + required_lists_data + ')');

				// Notifications for edited lists
				if(required_lists_data != undefined)
				{
					sync.showSyncNotification(required_lists_data, 'list', 'Edited');
				}
			}

			// Show a notification for edited tasks
			if(data['sync_table']['required_tasks'] != undefined)
			{
				var required_tasks_data = Titanium.JSON.stringify(data['sync_table']['required_tasks']);
				required_tasks_data     = eval('(' + required_tasks_data + ')');

				// Notifications for edited tasks
				if(required_tasks_data != undefined)
				{
					sync.showSyncNotification(required_tasks_data, 'task', 'Edited');
				}
			}

		}

		// Show a notification for newly added (send) lists
		if(new_lists != undefined)
		{
			var new_lists_data = Titanium.JSON.stringify(new_lists);
			new_lists_data     = eval('(' + new_lists_data + ')');

			if(new_lists_data != undefined)
			{
				sync.showSyncNotification(new_lists_data, 'lists', 'Added');
			}
		}

		// Show a notification for newly added (send) tasks
		if(data['sync_table']['new_tasks'] != undefined)
		{
			var new_tasks_data = Titanium.JSON.stringify(data['sync_table']['new_tasks']);
			new_tasks_data     = eval('(' + new_tasks_data + ')');

			if(new_tasks_data != undefined)
			{
				sync.showSyncNotification(new_tasks_data, 'task', 'Added');
			}
		}
	}

	setTimeout(function() { sync.isSyncing = false; }, 2000);	
	stopSyncAnimation();

	if(logOutAfterSync == true)
	{
		sync.isSyncing = false;
		account.logout();
	}

	if(exitAfterSync == true)
	{
		Titanium.App.exit();
	}
}

/**
 * Show a notification for the updated tasks / lists
 *
 * @author Dennis Schneider
 */
sync.showSyncNotification = function(data, type, action)
{
	var deleted = 0;
	var edited  = 0;

	$.each(data, function(key, item)
	{
		if(item.deleted == 1)
		{
			deleted++;
		}
		else
		{
			edited++;
		}
	});

	// Add plural form
	// @TODO Prepare for different languages
	if(deleted > 1 || edited > 1)
	{
		type += 's';
	}

	if(deleted > 0)
	{
		var message = 'Deleted ' + deleted + ' ' + type;
		notifications.createNotification('Successfully synced your data', message);
	}

	if(edited > 0)
	{
		var message = action + ' ' + edited + ' ' + type;
		notifications.createNotification('Successfully synced your data', message);
	}
}

/**
 * Changes the list id temporarily to the online id
 *
 * @author Daniel Marschner
 */
sync.setTaskListIdToListOnlineId = function(tasks)
{
	if(tasks != undefined)
	{
		$.each(tasks, function(pair) {
			$.each(tasks[pair], function(key, value) {
				if(key == 'id')
				{
					var listIds = wunderlist.getListIdsByTaskId(value);

					tasks[pair]['list_id'] = listIds.online_id;
				}
			});
		});
	}

	return tasks;
}

/**
 * Deletes all elements forever from database, which have been deleted
 *
 * @author Dennis Schneider
 */
sync.deleteElementsAfterSync = function(sync_table)
{
	if(sync_table.required_lists != undefined)
	{
		if(sync_table.required_lists.length > 0)
		{
			for(var i = 0, max = sync_table.required_lists.length; i < max; i++)
			{
				if(wunderlist.elementIsDeleted(sync_table.required_lists[i], 'lists'))
				{
					wunderlist.deleteElementForever(sync_table.required_lists[i], 'lists');
				}
			}
		}
	}

	if(sync_table.required_tasks != undefined)
	{
		if(sync_table.required_tasks.length > 0)
		{
			for(var i = 0, max = sync_table.required_tasks.length; i < max; i++)
			{
				if(wunderlist.elementIsDeleted(sync_table.required_tasks[i], 'tasks'))
				{
					wunderlist.deleteElementForever(sync_table.required_tasks[i], 'tasks');
				}
			}
		}
	}

	wunderlist.deleteNotSyncedElements();
}
