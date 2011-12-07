/* global wunderlist */
wunderlist.database = (function(wunderlist, html, async, window, undefined){
  "use strict";
  
  var DB_NAME  = "wunderlist",
      DB_TITLE = "Wunderlist",
      DB_BYTES = 5*1024*1024, // 5MB
      db;

  function log(){
    window.console.log.apply(window.console, arguments);
  }

  function printf(text){
    var i = 1, args = arguments;
    return text.replace(/\?/g, function(){
      var val = args[i++];
      if(typeof val === 'undefined'){
        return "";
      }
      return val;
    });
  }

  /**
   * Execute SQL
   * @param sql - sql string or template
   * other arguments are used for rendering templates & last argument if a function, is used for callback
   */
  function execute(sql){
    var args = Array.prototype.slice.call(arguments, 0);
    //var caller = arguments.callee.caller.name;
    var callback = function(){
      log([args].concat(arguments));
    };
    if(typeof args[args.length-1] === 'function'){
      callback = args.pop();
    }

    sql = printf.apply(null, args);
    db.transaction(function(tx){
      tx.executeSql(sql, [], function(t, result){
        callback(null, result);
      }, function(t, err) {
        callback(err);
      });
    });
  }


  /**
   * Convert results object to an array of row objects
   * @param - SQLResult object
   */
  function resultToArray(result){
    var rows = result.rows, row, arr = [];
    for(var i = 0, l = rows.length; i < l; i++) {
      arr.push(rows.item(i));
    }
    return arr;
  }


  /**
   * Create tables for lists & tasks if they don't exist already
   */

  var createlistsSQL = "CREATE TABLE IF NOT EXISTS lists (id INTEGER PRIMARY KEY AUTOINCREMENT, online_id INTEGER DEFAULT 0, "+
                   "name TEXT, position INTEGER DEFAULT 0, version INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, "+
                   "inbox INTEGER DEFAULT 0, shared INTEGER DEFAULT 0)";
  var createtasksSQL = "CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, online_id INTEGER DEFAULT 0, "+
                   "name TEXT, list_id TEXT, note TEXT DEFAULT '', date INTEGER DEFAULT 0, done_date INTEGER DEFAULT 0, "+
                   "done INTEGER DEFAULT 0, position INTEGER DEFAULT 0, important INTEGER DEFAULT 0, version INTEGER DEFAULT 0, "+
                   "deleted INTEGER DEFAULT 0)";
  function createTables(callback) {
    async.forEach([createlistsSQL, createtasksSQL], execute, wunderlist.nop);
  }


  /**
   * Clean up the DB
   * @param callback - function to call when cleanup finishes
   */
  var deleteSQL = "DELETE FROM ?";
  var deleteSequenceSQL = "DELETE FROM sqlite_sequence WHERE name = '?'";
  function truncate(callback) {
    var queue = [];
    queue.push(printf(deleteSQL, 'lists'));
    queue.push(printf(deleteSQL, 'tasks'));
    queue.push(printf(deleteSequenceSQL, 'lists'));
    queue.push(printf(deleteSequenceSQL, 'tasks'));
    async.forEach(queue, execute, callback);
  }

  /**
   * Gets list(s) from the database. 
   * @param list_id (Optional) - numeric id of a list to fetch (for getting individual lists)
   * @param callback - function to call with an array of fetched list
   * TODO: getTasks looks very similar, try to merge.
   */
  var getListsSQL = "SELECT lists.*, (SELECT COUNT(tasks.id) FROM tasks WHERE tasks.list_id = lists.id AND deleted = 0 AND done = 0) " +
                        "as taskCount FROM lists WHERE lists.deleted = 0 ? ORDER BY lists.inbox DESC, lists.position ASC";
  function getLists(list_id, callback) {
    var where = '';

    if (typeof list_id === 'number'){
      where += ' AND lists.id = ' + list_id;
    }

    execute(getListsSQL, where, function(err, result){
      if(err){
        callback(err);
        return;
      }
      callback(null, resultToArray(result));
    });
  }

  /**
   * Gets Task(s) from the database
   * @param task_id (Optional) - id of task to fetch
   * @param list_id (Optional) - id of list to look into
   * @param callback - function to call with array of fetched task objects
   */
  var getTasksSQL = "SELECT * FROM tasks WHERE deleted = 0 AND done = 0 ? ORDER BY important DESC, position ASC";
  function getTasks(task_id, list_id, callback) {
    var where = '';

    if (typeof task_id === 'number' && task_id > 0){
      where += " AND id = " + task_id;
    }
    if (typeof list_id === 'number' && list_id > 0){
      where += " AND list_id = " + list_id;
    }

    execute(getTasksSQL, where, function(err, result){
      if(err){
        callback(err);
        return;
      }
      callback(null, resultToArray(result));
    });
  }


  // TODO: comments
  var deleteNotSyncedElementsSQL = "DELETE FROM ? WHERE deleted = 1 AND online_id = 0";
  function deleteNotSyncedElements(callback) {
    var queue = [];
    queue.push(printf(deleteNotSyncedElementsSQL, 'tasks'));
    queue.push(printf(deleteNotSyncedElementsSQL, 'lists'));
    async.forEach(queue, execute, callback);
  }

  function updateByMap(type, map, where, callback){
    var set = [], prop, val;
    for(prop in map){
      val = map[prop];
      if(prop.match(/^(name|note)$/)){
        val = "'"+val+"'";
      }
      set.push(prop + "=" + val);
    }
    execute("UPDATE ? SET ? WHERE ?", type, set, where, callback);
  }

  /**
   * Check if Task or List exists by offline id
   * @param type - tasks/lists
   * @param id - offline id to look for
   * @param callback - function to call with boolean value true if entity exists, else false
   */
  var existsByIdSQL = "SELECT id FROM '?' WHERE id = ? AND deleted = 0";
  function existsById(type, id, callback) {
    execute(existsByIdSQL, type, id, function(err, result){
      if(err){
        callback(err);
        return;
      }
      callback(null, result.rows.length > 0);
    });
  }


  /**
   * Check if Task or List exists by online id
   * @param type - tasks/lists
   * @param online_id - online id to look for
   * @param callback - function to call with boolean value true if entity exists, else false
   */
  var existsByOnlineIdSQL = "SELECT id FROM '?' WHERE online_id = ? AND deleted = 0";
  function existsByOnlineId(type, online_id, callback) {
    execute(existsByOnlineIdSQL, type, online_id, function(err, result){
      if(err){
        callback(err);
        return;
      }
      callback(null, result.rows.length > 0);
    });
  }


  /**
   * Check if Task or List exists in the tables but doesn't have an online_id
   * @param type - tasks/lists
   * @param callback - function to call with boolean value true if there are tasks/lists without online_id
   */
  var hasElementsWithoutOnlineIdSQL = "SELECT id FROM ? WHERE online_id = 0";
  function hasElementsWithoutOnlineId(type, callback) {
    execute(hasElementsWithoutOnlineIdSQL, type, function(err, result){
      if(err){
        callback(err);
        return;
      }
      callback(null, result.rows.length > 0);
    });
    return false;
  }


  /**
   * Get Tasks or Lists for syncing
   * @param type - tasks/lists (defaults to lists)
   * @param fields - comma seperated string of field names to fetch (defaults to *)
   * @param where - filter
   * @param return_object - TODO: figure out
   * @param callback - function to call with boolean value true if there are tasks/lists without online_id
   */
  function getDataForSync(type, fields, where, return_object, callback) {
    type = type || 'lists';
    return_object = return_object || true;
    fields = fields || '*';

    var sql  = "SELECT " + fields + " FROM " + type;
    var values = {}, i = 0, y, max;

    if(typeof where !== 'undefined'){
      sql += ' WHERE ' + where;
    }

    execute(sql, function(err, result){
      if(err) {
        callback(err);
        return;
      }

      var rows = result.rows, row;
      for(var i = 0, l = rows.length; i < l; i++) {
        row = rows.item(i);
        if(return_object){
          values[i] = row;
        } else {
          values = row;
        }
      }

      callback(null, values);
    });
  }


  /**
   * Delete Tasks or Lists by online_id
   * @param type - tasks/lists
   * @param online_id - online id to look for
   * @callback - function to call with boolean value true if delete succeeds, else false
   */
  var deleteElementsSQL = "DELETE FROM '?' WHERE online_id = ?";
  function deleteElements(type, online_id, callback) {
    execute(deleteElementsSQL, type, online_id, function(err, callback){
      callback(err, (!err) ? true: false);
    });
  }


  /**
   * Create a local List by online_id
   * @param id-shared - fields for list
   * @callback - function to call with the inserted Id (offline id)
   */
  var createListByOnlineIdSQL = "INSERT INTO lists (online_id, name, deleted, position, version, inbox, shared) VALUES(?, '?', ?, ?, ?, ?, ?) ";
  function createListByOnlineId(id, name, deleted, position, version, inbox, shared, callback) {
    execute(createListByOnlineIdSQL, id, name, deleted, position, version, inbox, shared, function(err, result){
      callback(err, result && result.insertId);
    });
  }


  /**
   * Fetch list's online_id by its offline_id
   * @param list_id - offline id of the list
   * @param callback - function to call with the online_id of the list
   */ 
  var getListOnlineIdByIdSQL = "SELECT online_id FROM lists WHERE id = ?";
  function getListOnlineIdById(list_id, callback) {
    execute(getListOnlineIdByIdSQL, list_id, function(err, result){
      if(err) {
        callback(err);
      } else if(result.rows.length > 0){
        callback(null, result.rows.item(0).online_id);
      } else {
        callback(new Error("no mathcing records"));
      }
    });
  }


  /**
   * Fetch list's online_id by its offline_id
   * @param list_id - offline id of the list
   * @param callback - function to call with the online_id of the list
   */
  var getListIdByOnlineIdSQL = "SELECT id FROM lists WHERE online_id = ?";
  function getListIdByOnlineId(online_id, callback) {
    execute(getListIdByOnlineIdSQL, online_id, function(err, result){
      if(err) {
        callback(err);
      } else if(result.rows.length > 0){
        callback(null, result.rows.item(0).id);
      } else {
        callback(new Error("no mathcing records"));
      }
    });
  }


  /**
   * Update list by offline_id or Delete by online_id
   * @param id-shared - update fields
   * @param callback - function to call with success/failure flag
   */
  var deleteTaskByListIdSQL = "DELETE FROM tasks WHERE list_id = ?";
  var updateListByOnlineIdSQL = "UPDATE lists SET name = '?', deleted = ?, position = ?, version = ?, inbox = ?, shared = ? WHERE online_id = ?";
  function updateListByOnlineId(id, name, deleted, position, version, inbox, shared, callback) {
    if (deleted === 1 && shared === 1) {
      getListIdByOnlineId(id, function(list_id){
        execute(deleteTaskByListIdSQL, list_id, callback);
      });
    } else {
      execute(updateListByOnlineIdSQL, name, deleted, position, version, inbox, shared, id, callback);
    }
  }


  /**
   * Create tasks by online_id
   * @param online_id-note - insert fields
   * @param callback - function to call with the inserted id (offline_id)
   */
  var createTaskByOnlineIdSQL = "INSERT INTO tasks (online_id, name, date, done, list_id, position, important, done_date, deleted, version, note) VALUES(?, '?', ?, ?, ?, ?, ?, ?, ?, ?, '?')";
  function createTaskByOnlineId(online_id, name, date, done, list_id, position, important, done_date, deleted, version, note, callback) {
    execute(createTaskByOnlineIdSQL, online_id, name, date || 0, done, list_id, position, important, done_date, deleted, version, note, function(err, result){
      callback(err, result && result.insertId);
    });
  }


  /**
   * Update tasks by online_id
   * @param online_id-note - update fields
   * @param callback - function to call with success/failure flag
   */
  var updateTaskByOnlineIdSQL = "UPDATE tasks SET name = '?', date = ?, done = ?, list_id = ?, position = ?, important = ?, done_date = ?, deleted = ?, version = ?, note = '?' WHERE online_id = ?";
  function updateTaskByOnlineId(online_id, name, date, done, list_id, position, important, done_date, deleted, version, note, callback) {
    execute(updateTaskByOnlineIdSQL, name, date || 0, done, list_id, position, important, done_date, deleted, version, note, online_id, function(err, result){
      callback(err, !err);
    });
  }


  /**
   * Fetch info on badges due for today or overdued 
   * @param filter - today or overdue
   * @param callback - function to call task count
   */
  function updateBadgeCount(filter, callback) {
    if (filter !== undefined && (filter === 'today' || filter === 'overdue')) {
      var sql  = "SELECT id AS count FROM tasks WHERE ";
      var date = html.getWorldWideDate(); // Current date

      switch(filter) {
        case 'today':
          sql += "tasks.date = " + date + " AND tasks.date != 0 AND tasks.done = 0 AND tasks.deleted = 0";
          break;
        case 'overdue':
          sql += "tasks.done = 0 AND tasks.date < " + date + " AND tasks.date != 0 AND tasks.deleted = 0";
          break;
      }
      execute(sql, function(err, result){
        callback(err, result.rows.length);
      });
    }
    return 0;
  }


  /**
   * Get list of last done tasks
   * @param list_id - offline_id of list to search in
   * @param callback - function to call with array of tasks
   */
  var lastDoneTasksSQL = "SELECT tasks.id AS task_id, tasks.name, tasks.done, tasks.important, tasks.position, tasks.date, tasks.list_id, " +
                         "tasks.done_date, tasks.note FROM tasks WHERE tasks.done = 1 AND list_id = '?' AND tasks.deleted = 0 ORDER BY "+
                         "tasks.done_date DESC";
  function getLastDoneTasks(list_id, callback) {
    var doneListsTasks = [];

    execute(lastDoneTasksSQL, list_id, function(err, result){
      if(err) {
        callback(err);
        return;
      }

      var rows = result.rows, row;
      for(var i = 0, l = rows.length; i < l; i++) {
        var values = rows.item(i);
        var days   = wunderlist.helpers.utils.calculateDayDifference(values.done_date);
        var htmlId = days.toString();
        if (wunderlist.helpers.utils.is_array(doneListsTasks[htmlId]) === false){
          doneListsTasks[htmlId] = [];
        }
        var markup = html.generateTaskHTML(values.task_id, values.name, values.list_id, values.done, values.important, values.date, values.note);
        doneListsTasks[htmlId].push(markup);
      }
      callback(null, doneListsTasks);
    });
  }


  /**
   * @param sql - SQL template to query the DB
   * @param field - field value to be fetched
   * @param params - array of values or single value to be used to render the SQL template
   */
  function fetchSingleFieldOfSingleRecord(sql, field, params, callback) {
    params = [sql].concat(params);
    params.push(function(err, result){
      if(err) {
        callback(err);
        return;
      }
      if(result.rows.length > 0){
        callback(null, result.rows.item(0)[field]);
      } else {
        callback(new Error("No records found"));
      }
    });
    execute.apply(null, params);
  }

  /**
   * Fetch position of the last list
   * @param callback - function to call with the position of the last list
   */
  var getLastListPositionSQL = "SELECT position FROM lists WHERE deleted = 0 ORDER BY position DESC LIMIT 1";
  function getLastListPosition(callback) {
    fetchSingleFieldOfSingleRecord(getLastListPositionSQL, 'position', undefined, callback);
  }

  /**
   * Fetch position of the last inserted task in a list
   * @param callback - function to call with the position of the last task in a list
   */
  var getLastTaskPositionSQL = "SELECT position FROM tasks WHERE list_id = ? AND tasks.done = 0 AND tasks.deleted = 0 ORDER BY position DESC LIMIT 1";
  function getLastTaskPosition(listId, callback){
    fetchSingleFieldOfSingleRecord(getLastTaskPositionSQL, 'position', listId, callback);
  }


  function getLastListId(callback) {
    execute("SELECT id FROM lists ORDER BY id DESC LIMIT 1", function(err, result){
      if(err) {
        callback(err);
        return;
      }

      if(result.rows.length > 0){
        callback(null, result.rows.item(0).id);
      } else {
        callback(new Error("No lists found"));
      }
    });
  }

  /*
   * Filters tasks by a given type
   * TODO: This has to be updated in the same step were we update the filter structure (sorted tasks by list)
   * @param filter
   * @param type
   * @param callback - function to call with the list of filtered tasks
   */
  function getFilteredTasks(filter, type, callback) {
    var date = html.getWorldWideDate(), // Current date
        sql = "SELECT * FROM tasks ", 
        where = "",
        date_type;

    switch(filter) {
      case 'starred':
        where = "WHERE tasks.important = 1 AND tasks.done = 0";
        break;
      case 'today':
        where = "WHERE tasks.date = " + date + " AND tasks.date != 0 AND tasks.done = 0";
        break;
      case 'tomorrow':
        where = "WHERE tasks.date = " + (date + 86400) + " AND tasks.done = 0 AND tasks.deleted = 0";
        break;
      case 'thisweek':
        where = "WHERE tasks.date BETWEEN " + date + " AND " + (date + (86400 * 7)) + " AND tasks.done = 0 AND tasks.date != 0";
        break;
      case 'done':
        where = "WHERE tasks.done = 1";
        break;
      case 'all':
        where = "WHERE tasks.done = 0";
        break;
      case 'overdue':
        where = "WHERE tasks.done = 0 AND tasks.date < " + date + " AND tasks.date != 0";
        break;
      case 'date':
        if (type === 'nodate') {
          date = 0;
          date_type = '=';
        } else {
          date = (date + 86400);
          date_type = '>';
        }
        where = "WHERE tasks.date " + date_type + " " + date + " AND tasks.done = 0";
        break;
      default:
        return;
    }

    sql += where + " AND tasks.deleted = 0 ORDER BY tasks.list_id ASC, tasks.important DESC, tasks.date ASC, tasks.position ASC";
    execute(sql, function(err, result){
      if(err) {
        callback(err);
        return;
      }
      callback(null, resultToArray(result));
    });
  }


  function insertTask(noHtml, callback){
    
  }


  function updateTask(noVersion, callback){
    
  }


  function getListIdsByTaskId(task_id, callback){
    
  }

/***********************************************
***** TODO: complete the following methods *****
************************************************/

  /**
   * Filter functions
   * TODO: move out any DOM stuff to frontend
   */


  function createStandardElements(){}
  
  function search(query, callback){}
  function isDeleted(type, online_id, callback){}
  function isShared(list_id, callback){}
  function isSynced(list_id, callback){}

  function createTuts(list_id){}
  function recreateTuts(){}

  function fetchData(resultSet){}
  function updateTaskCount(list_id){}


  /**
   * Init the DB
   * for WebSQL & Titanium - open the database & create the tables for tasks & lists
   * for AJAX - nothing to initialize
   */
  function init() {
    db = window.openDatabase(DB_NAME, "", DB_TITLE, DB_BYTES);
    createTables();
  }

  return {
    "init": init,
    "getLists": getLists,
    "getTasks": getTasks,
    "updateByMap": updateByMap,
    "createStandardElements": createStandardElements,
    "truncate": truncate,
    "existsById": existsById,
    "existsByOnlineId": existsByOnlineId,
    "hasElementsWithoutOnlineId": hasElementsWithoutOnlineId,
    "getDataForSync": getDataForSync,
    "deleteNotSyncedElements": deleteNotSyncedElements,
    "deleteElements": deleteElements,
    "createListByOnlineId": createListByOnlineId,
    "getListOnlineIdById": getListOnlineIdById,
    "getListIdByOnlineId": getListIdByOnlineId,
    "updateListByOnlineId": updateListByOnlineId,
    "updateTaskByOnlineId": updateTaskByOnlineId,
    "createTaskByOnlineId": createTaskByOnlineId,
    "updateBadgeCount": updateBadgeCount,
    "getLastDoneTasks": getLastDoneTasks,
    "getLastListId": getLastListId,
    "getLastListPosition": getLastListPosition,
    "getLastTaskPosition": getLastTaskPosition,
    "getFilteredTasks": getFilteredTasks
  };
})(wunderlist, html, async, window);