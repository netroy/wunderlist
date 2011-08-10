/**
 * wunderlist.database.js
 *
 * Class for handling all database functionality
 * 
 * @author Christian Reber, Dennis Schneider, Daniel Marschner
 */

wunderlist.database = wunderlist.database || {};

/**
 * Do the necessary initial database stuff
 *
 * @author Daniel Marschner
 */
wunderlist.database.init = function() {
	wunderlist.database.path = Titanium.Filesystem.getFile(Titanium.Filesystem.getApplicationDataDirectory(), 'wunderlist.db');
	wunderlist.database.db   = Titanium.Database.openFile(wunderlist.database.path);
	wunderlist.database.create();
};

/**
 * Creates the database and all tables
 *
 * @author Dennis Schneider, Daniel Marschner, Christian Reber
 */
wunderlist.database.create = function() {
	// TODO: Did we need that? Test it!
	if (Titanium.App.Properties.hasProperty('prefinal_first_run') == false)
	{
		var sql 	= "DROP TABLE IF EXISTS lists";
		wunderlist.database.db.execute(sql);
		sql 		= "DROP TABLE IF EXISTS tasks";
		wunderlist.database.db.execute(sql);
		Titanium.App.Properties.setString('prefinal_first_run', '1');
	}
	
	wunderlist.database.db.execute("CREATE TABLE IF NOT EXISTS lists (id INTEGER PRIMARY KEY AUTOINCREMENT, online_id INTEGER DEFAULT 0, name TEXT, position INTEGER DEFAULT 0, version INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, inbox INTEGER DEFAULT 0, shared INTEGER DEFAULT 0)");
	wunderlist.database.db.execute("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, online_id INTEGER DEFAULT 0, name TEXT, list_id TEXT, note TEXT DEFAULT '', date INTEGER DEFAULT 0, done_date INTEGER DEFAULT 0, done INTEGER DEFAULT 0, position INTEGER DEFAULT 0, important INTEGER DEFAULT 0, version INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0)");

	// Add column shared to table lists (used from version > 1.1.0 on)
	var dbCols  = wunderlist.database.db.execute('SELECT * FROM "main"."lists"');
	var numCols = dbCols.fieldCount();
	
	// If there are only 7 columns, add the shared column
	if (numCols == 7)
	{
		try {
			wunderlist.database.db.execute('ALTER TABLE "main"."lists" ADD COLUMN "shared" INTEGER DEFAULT 0');
		}
		catch(err) {}
	}
	
	// If we implement the reminder dialog we need that colums
	//wunderlist.database.db.execute('ALTER TABLE "main"."tasks" ADD COLUMN "push" INTEGER DEFAULT 0');
	//wunderlist.database.db.execute('ALTER TABLE "main"."tasks" ADD COLUMN "push_ts" INTEGER DEFAULT 0');
};

/**
 * Creates the standard database rows
 *
 * @author Daniel Marschner, Christian Reber, Dennis Schneider
 */
wunderlist.database.createStandardElements = function() {
	var resultSet = wunderlist.database.db.execute("SELECT id FROM lists WHERE id = '1' AND lists.deleted = 0 LIMIT 1");
	
	if(resultSet.rowCount() == 0)
	{
		// Truncate database and create inbox
		wunderlist.database.truncate();
		
		// Add the property "inbox", only for registration reasons
		list.properties.push('inbox');
		
		list.name  = wunderlist.language.data.inbox;
		list.inbox = 1;
		list_id    = list.insert();
		
		// Remove the property "inbox", only a reason of security
		list.properties.pop();
		
		settings.save_last_opened_list("'" + list_id + "'");
		
		wunderlist.database.createTuts(list_id);
	}
};

/**
 * Create the tutorial tasks
 *
 * @author Daniel Marschner
 */
wunderlist.database.createTuts = function(list_id) {
	if (list_id != undefined)
	{
		for (var ix = 1; ix <= 8; ix++)
		{
			var addon = '';
			
			if ((ix == 2 || ix == 3 || ix == 5 || ix == 6) && wunderlist.os == 'darwin')
				addon = '_mac';
			
			task.name     = wunderlist.language.data['default_task_' + ix + addon];
			task.list_id  = list_id;
			task.position = ix; 
			
			if (ix == 1)
			{
				task.important = 1;
			}
			else if (ix == 7)
			{
				task.done      = 1;
				task.done_date = new Date().getTime() / 1000;
			}
			
			task.insert();
		}
	}
};

/**
 * Recreate tutorial tasks
 *
 * @author Christian Reber, Daniel Marschner
 */
wunderlist.database.recreateTuts = function() {
	list.name = wunderlist.language.data.tutorials;
	list_id   = list.insert();
	
	wunderlist.database.createTuts(list_id);
	
	settings.save_last_opened_list("'" + list_id + "'");
	
	wunderlist.account.loadInterface();
};

/**
 * Truncates the whole database
 *
 * @author Dennis Schneider
 */
wunderlist.database.truncate = function() {
	wunderlist.database.db.execute("DELETE FROM lists");
	wunderlist.database.db.execute("DELETE FROM tasks");
	wunderlist.database.db.execute("DELETE FROM sqlite_sequence WHERE name = 'lists'");
	wunderlist.database.db.execute("DELETE FROM sqlite_sequence WHERE name = 'tasks'");
};

/**
 * Removes HTML tags and escapes single quotes
 *
 * @author Daniel Marschner
 */
wunderlist.database.convertString = function(string, length) { 
	string = string.split('<').join(escape('<'));
	string = string.split('>').join(escape('>'));
	string = string.split("'").join(escape("'"));
	
	if (length != undefined && length > 0)
		string = string.substr(0, length);
	
	return string;
};

/**
 * Fetch the data from a result set to array with objects
 *
 * @author Dennis Schneider
 */
wunderlist.database.fetchData = function(resultSet) {
	var result = [];
	
	while(resultSet.isValidRow())
	{
		var item = {};

		for(var i = 0; i < resultSet.fieldCount(); i++)
			item[resultSet.fieldName(i)] = resultSet.field(i);
		
		result.push(item);

		resultSet.next();
	}

	return result;
};

/**
 * Insert a new list by the given list object
 *
 * @attention Do not use the variable "list" for any other function in this project
 *
 * @author Daniel Marschner
 */
wunderlist.database.insertList = function() {
	if (list.name != undefined && list.name != '')
	{
		if (list.position == undefined)
			list.position = wunderlist.database.getLastListPosition() + 1;
		
		list.version = 0;
		list.name    = wunderlist.database.convertString(list.name, 255);
		
		var first  = true;
		var fields = '';
		var values = '';
		
		for (var property in list)
		{
			if (list[property] != undefined && $.isFunction(list[property]) == false)
			{
				if (wunderlist.in_array(property, list.properties) == true)
				{
					fields += (first == false ? ', ' : '') + property;
					values += (first == false ? ', ' : '') + "'" + list[property] + "'";
					first = false;
				}
			}
		}
		
		if (fields != '' && values != '')
		{
			wunderlist.database.db.execute("INSERT INTO lists (" + fields + ") VALUES (" + values + ")");
			
			var list_id = wunderlist.database.db.lastInsertRowId;
			
			wunderlist.timer.stop().set(15).start();
			
			// Reset the properties of the given list object
			list.setDefault();
					
			return list_id;
		}
		else
			return false;
	}
};

/**
 * Update the list by the given list object
 *
 * @attention Do not use the variable "list" for any other function in this project
 *
 * @author Daniel Marschner
 */
wunderlist.database.updateList = function(noversion) {
	if (list.id != undefined && list.id > 0)
	{
		if (noversion == undefined)
			noversion = false;
		
		var list_id = list.id;
		list.id = undefined;
		
		// Deleting the inbox has to be impossible
		if (list.deleted != undefined && list.deleted == 1 && list.id == 1)
			list.deleted = 0;
		
		// Sharing your inbox jas to be impossible	
		if (list.shared != undefined && list.shared == 1 && list.id == 1)
			list.shared = 0;
		
		// Make another list to your inbox has to be impossible
		if (list.inbox != undefined && list.inbox == 1 && list.id != 1)
			list.inbox = 0;
		
		if (list.name != undefined && list.name != '')
			list.name = wunderlist.database.convertString(list.name, 255);
		
		var first = true;
		var set   = '';
		
		for (var property in list)
		{
			if (list[property] != undefined && $.isFunction(list[property]) == false)
			{
				if (wunderlist.in_array(property, list.properties) == true)
				{
					set += (first == false ? ', ' : '') + property + ' = ' +  ((typeof list[property] == 'string') ? "'" + list[property] + "'" : list[property]); // TODO: Test this combination
					first = false;
				}
			}
		}
		
		if (set != '')
		{
			wunderlist.database.db.execute("UPDATE lists SET " + set + (noversion == false ? ", version = version + 1" : '') + " WHERE id = " + list_id);
			wunderlist.timer.stop().set(15).start();
			
			// If the list is deleted, delete all tasks too
			if (list.deleted == 1)
			{
				var dbtasks = wunderlist.database.getTasks(undefined, list_id);
				
				for (ix in dbtasks)
				{
					task.id      = dbtasks[ix].id;
					task.deleted = 1;
					task.update();
				}
			}
			
			// Reset the properties of the given list object
			list.setDefault();
			
			return true;
		}
		else
			return false;
	}
};

/**
 * Insert a new task by the given task object
 *
 * @attention Do not use the variable "task" for any other function in this project
 *
 * @author Daniel Marschner
 */
wunderlist.database.insertTask = function() {		
	if (task.name != undefined && task.name != '')
	{		
		if (task.position == undefined)
			task.position = wunderlist.database.getLastTaskPosition(task.list_id) + 1;

		if ((task.date != undefined && task.date == '') || task.date == undefined)
			task.date = 0;

		task.version = 0;
		task.name    = wunderlist.database.convertString(task.name, 255);

        // If the task name is empty somehow, abort the adding of the task
        if (task.name == '') return false;

		// Convert the task note for the database if note is set
		if (task.note != undefined && task.note != '')
			task.note = wunderlist.database.convertString(task.note, 5000);

		var first  = true;
		var fields = '';
		var values = '';
		
		for (var property in task)
		{
			if (task[property] != undefined && $.isFunction(task[property]) == false)
			{
				if (wunderlist.in_array(property, task.properties) == true)
				{
					fields += (first == false ? ', ' : '') + property;
					values += (first == false ? ', ' : '') + "'" + task[property] + "'";
					first = false;
				}
			}
		}
		
		if (fields != '' && values != '')
		{
			wunderlist.database.db.execute("INSERT INTO tasks (" + fields + ") VALUES (" + values + ")");
			
			var task_id = wunderlist.database.db.lastInsertRowId;
			
			wunderlist.database.updateTaskCount();		
			wunderlist.timer.stop().set(15).start();
			
			filters.updateBadges();
			
			// Reset the properties of the given task object
			task.setDefault();

			return task_id;
		}
		else
			return false;
	}
};

/**
 * Update the task by the given task object
 *
 * @attention Do not use the variable "task" for any other function in this project
 *
 * @author Daniel Marschner
 */
wunderlist.database.updateTask = function(noVersion) {
	if (task.id != undefined && task.id > 0)
	{
	    if (noVersion == undefined)
	    {
	        noVersion = false;
	    }
	
		var task_id = task.id;
		task.id = undefined;
		
		// TODO: Is valid date?
		if (task.date != undefined && task.date == '')
			task.date = 0;
			
		// TODO: Is valid date?
		if (task.done_date != undefined && task.done_date == '')
			task.done_date = 0;

		// Convert the task name for the database if name is set
		if (task.name != undefined && task.name != '')
			task.name = wunderlist.database.convertString(task.name, 255);

		// Convert the task note for the database if note is set
		if (task.note != undefined && task.note != '')
			task.note = wunderlist.database.convertString(task.note, 5000);
		
		var first = true;
		var set   = '';
		
		for (var property in task)
		{
			if (task[property] != undefined && $.isFunction(task[property]) == false)
			{
				if (wunderlist.in_array(property, task.properties) == true)
				{
					set += (first == false ? ', ' : '') + property + ' = ' +  ((typeof task[property] == 'string') ? "'" + task[property] + "'" : task[property]); // TODO: Test this combination
					first = false;
				}
			}
		}
		
		if (set != '')
		{		    
			wunderlist.database.db.execute("UPDATE tasks SET " + set + (noVersion == false ? ", version = version + 1" : '') + " WHERE id = " + task_id);
			wunderlist.database.updateTaskCount();
			wunderlist.timer.stop().set(15).start();
			
			filters.updateBadges();
			
			// Reset the properties of the given task object
			task.setDefault();
			
			return true;
		}
		else
			return false;
	}
};

/**
 * Returns the latest task position
 *
 * @author Dennis Schneider
 */
wunderlist.database.getLastTaskPosition = function(list_id) {
	var result = wunderlist.database.db.execute("SELECT position FROM tasks WHERE list_id = ? AND tasks.done = 0 AND tasks.deleted = 0 ORDER BY position DESC LIMIT 1", list_id);
	return (result.isValidRow()) ? parseInt(result.field(0)) : 0;
};

/**
 * Update a list by given id
 *
 * @author Dennis Schneider, Daniel Marschner
 */
wunderlist.database.updateListByOnlineId = function(id, name, deleted, position, version, inbox, shared) {
	if (deleted == 1 && shared == 1) {
		list_id = wunderlist.database.getListIdByOnlineId(id);
		
		wunderlist.database.db.execute("DELETE FROM tasks WHERE list_id = ?", list_id);
	}
	
	wunderlist.database.db.execute("UPDATE lists SET name = ?, deleted = ?, position = ?, version = ?, inbox = ?, shared = ? WHERE online_id = ?", name, deleted, position, version, inbox, shared, id);
};

/**
 * Update a list by given token
 *
 * @author Dennis Schneider
 */
wunderlist.database.createListByOnlineId = function(id, name, deleted, position, version, inbox, shared) {
	wunderlist.database.db.execute("INSERT INTO lists (online_id, name, deleted, position, version, inbox, shared) VALUES(?, ?, ?, ?, ?, ?, ?) ", id, name, deleted, position, version, inbox, shared);
};

/**
 * Update a task by given online id
 *
 * @author Dennis Schneider
 */
wunderlist.database.updateTaskByOnlineId = function(online_id, name, date, done, list_id, position, important, done_date, deleted, version, note) {
	if(date == '') date = 0;
	wunderlist.database.db.execute("UPDATE tasks SET name = ?, date = ?, done = ?, list_id = ?, position = ?, important = ?, done_date = ?, deleted = ?, version = ?, note = ? WHERE online_id = ?", name, date, done, list_id, position, important, done_date, deleted, version, note, online_id);
};

/**
 * Update a task by given online id
 *
 * @author Dennis Schneider
 */
wunderlist.database.createTaskByOnlineId = function(online_id, name, date, done, list_id, position, important, done_date, deleted, version, note) {
	if(date == '') date = 0;
	wunderlist.database.db.execute("INSERT INTO tasks (online_id, name, date, done, list_id, position, important, done_date, deleted, version, note) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", online_id, name, date, done, list_id, position, important, done_date, deleted, version, note);
};

/**
 * Return one or all lists as array
 *
 * @author Daniel Marschner
 */
wunderlist.database.getLists = function(list_id) {
	var lists = [];
	var where = '';
	
	if (list_id != undefined)
		where += ' AND lists.id = ' + list_id;
		
	var result = wunderlist.database.db.execute("SELECT lists.*, (SELECT COUNT(tasks.id) FROM tasks WHERE tasks.list_id = lists.id AND deleted = 0 AND done = 0) as taskCount FROM lists WHERE lists.deleted = 0" + where + " ORDER BY lists.inbox DESC, lists.position ASC");
	
	while(result.isValidRow())
	{
		var item = {}
		
		for(var i = 0; i < result.fieldCount(); i++)
			item[result.fieldName(i)] = result.field(i);
		
		lists.push(item);
		
		result.next();
	}
	
	return lists;
};

/**
 * Return one, all or for the given list
 * 
 * @author Dennis Schneider, Daniel Marschner
 */
wunderlist.database.getTasks = function(task_id, list_id) {
	var tasks = [];
	var where = '';
	
	if (task_id != undefined && task_id != '' && task_id > 0)
		where += " AND id = " + task_id;
	
	if (list_id != undefined && list_id != '' && list_id > 0)
		where += " AND list_id = " + list_id;
	
	var result = wunderlist.database.db.execute("SELECT * FROM tasks WHERE deleted = 0 AND done = 0" + where + " ORDER BY important DESC, position ASC");

	while(result.isValidRow())
	{
		var item = {}
		
		for(var i = 0; i < result.fieldCount(); i++)
			item[result.fieldName(i)] = result.field(i);
		
		tasks.push(item);
		
		result.next();
	}

	return tasks;
};

/**
 * Generate the HTML code for the given lists array and append that to the content
 *
 * TODO: Maybe we have to put that function into the HTML helper 
 *
 * @author Dennis Schneider, Daniel Marschner
 */
wunderlist.database.initLists = function(lists) {
	if (lists != undefined && wunderlist.is_array(lists))
	{
		$('div#lists').html('');
			
		for (var ix in lists)
		{
			var listHTML  = '';
			var listClass = 'sharelist';
			var actions   = "<div class='deletep'></div><div class='editp'></div><div class='savep'></div>";
			
			if (lists[ix].inbox == 1)
			{
				actions  = "<div class='editp'></div><div class='savep'></div>";
				listHTML = "<a id='list" + lists[ix].id + "' class='list'><span>" + lists[ix].taskCount + "</span>" + actions + "<b class='inbox'>" + unescape(lists[ix].name) + "</b></a>";
			}
			else if (lists[ix].shared == 1) 
			{
				listClass = "sharedlist";
				listHTML = "<a id='list" + lists[ix].id + "' class='list sortablelist'><span>" + lists[ix].taskCount + "</span>" + actions + "<b class='sharep'>" + unescape(lists[ix].name) + "<div class='" + listClass + "'></div></b></a>";
			}
			else
				listHTML = "<a id='list" + lists[ix].id + "' class='list sortablelist'><span>" + lists[ix].taskCount + "</span>" + actions + "<b class='sharep'>" + unescape(lists[ix].name) + "<div class='" + listClass + "'></div></b></a>";

			$("#lists").append(listHTML);
	
			if(lists[ix].name.length > 30)
				$('div#sidebar a#' + lists[ix].id).children('b').attr('title', unescape(lists[ix].name));
		}
	}
};

/**
 * Generate the HTML code for the given tasks array and return it
 *
 * TODO: Maybe we have to put that function into the HTML helper
 *
 * @author Daniel Marschner
 */
wunderlist.database.initTasks = function(tasks) {
	var tasksHTML = '';
	
	if (tasks != undefined && wunderlist.is_array(tasks))
	{
		for (var ix in tasks)
			tasksHTML += html.generateTaskHTML(tasks[ix].id, tasks[ix].name, tasks[ix].list_id, tasks[ix].done, tasks[ix].important, tasks[ix].date, tasks[ix].note);
	}
	
	return tasksHTML;
};

/**
 * Search throught the tasks table
 *
 * TODO: Maybe we can optimize that function get the HTML code out of the database backend
 *
 * @author Dennis Schneider
 */
wunderlist.database.search = function(search) {
    $("#content").html("");

	var resultSet = wunderlist.database.db.execute("SELECT * FROM tasks WHERE (name LIKE '%" + search + "%' OR note LIKE '%" + search + "%') AND tasks.deleted = 0 ORDER BY done ASC, important DESC, date DESC");

	if (resultSet.rowCount() > 0)
	{
		$("#content").prepend("<div id='listfunctions'><a rel='print tasks' class='list-print'></a><a rel='send by email' class='list-email'></a><a rel='share with cloud app' class='list-cloud'></a><div id='cloudtip'><span class='triangle'></span><span class='copy'>COPY LINK</span><span class='link'></span></div></div>");
		$("#content").append("<h1>"+ wunderlist.language.data.search_results + ": " + search + "</h1><ul id='list' class='mainlist searchlist'></ul>");

        while(resultSet.isValidRow()) {
            var values = new Object();

            for(var i = 0, max = resultSet.fieldCount(); i < max; i++)
                values[resultSet.fieldName(i)] = resultSet.field(i);

            var task = html.generateTaskHTML(values['id'], values['name'], values['list_id'], values['done'], values['important'], values['date'], values['note']);

            $("#content ul.mainlist").append(task);

            resultSet.next();
        }
        
        html.make_timestamp_to_string();
        html.createDatepicker();
    }
	else
        $("#content").append("<h1>"+ wunderlist.language.data.no_search_results + "</h1>");
};

/**
 * Checks if there are any tasks without an online id after the sync - which means
 * there has been some error in the sync. This prevents to lose not synced data
 *
 * @author Dennis Schneider
 */
wunderlist.database.hasElementsWithoutOnlineId = function(type) {
	var result = wunderlist.database.db.execute("SELECT id FROM " + type + " WHERE online_id = 0");

	if (result.isValidRow())
	{
		return true;
	}
	
	return false;
};

/**
 * Returns the last list ID
 *
 * @author Christian Reber, Daniel Marschner
 */
wunderlist.database.getLastListId = function() {
	var result = wunderlist.database.db.execute("SELECT id FROM lists ORDER BY id DESC LIMIT 1");
	return (result.isValidRow()) ? result.field(0) : 0;
};

/**
 * Returns the highest position of lists
 *
 * @author Dennis Schneider, Daniel Marschner
 */
wunderlist.database.getLastListPosition = function() {
	var result = wunderlist.database.db.execute("SELECT position FROM lists WHERE deleted = 0 ORDER BY position DESC LIMIT 1");
	return (result.isValidRow()) ? result.field(0) : 0;
};

/**
 * Returns the online_id of a list
 *
 * @author Daniel Marschner
 */
wunderlist.database.getListOnlineIdById = function(list_id) {
	var result = wunderlist.database.db.execute("SELECT online_id FROM lists WHERE id = ?", list_id);

	if(result.isValidRow())
	{
		online_id = result.field(0);

		if(online_id > 0)
			list_id = online_id;
	}

	return list_id;
};

/*
 * Fetches the online id of a list by the given online id
 *
 * @author Dennis Schneider
 */
wunderlist.database.getListIdByOnlineId = function(list_id) {
	var result = wunderlist.database.db.execute("SELECT id FROM lists WHERE online_id = ?", list_id);

	if(result.isValidRow())
		return result.field(0)

	return list_id;
};

/**
 * Check if task or list already exists
 *
 * @author Dennis Schneider
 */
wunderlist.database.existsByOnlineId = function(type, online_id) {
	var result = wunderlist.database.db.execute("SELECT id FROM '" + type + "' WHERE online_id = ? AND deleted = 0", online_id);

	if(result.rowCount() > 0)
		return true;
	else
		return false;
};

/**
 * Check if task or list already exists
 *
 * @author Daniel Marschner
 */
wunderlist.database.existsById = function(type, id) {
	var result = wunderlist.database.db.execute("SELECT id FROM '" + type + "' WHERE id = ? AND deleted = 0", id);

	if(result.rowCount() > 0)
		return true;
	else
		return false;
};

/**
 * Check if task or list is deleted (hidden)
 *
 * @author Dennis Schneider
 */
wunderlist.database.isDeleted = function(type, online_id) {
	var result = wunderlist.database.db.execute("SELECT deleted FROM '" + type + "' WHERE online_id = ? AND deleted = 1", online_id);

	if(result.rowCount() > 0)
		return true;
	else
		return false;
};

/**
 * Delete elements, which are never synced but set to deleted
 *
 * @author Dennis Schneider
 */
wunderlist.database.deleteNotSyncedElements = function() {
	wunderlist.database.db.execute("DELETE FROM tasks WHERE deleted = 1 AND online_id = 0");
	wunderlist.database.db.execute("DELETE FROM lists WHERE deleted = 1 AND online_id = 0");
	filters.updateBadges();
}

/**
 * Deletes a task or list really
 *
 * @author Dennis Schneider
 */
wunderlist.database.deleteElements = function(type, online_id) {
	wunderlist.database.db.execute("DELETE FROM '" + type + "' WHERE online_id = ?", online_id);
};

/**
 * Check if the list is already shared
 *
 * @author Dennis Schneider
 */
wunderlist.database.isShared = function(list_id) {
	var result = wunderlist.database.db.execute("SELECT shared FROM lists WHERE id = ? AND shared = 1", list_id);

	if(result.isValidRow() && result.rowCount() > 0)
		return true;
	
	return false;
};

/**
 * Checks if the list has an online id
 *
 * @author Dennis Schneider
 */
wunderlist.database.isSynced = function(list_id) {
	var result = wunderlist.database.db.execute("SELECT online_id FROM lists WHERE online_id != 0 AND id = ?", list_id);

	if(result.isValidRow())
		return true;
	
	return false;
};

/**
 * Update the count of the list
 *
 * @author Dennis Schneider, Daniel Marschner
 */
wunderlist.database.updateTaskCount = function(list_id) {
	if (list_id != undefined && list_id > 0)
	{
		wunderlist.database.db.execute("SELECT id FROM tasks WHERE list_id = ? AND done = 0 AND deleted = 0", list_id);
		$('div#lists a#list' + list_id + ' span').html(wunderlist.database.db.rowsAffected);
	}
	else
	{
		var result = wunderlist.database.db.execute("SELECT id FROM lists");
		
		while (result.isValidRow())
		{	
			wunderlist.database.db.execute("SELECT id FROM tasks WHERE list_id = ? AND done = 0 AND deleted = 0", result.field(0));
			$('div#lists a#list' + result.field(0) + ' span').html(wunderlist.database.db.rowsAffected);
			
			result.next();
		}
	}
};

/**
 * Get the task number for today or overdue
 *
 * @author Dennis Schneider, Daniel Marschner
 */
wunderlist.database.updateBadgeCount = function(filter) {
	if (filter != undefined && (filter == 'today' || filter == 'overdue'))
	{
		var sql  = "SELECT id AS count FROM tasks WHERE ";
		var date = html.getWorldWideDate(); // Current date
	
		switch(filter)
		{
			case 'today':
				sql += "tasks.date = " + date + " AND tasks.date != 0 AND tasks.done = 0 AND tasks.deleted = 0";
				break;
				
			case 'overdue':
				sql += "tasks.done = 0 AND tasks.date < " + date + " AND tasks.date != 0 AND tasks.deleted = 0";
				break;
		}
		
	  	var result = wunderlist.database.db.execute(sql);
	  	
	  	return result.rowCount();
	}
	else
		return 0;
};

/**
 * Gets a list by given task id
 *
 * @author Daniel Marschner
 */
wunderlist.database.getListIdsByTaskId = function(task_id) {
	var returnList = {};
	var result     = wunderlist.database.db.execute("SELECT list_id FROM tasks WHERE id = ?", task_id);

	if(result.isValidRow())
	{
		var result = wunderlist.database.db.execute("SELECT id, online_id FROM lists WHERE lists.id = ?", result.field(0));

		if(result.isValidRow())
		{
			returnList['id'] 		  = result.field(0);
			returnList['online_id'] = result.field(1);
		}
	}

	return returnList;
}

/*
 * Filters tasks by a given type
 *
 * TODO: This has to be updated in the same step were we update the filter structure (sorted tasks by list)
 *
 * @author Dennis Schneider, Daniel Marschner
 */
wunderlist.database.getFilteredTasks = function(filter, date_type, printing) {
	if (printing == undefined)
		printing = false;
	
	var title    = '';
	var show_add = false;
	var date     = html.getWorldWideDate(); // Current date
	var sql      = "SELECT * FROM tasks ";

	switch(filter)
	{
		case 'starred':		show_add = true;
							title    = wunderlist.language.data.all_starred_tasks;
								
							sql += "WHERE tasks.important = 1 AND tasks.done = 0";
							break;

		case 'today':		show_add = true;
							title    = wunderlist.language.data.all_today_tasks;
							
							sql += "WHERE tasks.date = " + date + " AND tasks.date != 0 AND tasks.done = 0";
							break;

		case 'tomorrow':	show_add = true;
							title    = wunderlist.language.data.all_tomorrow_tasks;
							
							sql += "WHERE tasks.date = " + (date + 86400) + " AND tasks.done = 0 AND tasks.deleted = 0";
							break;

		case 'thisweek':	title = wunderlist.language.data.all_thisweeks_tasks;
							
							sql += "WHERE tasks.date BETWEEN " + date + " AND " + (date + (86400 * 7)) + " AND tasks.done = 0 AND tasks.date != 0";
							break;

		case 'done':		title = wunderlist.language.data.all_done_tasks;
							
							sql += "WHERE tasks.done = 1";
							break;

		case 'all':			show_add = true;
							title    = wunderlist.language.data.all_tasks;
							
							sql += "WHERE tasks.done = 0";
							break;

		case 'overdue':		title = wunderlist.language.data.overdue_tasks;
							
							sql += "WHERE tasks.done = 0 AND tasks.date < " + date + " AND tasks.date != 0";
							break;

		case 'date':		if (date_type == 'nodate')
							{
								show_add  = true;
								title     = wunderlist.language.data.all_someday_tasks;	
								date      = 0;
								date_type = '=';		
							}
							else
							{
								title     = wunderlist.language.data.all_later_tasks;
								date      = (date + 86400);
								date_type = '>';
							}
							
							sql += "WHERE tasks.date " + date_type + " " + date + " AND tasks.done = 0";
							break;
	}

	sql += " AND tasks.deleted = 0 ORDER BY tasks.list_id ASC, tasks.important DESC, tasks.position ASC";

	var result = wunderlist.database.db.execute(sql);

	if (printing == true)
		return result;

	$("#content").html('').hide();
	$("#content").append(html.buildFilteredList(title, wunderlist.database.fetchData(result), show_add, filter));
	
	makeSortable();
	
	if (filter == 'all' || filter == 'starred' || date_type == '=')
		html.createDatepicker();
	
	html.make_timestamp_to_string();
	
	$("#content").fadeIn('fast');
};

/**
 * Get filtered tasks for printing
 *
 * @author Dennis Schneider
 */
wunderlist.database.getFilteredTasksForPrinting = function(type, date_type) {
	var result = wunderlist.database.getFilteredTasks(type, date_type, true);
	var tasks  = {};
	var k      = 0;
	
	while(result.isValidRow())
	{
		tasks[k] = {};
		
		for(var i = 0; i < result.fieldCount(); i++)
			tasks[k][result.fieldName(i)] = result.field(i);
		
		result.next();
		k++;
	}

	return tasks;
};

/**
 * Gets all data for the sync process
 *
 * @author Dennis Schneider
 */
wunderlist.database.getDataForSync = function(type, fields, where, return_object) {
	if(type == undefined)
  		type = 'lists';

	if(return_object == undefined)
		return_object = true;

	if(fields == undefined)
		fields = '*'

    var sql  = "SELECT " + fields + " FROM " + type;

	if(where != undefined)
		sql += ' WHERE ' + where;

    var result = wunderlist.database.db.execute(sql);

	values = {};
	i = 0;

    while(result.isValidRow())
    {
    	if(return_object)
			values[i] = {};

		if(return_object)
			for(var y = 0, max = result.fieldCount(); y < max; y++)
				values[i][result.fieldName(y)] = result.field(y);

		if(!return_object)
			for(var y = 0, max = result.fieldCount(); y < max; y++)
				values[result.fieldName(y)] = result.field(y);

		i++;
		result.next();
	}

	return values;
};

/**
 * Gets the last done tasks
 *
 * TODO: Shorten the method, it's too long
 *
 * @author Dennis Schneider
 */
wunderlist.database.getLastDoneTasks = function(list_id) {
	var sql  = "SELECT tasks.id AS task_id, tasks.name, tasks.done, tasks.important, tasks.position, tasks.date, tasks.list_id, tasks.done_date, tasks.note ";
	    sql += "FROM tasks ";
	    sql += "WHERE tasks.done = 1 AND list_id = '" + list_id + "' AND tasks.deleted = 0 ";
	    sql += "ORDER BY tasks.done_date DESC";

	var resultSet = wunderlist.database.db.execute(sql);

    if (resultSet.rowCount() > 0)
    {
	    var doneListsTasks = [];

		while(resultSet.isValidRow())
	    {
	        var values = {};

			for (var i = 0, max = resultSet.fieldCount(); i < max; i++)
				values[resultSet.fieldName(i)] = resultSet.field(i);

			var days   = wunderlist.calculateDayDifference(values['done_date']);
			var htmlId = days.toString();

			if (wunderlist.is_array(doneListsTasks[htmlId]) == false)
				doneListsTasks[htmlId] = [];

	        doneListsTasks[htmlId].push(html.generateTaskHTML(values['task_id'], values['name'], values['list_id'], values['done'], values['important'], values['date'], values['note']));

	        resultSet.next();
		}

		for(listId in doneListsTasks)
		{
			var day_string = wunderlist.language.data.day_ago;
			var heading    = '<h3>';

			if (listId == 0) 
			{
				day_string = wunderlist.language.data.done_today;days_text = '';
				heading = '<h3 class="head_today">';
			}
			else if (listId == 1)
			{
				day_string = wunderlist.language.data.done_yesterday;days_text = '';
			}
			else 
			{
				day_string = wunderlist.language.data.days_ago;days_text = listId;
			}

			// Check for older tasks and append new div
			if (listId > 1 && ($('#older_tasks').length == 0))
			{
				$('#content').append('<button id="older_tasks_head">' + wunderlist.language.data.older_tasks + '</button><div id="older_tasks"></div>');
			}

			if ($('ul#donelist_' + listId).length == 0)
			{
				var appendHTML = heading + days_text + ' ' + day_string + '</h3><ul id="donelist_' + (listId == 0 ? 'list_today' : listId) + '" class="donelist">' + doneListsTasks[listId].join('') + '</ul>';

				if ($('#older_tasks').length == 0)
				{
					$('#content').append(appendHTML);
				}
				else
				{
					$('#older_tasks').append(appendHTML);
				}
			}
		}

		// If there are older tasks, then append a hide button
		if ($('#older_tasks ul').length > 0)
			$('#content').append('<button id="hide_older_tasks">' + wunderlist.language.data.hide_older_tasks + '</button>');
	}
};