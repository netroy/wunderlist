/* global wunderlist */

(function(W, html, global, undefined){
  var database = W.database || {},
      DB_NAME  = "wunderlist",
      DB_TITLE = "Wunderlist",
      DB_BYTES = 5*1024*1024, // 5MB
      db;

  var log = console.log.bind(console);
  var err = console.error.bind(console);
  var nop = function(){};

  function printf(text){
    var i = 1, args = arguments;
    return text.replace(/\?/g, function(){
      return args[i++] || "";
    });
  }

  function execute(sql){
    function error(){
      err([args].concat(arguments));
    }
    function callback(){
      log([args].concat(arguments))
    }
    var args = Array.prototype.slice.call(arguments, 0);
    if(typeof args[args.length-1] === 'function'){
      callback = args.pop();
    }

    sql = printf.apply(null, args);
    db.transaction(function(tx){
      tx.executeSql(sql, [], function(t, result){
        callback(result);
      }, error);
    });
  }
  
  function executeParallel(queue, callback){
    var output = [], current;
    var handler = function(result) {
      var rows = result.rows, outRows = [];
      for(var i = 0, l = rows.length; i < l; i++) {
        outRows.push(rows.item(i));
      }
      output.push(outRows);
      if(queue.length === 0 && typeof callback === 'function'){
        callback(output);
      }
    };

    while((current = queue.shift()) !== undefined){
      execute(current, handler);
    }
  }

  var createlistsSQL = "CREATE TABLE IF NOT EXISTS lists (id INTEGER PRIMARY KEY AUTOINCREMENT, online_id INTEGER DEFAULT 0, "+
                   "name TEXT, position INTEGER DEFAULT 0, version INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, "+
                   "inbox INTEGER DEFAULT 0, shared INTEGER DEFAULT 0)";
  var createtasksSQL = "CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, online_id INTEGER DEFAULT 0, "+
                   "name TEXT, list_id TEXT, note TEXT DEFAULT '', date INTEGER DEFAULT 0, done_date INTEGER DEFAULT 0, "+
                   "done INTEGER DEFAULT 0, position INTEGER DEFAULT 0, important INTEGER DEFAULT 0, version INTEGER DEFAULT 0, "+
                   "deleted INTEGER DEFAULT 0)";
  database.init = function() {
    db = global.openDatabase(DB_NAME, "", DB_TITLE, DB_BYTES);
    executeParallel([createlistsSQL, createtasksSQL]);
  };

  database.initLists = function(lists) {};
  database.initTasks = function(tasks) {};

  /**
   * Gets list(s) from the database. 
   * @param list_id (Optional) - numeric id of a list to fetch (for getting individual lists)
   * @param callback - function to call with an array of fetched list
   * TODO: getTasks looks very similar, try to merge.
   */
  var getListsSQL = "SELECT lists.*, (SELECT COUNT(tasks.id) FROM tasks WHERE tasks.list_id = lists.id AND deleted = 0 AND done = 0) " +
                        "as taskCount FROM lists WHERE lists.deleted = 0 ? ORDER BY lists.inbox DESC, lists.position ASC";
  database.getLists = function(list_id, callback) {
    var lists = [];
    var where = '';
    callback = callback || log;
    if (typeof list_id === 'number'){
      where += ' AND lists.id = ' + list_id;
    }

    execute(getListsSQL, where, function(result){
      var rows = result.rows, row;
      for(var i = 0, l = rows.length; i < l; i++) {
        lists.push(rows.item(i));
      }
      callback(lists);
    });
    
    return lists;
  };

  var getTasksSQL = "SELECT * FROM tasks WHERE deleted = 0 AND done = 0 ? ORDER BY important DESC, position ASC";
  database.getTasks = function(task_id, list_id, callback) {
    var tasks = [];
    var where = '';
    callback = callback || log;
    if (typeof task_id === 'number' && task_id > 0){
      where += " AND id = " + task_id;
    }
    if (typeof list_id === 'number' && list_id > 0){
      where += " AND list_id = " + list_id;
    }

    execute(getTasksSQL, where, function(result){
      var rows = result.rows, row;
      for(var i = 0, l = rows.length; i < l; i++) {
        lists.push(rows.item(i));
      }
      callback(lists);
    });

    return tasks;
  };

  database.createStandardElements = function(){};

  database.truncate = function() {
    execute("DELETE FROM lists");
    execute("DELETE FROM tasks");
    execute("DELETE FROM sqlite_sequence WHERE name = 'lists'");
    execute("DELETE FROM sqlite_sequence WHERE name = 'tasks'");
  };
  
  database.existsById = function(type, id) {
    var result = execute("SELECT id FROM '?' WHERE id = ? AND deleted = 0", type, id);
    if(result && result.rowCount() > 0)
      return true;
    else
      return false;
  };

  database.existsByOnlineId = function(type, online_id) {
    var result = execute("SELECT id FROM '?' WHERE online_id = ? AND deleted = 0", type, online_id);
    if(result && result.rowCount() > 0)
      return true;
    else
      return false;
  };

  database.hasElementsWithoutOnlineId = function(type, callback) {
    execute("SELECT id FROM ? WHERE online_id = 0", type, function(result){
      callback(result.rows.length > 0);
    });
    return false;
  };

  database.getDataForSync = function(type, fields, where, return_object, callback) {
    type = type || 'lists';
    return_object = return_object || true;
    fields = fields || '*';
    callback = callback || log;

    var sql  = "SELECT " + fields + " FROM " + type;
    var values = {}, i = 0, y, max;

    if(where !== undefined){
      sql += ' WHERE ' + where;
    }

    execute(sql, function(result){
      var rows = result.rows, row;
      for(var i = 0, l = rows.length; i < l; i++) {
        row = rows.item(i);
        if(return_object){
          values[i] = {};
          for(y = 0, max = result.fieldCount(); y < max; y++){
             values[i][row.fieldName(y)] = row.field(y);
          }
        } else {
            for(y = 0, max = result.fieldCount(); y < max; y++){
              values[row.fieldName(y)] = row.field(y);
            }
        }
      }
      callback(values);
    });

    return values;
  };

  database.deleteNotSyncedElements = function() {
    execute("DELETE FROM tasks WHERE deleted = 1 AND online_id = 0");
    execute("DELETE FROM lists WHERE deleted = 1 AND online_id = 0");
    //filters.updateBadges();
  };

  var deleteElementsSQL = "DELETE FROM '?' WHERE online_id = ?";
  database.deleteElements = function(type, online_id) {
    execute(deleteElementsSQL, type, online_id);
  };

  var createListByOnlineIdSQL = "INSERT INTO lists (online_id, name, deleted, position, version, inbox, shared) VALUES(?, '?', ?, ?, ?, ?, ?) ";
  database.createListByOnlineId = function(id, name, deleted, position, version, inbox, shared) {
    execute(createListByOnlineIdSQL, id, name, deleted, position, version, inbox, shared);
  };

  var getListOnlineIdByIdSQL = "SELECT online_id FROM lists WHERE id = ?";
  database.getListOnlineIdById = function(list_id, callback) {
    execute(getListOnlineIdByIdSQL, list_id, function(result){
      if(result.rows.length > 0){
        callback(result.rows.item(0).online_id);
      }
    });
  };

  var getListIdByOnlineIdSQL = "SELECT id FROM lists WHERE online_id = ?";
  database.getListIdByOnlineId = function(online_id, callback) {
    execute(getListIdByOnlineIdSQL, online_id, function(result){
      if(result.rows.length > 0){
        callback(result.rows.item(0).id);
      }
    });
  };

  var deleteTaskByListIdSQL = "DELETE FROM tasks WHERE list_id = ?";
  var updateListByOnlineIdSQL = "UPDATE lists SET name = '?', deleted = ?, position = ?, version = ?, inbox = ?, shared = ? WHERE online_id = ?";
  database.updateListByOnlineId = function(id, name, deleted, position, version, inbox, shared) {
    if (deleted === 1 && shared === 1) {
      var list_id = database.getListIdByOnlineId(id);
      execute(deleteTaskByListIdSQL, list_id);
    }
    execute(updateListByOnlineIdSQL, name, deleted, position, version, inbox, shared, id);
  };

  database.updateTaskByOnlineId = function(online_id, name, date, done, list_id, position, important, done_date, deleted, version, note) {};
  database.createTaskByOnlineId = function(online_id, name, date, done, list_id, position, important, done_date, deleted, version, note) {};

  database.updateBadgeCount = function(filter, callback) {
    callback = callback || log;
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
      execute(sql, function(result){
        callback(result.rows.length);
      });
    }
    return 0;
  };

  var lastDoneTasksSQL = "SELECT tasks.id AS task_id, tasks.name, tasks.done, tasks.important, tasks.position, tasks.date, tasks.list_id, " +
                         "tasks.done_date, tasks.note FROM tasks WHERE tasks.done = 1 AND list_id = '?' AND tasks.deleted = 0 ORDER BY "+
                         "tasks.done_date DESC";
  database.getLastDoneTasks = function(list_id, callback) {
    callback = callback || log;
    var doneListsTasks = [];
    execute(lastDoneTasksSQL, list_id, function(result){
      var rows = result.rows, row;
      for(var i = 0, l = rows.length; i < l; i++) {
        var values = rows.item(i);
        var days   = wunderlist.calculateDayDifference(values.done_date);
        var htmlId = days.toString();
        if (wunderlist.is_array(doneListsTasks[htmlId]) === false){
          doneListsTasks[htmlId] = [];
        }
        var markup = html.generateTaskHTML(values.task_id, values.name, values.list_id, values.done, values.important, values.date, values.note);
        doneListsTasks[htmlId].push(markup);
      }
      callback(doneListsTasks);
    });
    return doneListsTasks;
  };

  database.insertList = function(list, callback){
    callback = callback || log;
    if (typeof list.name !== 'string' || list.name.length === 0) {
      callback(new Error("Invalid name for the list"));
    }

    if (typeof list.position === 'undefined'){
      list.position = database.getLastListPosition() + 1;
    }
    list.version = 0;
    list.name    = html.convertString(list.name, 255);

    var first  = true, fields = '', values = '';
    for (var property in list) {
      if (list[property] !== undefined && $.isFunction(list[property]) === false) {
        if (wunderlist.in_array(property, list.properties) === true) {
          fields += (first === false ? ', ' : '') + property;
          values += (first === false ? ', ' : '') + "'" + list[property] + "'";
          first = false;
        }
      }
    }

    if (fields !== '' && values !== '') {
      execute("INSERT INTO lists (?) VALUES (?)", fields, values, function(result){
        callback(result.insertId);
      });
    }
    // Reset the properties of the given list object
    list.setDefault();
    return false;
  };

  database.getLastListId = function() {
    execute("SELECT id FROM lists ORDER BY id DESC LIMIT 1", function(result){
      if(result.rows.length > 0){
        callback(result.rows.item(0).id);
      }
    });
    return 0;
  };

  database.getLastListPosition = function() {
    execute("SELECT position FROM lists WHERE deleted = 0 ORDER BY position DESC LIMIT 1",function(result){
      if(result.rows.length > 0){
        callback(result.rows.item(0).position);
      }
    });
    return 0;
  };


/*
  database.createTuts = function(list_id) {};
  database.recreateTuts = function() {};
  database.fetchData = function(resultSet) {};
  database.updateList = function(noversion) {};
  database.insertTask = function() {};
  database.updateTask = function(noVersion) {};
  database.getLastTaskPosition = function(list_id) {};
  database.search = function(search) {};
  database.isDeleted = function(type, online_id) {};
  database.isShared = function(list_id) {};
  database.isSynced = function(list_id) {};
  database.updateTaskCount = function(list_id) {};
  database.getListIdsByTaskId = function(task_id) {};
  database.getFilteredTasks = function(filter, date_type, printing) {};
  database.getFilteredTasksForPrinting = function(type, date_type) {};

*/

  // Assign back the database object in case its newly created here
  W.database = database;
})(wunderlist, html, window);