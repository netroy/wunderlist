/**
 * wunderlist.sync.js
 * Class for logging in into sync server, sync sending and retrieval
 * @author Dennis Schneider
 */
wunderlist.sync = (function(window, $, wunderlist, settings, async, Titanium, undefined){
  "use strict";

  var syncUrlBase = '/1.2.0',//'https://sync.wunderlist.net/1.2.0';
      alreadyRegistered = false,
      isSyncing = false,
      timeOutInterval, 
      user_credentials;

  // Response Status codes
  var status_codes = {
    'SYNC_SUCCESS'   : 300,
    'SYNC_FAILURE'   : 301,
    'SYNC_DENIED'    : 302,
    'SYNC_NOT_EXIST' : 303
  };

  // Flags used for keeping states in syncing
  var syncSuccessful = false,
      logOutAfterSync = false,
      exitAfterSync = false,
      syncListId = 0,
      syncedListCount,
      syncedTaskCount;


  function syncClick() {
    user_credentials = user_credentials || wunderlist.account.getUserCredentials();

    if (isSyncing === false) {
      if (Titanium.Network.online === true) {
        wunderlist.timer.stop();
        wunderlist.sync.fireSync();
        return false;      
      } else {
        wunderlist.helpers.dialogs.createAlertDialog(wunderlist.language.data.sync_error, wunderlist.language.data.no_internet);
      }                    
    }
  }


  /**
   * Deletes all elements forever from database, which have been deleted
   * @author Dennis Schneider
   */
  function deleteElementsAfterSync(sync_table) {
    async.forEach(['lists', 'tasks'], function(type, clback){
      var table = sync_table['required_' + type];
      if (table !== undefined && table.length > 0) {
        async.forEach(table, function(item, callback){
          wunderlist.database.isDeleted(type, item.online_id, function(err, deleted){
            if(!deleted) {
              wunderlist.database.deleteElements(type, item.online_id, callback);
            } else {
              callback(null);
            }
          });
        }, clback);
      } else {
        clback(null);
      }
    }, function(err){
      wunderlist.database.deleteNotSyncedElements(wunderlist.nop);
      wunderlist.frontend.filters.updateBadges();
    });
  }


  /**
   * Checks for unsynced data and throws an error if so
   * @author Dennis Schneider
   */
  function checkForUnsyncedElements(type) {
    var hasUnsyncedElements = wunderlist.database.hasElementsWithoutOnlineId(type);
    if (hasUnsyncedElements === true) {
      wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.unsynced_data);
    }
  }


  /**
   * Changes the list id temporarily to the online id
   * @author Daniel Marschner
   */
  function setTaskListIdToListOnlineId(tasks, callback) {
    if (tasks !== undefined) {
      $.each(tasks, function(pair) {
        $.each(tasks[pair], function(key, value) {
          if (key === 'id') {
            var listIds = wunderlist.database.getListIdsByTaskId(value);
            tasks[pair].list_id = listIds.online_id;
          }
        });
      });
    }
    return tasks;
  }


  /**
   * Check if a logout should be done
   * @author Dennis Schneider
   */
  function checkForLogout(syncSuccessful, logOutAfterSync) {
      if (syncSuccessful === false && logOutAfterSync === true) {
          window.setTimeout(function() {
              isSyncing = false;
              wunderlist.account.logout();
          }, 2000);
      }
  }


  function updateListIds(offline_id, online_id) {
    wunderlist.helpers.list.set({
      id: offline_id,
      online_id: online_id
    }).update(true);
  }


  function updateTaskIds(offline_id, online_id) {
    wunderlist.helpers.task.set({
      id: offline_id,
      online_id: online_id
    }).update(true);
  }


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


  function syncStep3Success(response_data, text, xhrobject) {
    wunderlist.layout.switchSyncSymbol(xhrobject.status);
    if (xhrobject.status == 200) {
      var response = JSON.parse(response_data);
    
      if(response.code === status_codes.SYNC_SUCCESS && response.sync_table !== undefined) {
        // SYNC STEP 4
        var sync_table   = response.sync_table;
        var synced_tasks = sync_table.synced_tasks;
        if(synced_tasks !== undefined) {
          for(var i = 0, max = synced_tasks.length; i < max; i++) {
            $.each(synced_tasks[i], updateTaskIds);
          }
        }
        checkForUnsyncedElements('tasks');
      }
    }
  }


  /**
   * Callback on sync success
   * @author Dennis Schneider
   */
  function syncSuccess(response_step1) { 
    var i, length;

    if (response_step1.sync_table === undefined) {
      return;
    }

    // SYNC STEP 2
    var sync_table_step1 = response_step1.sync_table;
    var synced_lists = sync_table_step1.synced_lists;

    if (synced_lists !== undefined) {
      for(i = 0, length = synced_lists.length; i < length; i++) {
        $.each(synced_lists[i], updateListIds);
      }
      checkForUnsyncedElements('lists');
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
      async.series(workerQueue, function(err){
        wunderlist.frontend.lists.redraw();
      });
    }


  // DEBUG
  //return;

    // SYNC STEP 3
    var new_tasks;
    wunderlist.database.getDataForSync('tasks', '*', 'online_id = 0', undefined, function(err, values){
      setTaskListIdToListOnlineId(function(err){
        new_tasks = {};
      });
    });


    var data = {
      'sync_table': {
        'new_tasks': new_tasks,
        'required_lists': {},
        'required_tasks': {}
      },
      "email": user_credentials.email,
      "password": user_credentials.password,
      "step": 2
    };
  
  
    // Only if there is a response or new tasks
    if (sync_table_step1 !== undefined || (data.sync_table.new_tasks !== undefined && JSON.stringify(data.sync_table.new_tasks).length > 2)) {
      // Collect the tasks and lists, that the server requires
      if (sync_table_step1 !== undefined) {
        if (sync_table_step1.required_tasks !== undefined) {
          for (i = 0, length = sync_table_step1.required_tasks.length; i < length; i++) {
            data.sync_table.required_tasks[i] = wunderlist.database.getDataForSync('tasks', '*', 'online_id = ' + sync_table_step1.required_tasks[i], false);
          }
          data.sync_table.required_tasks = setTaskListIdToListOnlineId(data.sync_table.required_tasks);
        }

        if (sync_table_step1.required_lists !== undefined) {
          for (i = 0, length = sync_table_step1.required_lists.length; i < length; i++) {
            data.sync_table.required_lists[i] = wunderlist.database.getDataForSync('lists', '*', 'online_id = ' + sync_table_step1.required_lists[i], false);
          }
        }
      }
    
      $.ajax({
        url     : syncUrlBase,
        type    : 'POST',
        data    : data,
        success : syncStep3Success,
        error: function() {
          wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.sync_error);
        }
      });

      // Only if there is a sync table
      if (sync_table_step1 !== undefined) {
        // Delete elements from database forever
        deleteElementsAfterSync(sync_table_step1);

        // Only, if there are new elements from online to fetch and to insert locally
        if (sync_table_step1.new_lists !== undefined || sync_table_step1.new_tasks !== undefined || sync_table_step1.delete_tasks !== undefined) {
          wunderlist.account.loadInterface();
        }

        syncedListCount = syncedTaskCount = 0;

        // Notifications for received new lists
        if (sync_table_step1.new_lists !== undefined) {
          syncedListCount = sync_table_step1.new_lists.length;
        }

        // Notifications for received new tasks
        if (sync_table_step1.new_tasks !== undefined) {
          syncedTaskCount = sync_table_step1.new_tasks.length;
        }
      
        // Show Notifications
        var message = 'Updated ' + syncedListCount + ' list(s)';
        if(syncedTaskCount > 0){
          message += ' & ' + syncedTaskCount + ' tasks';
        }
        message += ".";

        if (syncedListCount > 0 && syncedTaskCount > 0) {
          wunderlist.notifications.createNotification('Successfully synced your data', message);
        }
      }
    }

    window.setTimeout(function() {
      isSyncing = false;
    }, 2000);  
    wunderlist.layout.stopSyncAnimation();

    // The callback for the sharing functionality
    if (syncListId > 0) {
      // Only share the list, if it is already shared and already synced
      if (wunderlist.database.isShared(syncListId) === true && wunderlist.database.isSynced(syncListId) === true) {
        window.setTimeout(function() {
          wunderlist.sharing.sendSharedList(syncListId);
        }, 100);
      }
    }

    // Log out after sync callback
    if (logOutAfterSync === true) {
      isSyncing = false;
      wunderlist.account.logout();
    }

    // Exit after sync callback
    if (exitAfterSync === true) {
      Titanium.App.exit();
    }
  }


  function syncStep1Success(response_data, text, xhrobject) {
    if (response_data !== '' && text !== '' && xhrobject !== undefined) {          
      wunderlist.layout.switchSyncSymbol(xhrobject.status);
                  
      if (xhrobject.status === 200) {
        var response = JSON.parse(response_data);

        switch(response.code) {
          case status_codes.SYNC_SUCCESS:
            syncSuccess(response);
            syncSuccessful = true;
            window.clearInterval(timeOutInterval);
            timeOutInterval = null;
            break;

          case status_codes.SYNC_FAILURE:
            isSyncing = false;
            break;

          case status_codes.SYNC_DENIED:
            isSyncing = false;
            wunderlist.account.logout();
            wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.sync_denied);
            break;

          case status_codes.SYNC_NOT_EXIST:
            isSyncing = false;
            wunderlist.account.logout();
            wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.sync_not_exist);
            break;

          default:
            isSyncing = false;
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
    window.setTimeout(function() {
        isSyncing = false;
    }, 2000);
    checkForLogout(syncSuccessful, logOutAfterSync);
  }


  /**
   * Sync the application data
   * @author Dennis Schneider
   */
  function fireSync(_logOutAfterSync, _exitAfterSync, _syncListId) {

    // Set Defaults
    logOutAfterSync = !!_logOutAfterSync;
    exitAfterSync = !!_exitAfterSync;
    syncListId = _syncListId || 0;
  
    if (Titanium.Network.online === false) {
      wunderlist.helpers.dialogs.showErrorDialog(wunderlist.language.data.no_internet);
    
      if (logOutAfterSync === true) {
        isSyncing = false;
        wunderlist.account.logout();
      }
    
      if (exitAfterSync === true) {
        Titanium.App.exit();
      }
    }
  
    if (wunderlist.account.isLoggedIn() === false) {
      window.setTimeout(wunderlist.layout.stopSyncAnimation, 10);
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
        if (isSyncing === false) {
          // SYNC STEP 1
          syncSuccessful = false;
          isSyncing = true;

          var data = {
            'email': user_credentials.email,
            'password': user_credentials.password,
            'step': 1,
            'sync_table': {}
          };

          var queue = [
            ['lists', 'lists', 'online_id, version', 'online_id = 0'],
            ['tasks', 'tasks', 'online_id, version', 'online_id = 0'],
            ['new_lists', 'lists', '*', 'online_id != 0 AND deleted = 0']
          ];

          async.forEach(queue, function(item, callback){
            function handler(err, results){
              //data.sync_table[item[0]] = results;
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
        window.setTimeout(wunderlist.layout.stopSyncAnimation, 1000);
      }
  
      // Create a timeout interval, if not already created
      // and check for a successful sync
      if (timeOutInterval === null) {
        window.setTimeout(function() {
          timeOutInterval = window.setInterval(function() {
            if(syncSuccessful === false) {
              wunderlist.layout.switchSyncSymbol(0);
              isSyncing = false;
            } else {
              window.clearInterval(timeOutInterval);
              timeOutInterval = null;
            }
          }, 2000);
        }, 100000);
      }
    }
  }



  /**
   * Initializes sync module
   * @author Dennis Schneider
   */
  function init() {
    isSyncing = false;
    $('#sync').click(syncClick);
  }


  return {
    "init": init,
    "fireSync": fireSync,
    "isSyncing": function(){return isSyncing;}
  };

})(window, jQuery, wunderlist, settings, async, Titanium);