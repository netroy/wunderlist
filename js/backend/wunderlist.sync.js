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
 * @author Dennis Schneider
 */
var syncUrlBase = '/1.2.0';//'https://sync.wunderlist.net/1.2.0';
wunderlist.sync.init = function() {
  this.alreadyRegistered = false;
  this.timeOutInterval   = '';
  this.isSyncing       = false;

  this.status_codes = {
    'SYNC_SUCCESS'   : 300,
    'SYNC_FAILURE'   : 301,
    'SYNC_DENIED'    : 302,
    'SYNC_NOT_EXIST' : 303
  };

  $('#sync').click(function() {
    if (wunderlist.sync.isSyncing == false) {
      if (Titanium.Network.online == true) {
        wunderlist.timer.stop();
        wunderlist.sync.fireSync();
        return false;      
      } else {
        wunderlist.helpers.dialogs.createAlertDialog(wunderlist.language.data.sync_error, wunderlist.language.data.no_internet);
      }                    
    }
  });
};





// Flags used for keeping states in syncing
var syncSuccessful = false;
var logOutAfterSync = false;
var exitAfterSync = false;
var syncListId = 0;

/**
 * Check if a logout should be done
 * @author Dennis Schneider
 */
function checkForLogout(syncSuccessful, logOutAfterSync) {
    if (syncSuccessful === false && logOutAfterSync === true) {
        setTimeout(function() {
            wunderlist.sync.isSyncing = false;
            wunderlist.account.logout();
        }, 2000);
    }
}



function syncStep1Success(response_data, text, xhrobject) {
  if (response_data !== '' && text !== '' && xhrobject !== undefined) {          
    wunderlist.layout.switchSyncSymbol(xhrobject.status);
                  
    if (xhrobject.status === 200) {
      var response = JSON.parse(response_data);

      switch(response.code) {
        case wunderlist.sync.status_codes.SYNC_SUCCESS:
          syncSuccess(response);
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
          wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.sync_denied);
          break;

        case wunderlist.sync.status_codes.SYNC_NOT_EXIST:
          wunderlist.sync.isSyncing = false;
          wunderlist.account.logout();
          wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.sync_not_exist);
          break;

        default:
          wunderlist.sync.isSyncing = false;
          checkForLogout(syncSuccessful, logOutAfterSync);
          wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.error_occurred);
          break;
      }
    }
  } else {
    wunderlist.layout.switchSyncSymbol(0);
  }
}

function syncStep1Error(response_data) {
  wunderlist.layout.switchSyncSymbol(0);
  setTimeout(function() {
      wunderlist.sync.isSyncing = false;
  }, 2000);
  checkForLogout(syncSuccessful, logOutAfterSync);
}

/**
 * Sync the application data
 * @author Dennis Schneider
 */
wunderlist.sync.fireSync = function(_logOutAfterSync, _exitAfterSync, _syncListId) {

  // Set Defaults
  logOutAfterSync = !!_logOutAfterSync;
  exitAfterSync = !!_exitAfterSync;
  syncListId = _syncListId || 0;
  
  if (Titanium.Network.online === false) {
    wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.no_internet);
    
    if (logOutAfterSync === true) {
      wunderlist.sync.isSyncing = false;
      wunderlist.account.logout();
    }
    
    if (exitAfterSync === true) {
      Titanium.App.exit();
    }
  }
  
  if (wunderlist.account.isLoggedIn() === false) {
    setTimeout(wunderlist.layout.stopSyncAnimation, 10);
    var html_code  = '<div style="min-height: 30px; padding-top: 10px;">' + wunderlist.language.data.sync_not_logged_in + '</div>';
      html_code += '<div style="padding-top: 10px; padding-bottom: 10px; min-height: 35px;">'+
                   '<input class="input-button register" type="submit" id="notloggedin-yes" value="' + 
                   wunderlist.language.data.sync_not_logged_in_yes + '" />' +
                   '<input class="input-button" type="submit" id="notloggedin-cancel" value="' + 
                   wunderlist.language.data.sync_not_logged_in_no + '" /></div>';

    var notloggedin_dialog = wunderlist.helpers.dialogs.generateDialog(wunderlist.language.data.sync_not_logged_in_title, html_code);

    wunderlist.helpers.dialogs.openDialog(notloggedin_dialog);
    $('.ui-widget-overlay').removeClass('ui-widget-overlay-wood');

    $('#notloggedin-yes').die();

    // If not logged in and want to sync
    $('#notloggedin-yes').live('click', function() {
      wunderlist.layout.stopLoginAnimation();
      $(notloggedin_dialog).dialog('close');
      wunderlist.account.showRegisterDialog();
      $('.ui-widget-overlay').addClass('ui-widget-overlay-wood');
    });

    $('#notloggedin-cancel').live('click', function() {
      $(notloggedin_dialog).dialog('close');
    });
  } else {
    if (Titanium.Network.online === true) {    
      if (wunderlist.sync.isSyncing === false) {
        // SYNC STEP 1
        var data = {};
        syncSuccessful = false;
        wunderlist.sync.isSyncing = true;

        user_credentials = wunderlist.account.getUserCredentials();
        data['email'] = user_credentials['email'];
        data['password'] = user_credentials['password'];
        data['step'] = 1;
        data['sync_table'] = {};

        var queue = [
          ['lists', 'lists', 'online_id, version', 'online_id != 0'],
          ['tasks', 'tasks', 'online_id, version', 'online_id != 0'],
          ['new_lists', 'lists', '*', 'online_id != 0 AND deleted = 0']
        ];

        async.forEach(queue, function(item, callback){
          function handler(err, results){
            data['sync_table'][item[0]] = results;
            callback(null);
          }
          wunderlist.database.getDataForSync.apply(undefined, item.slice(1).concat([undefined, handler]));
        }, function postSyncRequest(){
          // POST data for Sync
          $.ajax({
            url: syncUrlBase,
            type: 'POST',
            data: data,
            timeout: settings.REQUEST_TIMEOUT,
            beforeSend: wunderlist.layout.startSyncAnimation,
            success: syncStep1Success,
            error: syncStep1Error
          });
        });
        
      }
    } else {
      wunderlist.layout.switchSyncSymbol(0);
      setTimeout(wunderlist.layout.stopSyncAnimation, 1000);
    }
  
    // Create a timeout interval, if not already created
    // and check for a successful sync
    if (wunderlist.sync.timeOutInterval === '') {
      setTimeout(function() {
        wunderlist.sync.timeOutInterval = setInterval(function() {
          if(syncSuccessful === false) {
            wunderlist.layout.switchSyncSymbol(0);
            wunderlist.sync.isSyncing = false;
          } else {
            clearInterval(wunderlist.sync.timeOutInterval);
          }
        }, 2000);
      }, 100000);
    }
  }
};








function syncLists(lists){
  return function(callback){
    async.forEach(lists, function(item, clback) {
        wunderlist.database.existsByOnlineId('lists', item.online_id, function(err, exists){
          var method = exists ? "updateListByOnlineId": "createListByOnlineId";
          wunderlist.database[method](item.online_id, item.name, item.deleted, item.position, item.version, item.inbox, item.shared, clback);
        });
    }, callback);
  };
}

function syncTasks(tasks){
  return function(callback){
    async.forEach(tasks, function(item, clback) {
        wunderlist.database.existsByOnlineId('tasks', item.online_id, function(err, exists){
          var method = exists ? "updateTaskByOnlineId": "createTaskByOnlineId";
          wunderlist.database.getListIdByOnlineId(item.list_id, function(err, id){
            wunderlist.database[method](item.online_id, item.name, item.date, item.done, id, item.position,  
                item.important, item.done_date, item.deleted, item.version, item.note, clback);
          });
        });
    }, callback);
  };
}

function deleteTasks(tasks) {
  return function(callback) {
    async.forEach(tasks, function(item, clback) {
      wunderlist.database.deleteElements('tasks', item.online_id, clback);
    }, callback);
  };
}

/**
 * Callback on sync success
 * @author Dennis Schneider
 */
function syncSuccess(response_step1) {

  // SYNC STEP 2
  if (response_step1.sync_table !== undefined) {
    var sync_table_step1 = response_step1.sync_table;
    var synced_lists = sync_table_step1.synced_lists;

    if (synced_lists !== undefined) {
      for(var i = 0, max = synced_lists.length; i < max; i++) {
        $.each(synced_lists[i], function(offline_id, online_id) {
          wunderlist.helpers.list.set({
        	  id: offline_id,
        	  online_id: online_id
        	}).update(true);
        });
      }
      wunderlist.sync.checkForUnsyncedElements('lists');
    }
    
    var workerQueue = [];
    // Update or create new lists
    if (sync_table_step1.new_lists !== undefined) {
      workerQueue.push(syncLists(sync_table_step1.new_lists));
    }

    // Update or create new tasks
    if (sync_table_step1.new_tasks !== undefined) {
      workerQueue.push(syncTasks(sync_table_step1.new_tasks));
    }

    // Delete tasks that got removed on other devices
    if (sync_table_step1.delete_tasks !== undefined) {
      workerQueue.push(deleteTasks(sync_table_step1.delete_tasks));
    }

    if(workerQueue.length > 0) {    
      async.series(workerQueue, function(){
        console.log([arguments, "Done syncing dude"]);
      });
    }
  }


  // SYNC STEP 3
  data = {
    'sync_table': {
      'new_tasks': wunderlist.sync.setTaskListIdToListOnlineId(wunderlist.database.getDataForSync('tasks', '*', 'online_id = 0')),
      'required_lists': {},
      'required_tasks': {},
    },
    "email": user_credentials['email'],
    "password": user_credentials['password'],
    "step": 2
  };
  
  // Only if there is a response or new tasks
  if (sync_table_step1 != undefined || (data['sync_table']['new_tasks'] != undefined && JSON.stringify(data['sync_table']['new_tasks']).length > 2)) {
    // Collect the tasks and lists, that the server requires
    if (sync_table_step1 != undefined) {
      if (sync_table_step1.required_tasks != undefined) {
        for (var i = 0, max = sync_table_step1.required_tasks.length; i < max; i++) {
          data['sync_table']['required_tasks'][i] = wunderlist.database.getDataForSync('tasks', '*', 'online_id = ' + sync_table_step1.required_tasks[i], false);
        }
        data['sync_table']['required_tasks'] = wunderlist.sync.setTaskListIdToListOnlineId(data['sync_table']['required_tasks']);
      }

      if (sync_table_step1.required_lists != undefined) {
        for (var i = 0, max = sync_table_step1.required_lists.length; i < max; i++) {
          data['sync_table']['required_lists'][i] = wunderlist.database.getDataForSync('lists', '*', 'online_id = ' + sync_table_step1.required_lists[i], false);
        }
      }
    }
    
    $.ajax({
      url     : syncUrlBase,
      type    : 'POST',
      data    : data,
      success : function(response_data, text, xhrobject) {
        wunderlist.layout.switchSyncSymbol(xhrobject.status);
        if (xhrobject.status == 200) {
          var response = JSON.parse(response_data);
          
          switch(response.code) {
            case wunderlist.sync.status_codes.SYNC_SUCCESS:
              if(response.sync_table != undefined) {
                // SYNC STEP 4
                var sync_table   = response.sync_table;
                var synced_tasks = sync_table.synced_tasks;
                if(synced_tasks != undefined) {
                  for(var i = 0, max = synced_tasks.length; i < max; i++) {
                    $.each(synced_tasks[i], function(offline_id, online_id) {
                      wunderlist.helpers.task.set({
                        id: offline_id,
                        online_id: online_id
                      }).update(true);
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
        wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.sync_error);
      }
    });

    // Only if there is a sync table
    if (sync_table_step1 != undefined) {
      // Delete elements from database forever
      this.deleteElementsAfterSync(sync_table_step1);

      // Only, if there are new elements from online to fetch and to insert locally
      if (sync_table_step1.new_lists != undefined || sync_table_step1.new_tasks != undefined || 
          sync_table_step1.delete_tasks != undefined) {
        wunderlist.account.loadInterface();
      }

      wunderlist.sync.notifyListnames = {};

      // Notifications for received new lists
      if (sync_table_step1.new_lists != undefined && sync_table_step1.new_lists.length > 0) {
        wunderlist.sync.showSyncNotification(sync_table_step1.new_lists, 'lists');
      }

      // Notifications for received new tasks
      if (sync_table_step1.new_tasks != undefined && sync_table_step1.new_tasks.length > 0) {
        wunderlist.sync.showSyncNotification(sync_table_step1.new_tasks, 'tasks');
      }
      
      // Show Notifications
      var message = '';
      $.each(wunderlist.sync.notifyListnames, function(key, item) {
        if (item !== undefined) {
          message += 'Updated the list "' + unescape(item) + '"\n';
        }
      });

      if (sync_table_step1.new_tasks !== undefined && sync_table_step1.new_lists !== undefined) {
        wunderlist.notifications.createNotification('Successfully synced your data', message);
      }
    }
  }

  setTimeout(function() {
    wunderlist.sync.isSyncing = false;
  }, 2000);  
  wunderlist.layout.stopSyncAnimation();

  // The callback for the sharing functionality
  if (list_id > 0) {
    // Only share the list, if it is already shared and already synced
    if (wunderlist.database.isShared(list_id) === true && wunderlist.database.isSynced(list_id) === true) {
      setTimeout(function() {
        wunderlist.sharing.sendSharedList(list_id);
      }, 100);
    }
  }

  // Log out after sync callback
  if (logOutAfterSync === true) {
    wunderlist.sync.isSyncing = false;
    wunderlist.account.logout();
  }

  // Exit after sync callback
  if (exitAfterSync == true) {
    Titanium.App.exit();
  }
};

/**
 * Show a notification for the updated tasks / lists
 * @author Dennis Schneider
 */
wunderlist.sync.showSyncNotification = function(data, type) {
  if (type == 'lists') {
    $.each(data, function(key, item) {
      wunderlist.sync.notifyListnames[item.name] = item.name;
    });
  } else {
    $.each(data, function(key, item){
      wunderlist.database.getLists(item.list_id, function(dbList){
        wunderlist.sync.notifyListnames[dbList.name] = dbList.name;
      });
    });
  }
};

/**
 * Changes the list id temporarily to the online id
 * @author Daniel Marschner
 */
wunderlist.sync.setTaskListIdToListOnlineId = function(tasks) {
  if (tasks !== undefined) {
    $.each(tasks, function(pair) {
      $.each(tasks[pair], function(key, value) {
        if (key === 'id') {
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
 * @author Dennis Schneider
 */
wunderlist.sync.deleteElementsAfterSync = function(sync_table) {
  if (sync_table.required_lists != undefined) {
    if (sync_table.required_lists.length > 0) {
      for (var i = 0, max = sync_table.required_lists.length; i < max; i++) {
        if (wunderlist.database.isDeleted('lists', sync_table.required_lists[i])) {
          wunderlist.database.deleteElements('lists', sync_table.required_lists[i]);
        }
      }
    }
  }

  if (sync_table.required_tasks !== undefined) {
    if (sync_table.required_tasks.length > 0) {
      for (var i = 0, max = sync_table.required_tasks.length; i < max; i++) {
        if (wunderlist.database.isDeleted('tasks', sync_table.required_tasks[i])) {
          wunderlist.database.deleteElements('tasks', sync_table.required_tasks[i]);
        }
      }
    }
  }

  wunderlist.database.deleteNotSyncedElements();
  wunderlist.frontend.filters.updateBadges();
};

/**
 * Checks for unsynced data and throws an error if so
 * @author Dennis Schneider
 */
wunderlist.sync.checkForUnsyncedElements = function(type) {
  var hasUnsyncedElements = wunderlist.database.hasElementsWithoutOnlineId(type);
  if (hasUnsyncedElements === true) {
    wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.unsynced_data);
  }
};