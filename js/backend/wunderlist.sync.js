/**
 * wunderlist.sync.js
 *
 * Class for logging in into sync server, sync sending and retrieval
 *
 * @author Dennis Schneider
 */

wunderlist.sync = wunderlist.sync || {};

/**
 * Initializes the sync class
 *
 * @author Dennis Schneider
 */
wunderlist.sync.init = function() {
	this.syncDomain 	   = 'https://sync.wunderlist.net/1.2.0';
	this.alreadyRegistered = false;
	this.timeOutInterval   = '';
	this.isSyncing		   = false;

	this.status_codes = {
        'SYNC_SUCCESS'   : 300,
        'SYNC_FAILURE'   : 301,
        'SYNC_DENIED'    : 302,
        'SYNC_NOT_EXIST' : 303
    };

	$('#sync').click(function() {
		if (wunderlist.sync.isSyncing == false)
		{
			if (Titanium.Network.online == true)
			{
				wunderlist.timer.stop();
				wunderlist.sync.fireSync();
				return false;			
			}
			else
			{
				dialogs.createAlertDialog(wunderlist.language.data.sync_error, wunderlist.language.data.no_internet_sync);
			}										
		}
	});
};

/**
 * Check if a logout should be done
 *
 * @author Dennis Schneider
 */
wunderlist.sync.checkForLogout = function(syncSuccessful, logOutAfterSync) {
    if (syncSuccessful == false && logOutAfterSync == true)
    {
        setTimeout(function() {
            wunderlist.sync.isSyncing = false;
            wunderlist.account.logout();
        }, 2000);
    }
}

/**
 * Sync the application data
 *
 * @author Dennis Schneider
 */
wunderlist.sync.fireSync = function(logOutAfterSync, exitAfterSync, list_id) {
	if (list_id == undefined)
	{
		list_id = 0;
	}

	// Should the user be logged out after sync?
	if (logOutAfterSync == undefined)
	{
		logOutAfterSync = false;
	}
	
	if (exitAfterSync == undefined)
	{
		exitAfterSync = false;
	}
	
	if (Titanium.Network.online == false)
	{
		dialogs.showErrorDialog(wunderlist.language.data.no_internet);
		
		if (logOutAfterSync == true)
		{
			wunderlist.sync.isSyncing = false;
			wunderlist.account.logout();
		}
		
		if (exitAfterSync == true)
		{
			Titanium.App.exit();
		}
	}
	
	if (wunderlist.account.isLoggedIn() == false)
	{
		setTimeout(stopSyncAnimation, 10);
		var html_code  = '<div style="min-height: 30px; padding-top: 10px;">' + wunderlist.language.data.sync_not_logged_in + '</div>';
			html_code += '<div style="padding-top: 10px; padding-bottom: 10px; min-height: 35px;"><input class="input-button register" type="submit" id="notloggedin-yes" value="' + wunderlist.language.data.sync_not_logged_in_yes + '" />' +
					'<input class="input-button" type="submit" id="notloggedin-cancel" value="' + wunderlist.language.data.sync_not_logged_in_no + '" /></div>';

	  	var notloggedin_dialog = dialogs.generateDialog(wunderlist.language.data.sync_not_logged_in_title, html_code);
		dialogs.openDialog(notloggedin_dialog);
		$('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');

		$('#notloggedin-yes').die();

		// If not logged in and want to sync
		$('#notloggedin-yes').live('click', function() {
			Layout.stopLoginAnimation();
			$(notloggedin_dialog).dialog('close');
			wunderlist.account.showRegisterDialog();
			$('.ui-widget-overlay').addClass('ui-widget-overlay-wood');
		});

		$('#notloggedin-cancel').live('click', function() {
			$(notloggedin_dialog).dialog('close');
		});
	}
	else
	{
		if (Titanium.Network.online == true)
		{		
			if (wunderlist.sync.isSyncing == false)
			{
				// SYNC STEP 1
				var data = {};
				user_credentials			    = wunderlist.account.getUserCredentials();
				data['email']					= user_credentials['email'];
				data['password']				= user_credentials['password'];
				data['step']					= 1;
				data['sync_table']				= {};
				data['sync_table']['lists']		= wunderlist.database.getDataForSync('lists', 'online_id, version', 'online_id != 0');
				data['sync_table']['tasks']		= wunderlist.database.getDataForSync('tasks', 'online_id, version', 'online_id != 0');
				data['sync_table']['new_lists']	= wunderlist.database.getDataForSync('lists', '*', 'online_id = 0 AND deleted = 0');			
				
				var syncSuccessful        = false;
				wunderlist.sync.isSyncing = true;
				
				$.ajax({
					url: this.syncDomain,
					type: 'POST',
					data: data,
					timeout: settings.REQUEST_TIMEOUT,
					beforeSend: function() {
		    			startSyncAnimation();
					},
					success: function(response_data, text, xhrobject) {
						if (response_data != '' && text != '' && xhrobject != undefined)
						{					
							switchSyncSymbol(xhrobject.status);
                            
							if (xhrobject.status == 200)
							{
								var response = JSON.parse(response_data);
								
								switch(response.code)
								{
									case wunderlist.sync.status_codes.SYNC_SUCCESS:
										wunderlist.sync.syncSuccess(response, logOutAfterSync, exitAfterSync, list_id);
										syncSuccessful = true;
										clearInterval(wunderlist.sync.timeOutInterval);
										wunderlist.sync.timeOutInterval = '';
										break;
		
									case wunderlist.sync.status_codes.SYNC_FAILURE:
										wunderlist.sync.isSyncing = false;
										break;
		
									case wunderlist.sync.status_codes.SYNC_DENIED:
										wunderlist.sync.isSyncing = false;
										wunderlist.account.logout();
										dialogs.showErrorDialog(wunderlist.language.data.sync_denied);
										break;
		
									case wunderlist.sync.status_codes.SYNC_NOT_EXIST:
										wunderlist.sync.isSyncing = false;
										wunderlist.account.logout();
										dialogs.showErrorDialog(wunderlist.language.data.sync_not_exist);
										break;
		
									default:
										wunderlist.sync.isSyncing = false;
										wunderlist.sync.checkForLogout(syncSuccessful, logOutAfterSync);
										dialogs.showErrorDialog(wunderlist.language.data.error_occurred);
										break;
								}
							}
						}
						else
						{
							switchSyncSymbol(0);
						}
					},
					error: function(response_data) {
						switchSyncSymbol(0);
						setTimeout(function() {
						    wunderlist.sync.isSyncing = false;
						}, 2000);
						wunderlist.sync.checkForLogout(syncSuccessful, logOutAfterSync);
					}
				});
			}
		}
		else
		{
			switchSyncSymbol(0);
			setTimeout(stopSyncAnimation, 1000);
		}
	
		// Create a timeout interval, if not already created
		// and check for a successful sync
		if (wunderlist.sync.timeOutInterval == '')
		{
			setTimeout(function() {
				wunderlist.sync.timeOutInterval = setInterval(function() {
					if(syncSuccessful == false)
					{
						switchSyncSymbol(0);
						wunderlist.sync.isSyncing = false;
					}
					else
					{
						clearInterval(wunderlist.sync.timeOutInterval);
					}
				}, 2000);
			}, 100000);
		}
	}
};

/**
 * Callback on sync success
 *
 * @author Dennis Schneider
 */
wunderlist.sync.syncSuccess = function(response_step1, logOutAfterSync, exitAfterSync, list_id) {
    
	// SYNC STEP 2
	if (response_step1.sync_table != undefined)
	{
		var sync_table_step1 = response_step1.sync_table;
		var synced_lists 	 = sync_table_step1.synced_lists;

		if (synced_lists != undefined)
		{
			for(var i = 0, max = synced_lists.length; i < max; i++)
			{
				$.each(synced_lists[i], function(offline_id, online_id) {
					list.id        = offline_id;
					list.online_id = online_id;
					list.update(true);
				});
			}
			
			wunderlist.sync.checkForUnsyncedElements('lists');
		}

		// Update or create new lists
		if (sync_table_step1.new_lists != undefined)
		{
			var lists = sync_table_step1.new_lists;

			if (lists.length > 0)
			{
				for (var i = 0, max = lists.length; i < max; i++)
				{
					// If list is already in database
					if (wunderlist.database.existsByOnlineId('lists', lists[i].online_id))
					{
						wunderlist.database.updateListByOnlineId(lists[i].online_id, lists[i].name, lists[i].deleted, lists[i].position, lists[i].version, lists[i].inbox, lists[i].shared);
					}
					else
					{
						// Create a whole new list with the given uid
						wunderlist.database.createListByOnlineId(lists[i].online_id, lists[i].name, lists[i].deleted, lists[i].position, lists[i].version, lists[i].inbox, lists[i].shared);
					}
				}
			}
		}

		// Update or create new tasks
		if (sync_table_step1.new_tasks != undefined)
		{
			var tasks = sync_table_step1.new_tasks;

			if (tasks.length > 0)
			{
				for (var i = 0, max = tasks.length; i < max; i++)
				{
					var sync_offline_list_id = wunderlist.database.getListIdByOnlineId(tasks[i].list_id);

					// If task is already in database
					if (wunderlist.database.existsByOnlineId('tasks', tasks[i].online_id))
					{
						wunderlist.database.updateTaskByOnlineId(tasks[i].online_id, tasks[i].name, tasks[i].date, tasks[i].done, sync_offline_list_id, tasks[i].position, tasks[i].important, tasks[i].done_date, tasks[i].deleted, tasks[i].version, tasks[i].note);
					}
					else
					{
						// Create a whole new task with the given id
						wunderlist.database.createTaskByOnlineId(tasks[i].online_id, tasks[i].name, tasks[i].date, tasks[i].done, sync_offline_list_id, tasks[i].position, tasks[i].important, tasks[i].done_date, tasks[i].deleted, tasks[i].version, tasks[i].note);
					}
				}
			}
		}
		
        if (sync_table_step1.delete_tasks != undefined)
        {
            for (var x in sync_table_step1.delete_tasks)
            {
                wunderlist.database.deleteElements('tasks', sync_table_step1.delete_tasks[x]);
            }
        }
	}

	// SYNC STEP 3
	data								 = {};
	data['sync_table']					 = {};
	data['sync_table']['new_tasks']		 = wunderlist.sync.setTaskListIdToListOnlineId(wunderlist.database.getDataForSync('tasks', '*', 'online_id = 0'));
	data['sync_table']['required_lists'] = {};
	data['sync_table']['required_tasks'] = {};
	data['email']						 = user_credentials['email'];
	data['password']					 = user_credentials['password'];
	data['step']						 = 2;
	
	// Only if there is a response or new tasks
	if (sync_table_step1 != undefined || (data['sync_table']['new_tasks'] != undefined && JSON.stringify(data['sync_table']['new_tasks']).length > 2))
	{
		// Collect the tasks and lists, that the server requires
		if (sync_table_step1 != undefined)
		{
			if (sync_table_step1.required_tasks != undefined)
			{
				for (var i = 0, max = sync_table_step1.required_tasks.length; i < max; i++)
				{
					data['sync_table']['required_tasks'][i] = wunderlist.database.getDataForSync('tasks', '*', 'online_id = ' + sync_table_step1.required_tasks[i], false);
				}

				data['sync_table']['required_tasks'] = wunderlist.sync.setTaskListIdToListOnlineId(data['sync_table']['required_tasks']);
			}

			if (sync_table_step1.required_lists != undefined)
			{
				for (var i = 0, max = sync_table_step1.required_lists.length; i < max; i++)
				{
					data['sync_table']['required_lists'][i] = wunderlist.database.getDataForSync('lists', '*', 'online_id = ' + sync_table_step1.required_lists[i], false);
				}
			}
		}
		
		$.ajax({
			url     : this.syncDomain,
			type    : 'POST',
			data    : data,
			success : function(response_data, text, xhrobject) {
				switchSyncSymbol(xhrobject.status);
				if (xhrobject.status == 200)
				{
					var response = JSON.parse(response_data);
					
					switch(response.code)
					{
						case wunderlist.sync.status_codes.SYNC_SUCCESS:
							if(response.sync_table != undefined)
							{
								// SYNC STEP 4
								var sync_table   = response.sync_table;
								var synced_tasks = sync_table.synced_tasks;
								if(synced_tasks != undefined)
								{
									for(var i = 0, max = synced_tasks.length; i < max; i++)
									{
										$.each(synced_tasks[i], function(offline_id, online_id) {
											task.id        = offline_id;
											task.online_id = online_id;
											task.update(true);
										});
									}
								}
								
								wunderlist.sync.checkForUnsyncedElements('tasks');
							}
							break;
					}
				}
			},
			error: function(xhrobject) {
				dialogs.showErrorDialog(wunderlist.language.data.sync_error);
			}
		});

		// Only if there is a sync table
		if (sync_table_step1 != undefined)
		{
			// Delete elements from database forever
			this.deleteElementsAfterSync(sync_table_step1);

			// Only, if there are new elements from online to fetch and to insert locally
			if (sync_table_step1.new_lists != undefined || sync_table_step1.new_tasks != undefined || sync_table_step1.delete_tasks != undefined)
			{
				wunderlist.account.loadInterface();
			}

			wunderlist.sync.notifyListnames = {};

			// Notifications for received new lists
			if (sync_table_step1.new_lists != undefined && sync_table_step1.new_lists.length > 0)
			{
				wunderlist.sync.showSyncNotification(sync_table_step1.new_lists, 'lists');
			}

			// Notifications for received new tasks
			if (sync_table_step1.new_tasks != undefined && sync_table_step1.new_tasks.length > 0)
			{
				wunderlist.sync.showSyncNotification(sync_table_step1.new_tasks, 'tasks');
			}

			var message = '';
			
			// Show Notifications
			$.each(wunderlist.sync.notifyListnames, function(key, item)
			{
				if (item != undefined)
				{
					message += 'Updated the list "' + unescape(item) + '"\n';
				}
			});

			if (sync_table_step1.new_tasks != undefined && sync_table_step1.new_lists != undefined)
			{
				wunderlist.notifications.createNotification('Successfully synced your data', message);
			}
		}
	}

	setTimeout(function() {wunderlist.sync.isSyncing = false;}, 2000);	
	stopSyncAnimation();

	// The callback for the sharing functionality
	if (list_id > 0)
	{
		// Only share the list, if it is already shared and already synced
		if (wunderlist.database.isShared(list_id) == true && wunderlist.database.isSynced(list_id) == true)
		{
			setTimeout(function() {
				wunderlist.sharing.sendSharedList(list_id);
			}, 100);
		}
	}

	// Log out after sync callback
	if (logOutAfterSync == true)
	{
		wunderlist.sync.isSyncing = false;
		wunderlist.account.logout();
	}

	// Exit after sync callback
	if (exitAfterSync == true)
	{
		Titanium.App.exit();
	}
};

/**
 * Show a notification for the updated tasks / lists
 *
 * @author Dennis Schneider
 */
wunderlist.sync.showSyncNotification = function(data, type) {
	if (type == 'lists')
	{
		$.each(data, function(key, item) {
			wunderlist.sync.notifyListnames[item.name] = item.name;
		});
	}
	else
	{
		$.each(data, function(key, item) 
		{
			var dbList = wunderlist.database.getLists(item.list_id);
			wunderlist.sync.notifyListnames[dbList.name] = dbList.name;
		});
	}
};

/**
 * Changes the list id temporarily to the online id
 *
 * @author Daniel Marschner
 */
wunderlist.sync.setTaskListIdToListOnlineId = function(tasks) {
	if (tasks != undefined)
	{
		$.each(tasks, function(pair) {
			$.each(tasks[pair], function(key, value) {
				if (key == 'id')
				{
					var listIds = wunderlist.database.getListIdsByTaskId(value);

					tasks[pair]['list_id'] = listIds.online_id;
				}
			});
		});
	}

	return tasks;
};

/**
 * Deletes all elements forever from database, which have been deleted
 *
 * @author Dennis Schneider
 */
wunderlist.sync.deleteElementsAfterSync = function(sync_table) {
	if (sync_table.required_lists != undefined)
	{
		if (sync_table.required_lists.length > 0)
		{
			for (var i = 0, max = sync_table.required_lists.length; i < max; i++)
			{
				if (wunderlist.database.isDeleted('lists', sync_table.required_lists[i]))
				{
					wunderlist.database.deleteElements('lists', sync_table.required_lists[i]);
				}
			}
		}
	}

	if (sync_table.required_tasks != undefined)
	{
		if (sync_table.required_tasks.length > 0)
		{
			for (var i = 0, max = sync_table.required_tasks.length; i < max; i++)
			{
				if (wunderlist.database.isDeleted('tasks', sync_table.required_tasks[i]))
				{
					wunderlist.database.deleteElements('tasks', sync_table.required_tasks[i]);
				}
			}
		}
	}

	wunderlist.database.deleteNotSyncedElements();
};

/**
 * Checks for unsynced data and throws an error if so
 *
 * @author Dennis Schneider
 */
wunderlist.sync.checkForUnsyncedElements = function(type) {
	var hasUnsyncedElements = wunderlist.database.hasElementsWithoutOnlineId(type);
	
	if (hasUnsyncedElements == true)
	{
		dialogs.showErrorDialog(wunderlist.language.data.unsynced_data);
	}
};