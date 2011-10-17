(function(wunderlist, global, undefined){
  var database = wunderlist.database || {},
      DB_NAME  = "wunderlist",
      DB_TITLE = "Wunderlist",
      DB_BYTES = 5*1024*1024, // 5MB
      db,
      listsSQL = "CREATE TABLE IF NOT EXISTS lists (id INTEGER PRIMARY KEY AUTOINCREMENT, online_id INTEGER DEFAULT 0, "+
                 "name TEXT, position INTEGER DEFAULT 0, version INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, "+
                 "inbox INTEGER DEFAULT 0, shared INTEGER DEFAULT 0)",
      tasksSQL = "CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, online_id INTEGER DEFAULT 0, "+
                 "name TEXT, list_id TEXT, note TEXT DEFAULT '', date INTEGER DEFAULT 0, done_date INTEGER DEFAULT 0, "+
                 "done INTEGER DEFAULT 0, position INTEGER DEFAULT 0, important INTEGER DEFAULT 0, version INTEGER DEFAULT 0, "+
                 "deleted INTEGER DEFAULT 0)";

  var log = console.log.bind(console);
  var err = console.error.bind(console);
  var nop = function(){};

  function execute(sql){
    var callback = nop;
    var args = Array.prototype.slice.call(arguments, 1);
    if(typeof args[0] === 'function'){
      callback = args.shift();
    }
    function error(){
      log("=>", [sql].concat(arguments));
    }
    db.transaction(function(tx){
      tx.executeSql(sql, args, callback, error);
    }, error, callback);
  }

  function create(){
    execute(listsSQL);
    execute(tasksSQL);
  }

  database.init = function() {
    db = global.openDatabase(DB_NAME, wunderlist.version, DB_TITLE, DB_BYTES);
    create();
  };
  
  database.convertString = function(string, length) {};
  database.initLists = function(lists) {};
  database.initTasks = function(tasks) {};
  database.getLists = function(list_id) {
    var lists = [];
    var where = '';
    if (list_id !== undefined){
      where += ' AND lists.id = ' + list_id;
    }
    execute("SELECT lists.*, (SELECT COUNT(tasks.id) FROM tasks WHERE tasks.list_id = lists.id AND deleted = 0 AND done = 0) "+
            "as taskCount FROM lists WHERE lists.deleted = 0 ? ORDER BY lists.inbox DESC, lists.position ASC", function(){
      log(arguments);
    }, where);

    while(result && result.isValidRow()){
      var item = {};
      for(var i = 0; i < result.fieldCount(); i++)
        item[result.fieldName(i)] = result.field(i);
      lists.push(item);
      result.next();
    }

    return lists;
  };
  database.getTasks = function(task_id, list_id) {};
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
  database.hasElementsWithoutOnlineId = function(type) {
    var result = execute("SELECT id FROM ? WHERE online_id = 0", type);
    if (result && result.isValidRow()) {
      return true;
    }
    return false;
  };
  database.getDataForSync = function(type, fields, where, return_object) {
  	type = type || 'lists';
  	return_object = return_object || true;
    fields = fields || '*';
  	var sql  = "SELECT " + fields + " FROM " + type;

  	if(where != undefined){
  	  sql += ' WHERE ' + where;
  	}
  	var result = execute(sql);
  	values = {};
  	i = 0;
    while(result.isValidRow()) {
      if(return_object){
        values[i] = {};
    		for(var y = 0, max = result.fieldCount(); y < max; y++){
    		   values[i][result.fieldName(y)] = result.field(y);
    		}
      } else {
    			for(var y = 0, max = result.fieldCount(); y < max; y++){
    				values[result.fieldName(y)] = result.field(y);
    			}
      }
  		i++;
  		result.next();
  	}
  	return values;
  };

  database.createListByOnlineId = function(id, name, deleted, position, version, inbox, shared) {
    execute("INSERT INTO lists (online_id, name, deleted, position, version, inbox, shared) VALUES(?, '?', ?, ?, ?, ?, ?) ", 
            id, name, deleted, position, version, inbox, shared);
  };
  database.getListOnlineIdById = function(list_id) {};
  database.getListIdByOnlineId = function(list_id) {
    var result = execute("SELECT id FROM lists WHERE online_id = ?", list_id);
    if(result && result.isValidRow())
      return result.field(0);
    return list_id;
  };
  database.updateListByOnlineId = function(id, name, deleted, position, version, inbox, shared) {
    if (deleted === 1 && shared === 1) {
      list_id = database.getListIdByOnlineId(id);
      execute("DELETE FROM tasks WHERE list_id = ?", list_id);
    }
    execute("UPDATE lists SET name = '?', deleted = ?, position = ?, version = ?, inbox = ?, shared = ? WHERE online_id = ?", 
      name, deleted, position, version, inbox, shared, id);
  };

  database.updateTaskByOnlineId = function(online_id, name, date, done, list_id, position, important, done_date, deleted, version, note) {};
  database.createTaskByOnlineId = function(online_id, name, date, done, list_id, position, important, done_date, deleted, version, note) {};
  database.updateBadgeCount = function(filter) {
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
      var result = execute(sql);
      return result.rowCount();
    } else {
      return 0;
    }
  };

/*
  database.createTuts = function(list_id) {};
  database.recreateTuts = function() {};
  database.fetchData = function(resultSet) {};
  database.insertList = function() {};
  database.updateList = function(noversion) {};
  database.insertTask = function() {};
  database.updateTask = function(noVersion) {};
  database.getLastTaskPosition = function(list_id) {};
  database.search = function(search) {};
  database.getLastListId = function() {};
  database.getLastListPosition = function() {};
  database.isDeleted = function(type, online_id) {};
  database.deleteNotSyncedElements = function() {};
  database.deleteElements = function(type, online_id) {};
  database.isShared = function(list_id) {};
  database.isSynced = function(list_id) {};
  database.updateTaskCount = function(list_id) {};
  database.getListIdsByTaskId = function(task_id) {};
  database.getFilteredTasks = function(filter, date_type, printing) {};
  database.getFilteredTasksForPrinting = function(type, date_type) {};
  database.getLastDoneTasks = function(list_id) {};
*/

  // Assign back the database object in case its newly created here
  wunderlist.database = database;
})(wunderlist, window);