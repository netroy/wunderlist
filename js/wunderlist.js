var wunderlist = wunderlist || {};

$(function()
{
	wunderlist.initAppTitle();
	wunderlist.initDatabase();
	language.init();
	account.init();
	timer.init();
	Menu.initializeTrayIcon();
});

/**
 * Extends application title with current version
 *
 * @author Christian Reber
 */
wunderlist.initAppTitle = function()
{
	document.title = 'wunderlist ' + Titanium.App.getVersion();
}

/**
 * Creates the database file and all tables
 *
 * @author Dennis Schneider, Daniel Marschner, Christian Reber
 */
wunderlist.initDatabase = function()
{
	var filepath = Titanium.Filesystem.getFile(Titanium.Filesystem.getApplicationDataDirectory(), 'wunderlist.db');
	this.database = Titanium.Database.openFile(filepath);

	if(Titanium.App.Properties.hasProperty('prefinal_first_run') == false)
	{
		var sql 	= "DROP TABLE IF EXISTS lists";
		this.database.execute(sql);
		sql 		= "DROP TABLE IF EXISTS tasks";
		this.database.execute(sql);
		Titanium.App.Properties.setString('prefinal_first_run', '1');
	}

	this.database.execute("CREATE TABLE IF NOT EXISTS lists (id INTEGER PRIMARY KEY AUTOINCREMENT, online_id INTEGER DEFAULT 0, name TEXT, position INTEGER DEFAULT 0, version INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0, inbox INTEGER DEFAULT 0)");
	this.database.execute("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, online_id INTEGER DEFAULT 0, name TEXT, list_id TEXT, note TEXT, date INTEGER DEFAULT 0, done_date INTEGER DEFAULT 0, done INTEGER DEFAULT 0, position INTEGER DEFAULT 0, important INTEGER DEFAULT 0, version INTEGER DEFAULT 0, deleted INTEGER DEFAULT 0)");
}

/**
 * Creates the standard database calls
 *
 * @author Daniel Marschner, Christian Reber, Dennis Schneider
 */
wunderlist.createDatabaseStandardElements = function(only_tutorials)
{
	var resultSet = this.database.execute("SELECT id FROM lists WHERE id = '1' AND lists.deleted = 0 LIMIT 1");
	if(resultSet.rowCount() == 0 || only_tutorials == true)
	{
		// Only clear database, if complete start
		if (only_tutorials != true)
		{
			// Truncate database and create inbox
			wunderlist.truncateDatabase();
			this.database.execute("INSERT INTO lists (name, id, inbox) VALUES ('" + language.data.inbox + "', '1', '1')");
			save_last_opened_list('2');
		}

		var tutorials_list_id = this.createList(language.data.tutorials);

		// Generate Default Tasks
		this.database.execute("INSERT INTO tasks (name, list_id, position, important) VALUES ('" + language.data.default_task_1 + "', '" + tutorials_list_id + "', '0', '1')");

		// Default Tasks for Mac
		if (os == 'darwin')
		{
			this.database.execute("INSERT INTO tasks (name, list_id, position) VALUES ('" + language.data.default_task_2_mac + "', '" + tutorials_list_id + "', '1')");
			this.database.execute("INSERT INTO tasks (name, list_id, position) VALUES ('" + language.data.default_task_5_mac + "', '" + tutorials_list_id + "', '4')");
			this.database.execute("INSERT INTO tasks (name, list_id, position) VALUES ('" + language.data.default_task_6_mac + "', '" + tutorials_list_id + "', '5')");
		}
		// Default Tasks for other operating systems
		else
		{
			this.database.execute("INSERT INTO tasks (name, list_id, position) VALUES ('" + language.data.default_task_2 + "', '" + tutorials_list_id + "', '1')");
			this.database.execute("INSERT INTO tasks (name, list_id, position) VALUES ('" + language.data.default_task_5 + "', '" + tutorials_list_id + "', '4')");
			this.database.execute("INSERT INTO tasks (name, list_id, position) VALUES ('" + language.data.default_task_6 + "', '" + tutorials_list_id + "', '5')");
		}

		this.database.execute("INSERT INTO tasks (name, list_id, position) VALUES ('" + language.data.default_task_4 + "', '" + tutorials_list_id + "', '2')");
		this.database.execute("INSERT INTO tasks (name, list_id, position) VALUES ('" + language.data.default_task_8 + "', '" + tutorials_list_id + "', '3')");

		done_date = new Date().getTime() / 1000;
		this.database.execute("INSERT INTO tasks (name, list_id, position, done, done_date) VALUES (?, ?, ?, ?, ?)", language.data.default_task_7, tutorials_list_id, '4', '1', done_date);

		// Load the new list (only if users recreates tutorials)
		if (only_tutorials == true)
		{
			timer.stop().set(15).start();
			return tutorials_list_id;
		}
	}
}

/**
 * Recreate tutorial tasks
 *
 * @author Christian Reber
 */
wunderlist.recreateTutorials = function()
{
	var tutorials_list_id = wunderlist.createDatabaseStandardElements(true);
	save_last_opened_list(tutorials_list_id);
	account.loadInterface();
}

/**
 * Truncates the whole database
 *
 * @author Dennis Schneider
 */
wunderlist.truncateDatabase = function()
{
	this.database.execute("DELETE FROM lists");
	this.database.execute("DELETE FROM tasks");
	this.database.execute("DELETE FROM sqlite_sequence WHERE name = 'lists'");
	this.database.execute("DELETE FROM sqlite_sequence WHERE name = 'tasks'");
}

/**
 * Load all lists from database
 *
 * @author Dennis Schneider
 * @author Daniel Marschner
 */
wunderlist.initLists = function()
{
	var listsResultSet = this.database.execute("SELECT lists.id, lists.name, lists.inbox, (SELECT COUNT(tasks.id) FROM tasks WHERE tasks.list_id = lists.id AND deleted = 0 AND done = 0) as taskCount FROM lists WHERE lists.deleted = 0 ORDER BY lists.inbox DESC, lists.position ASC");

	 $('div#lists').html('');

	while(listsResultSet.isValidRow())
	{
		var list = {
			'id':			listsResultSet.field(0),
			'name':			unescape(listsResultSet.field(1)),
			'inbox':		listsResultSet.field(2),
			'taskCount':	listsResultSet.field(3)
		};

		var html = '';

		if(list['inbox'] == 1)
 			html = "<a id='" + list['id'] + "' class='list'><span>" + list.taskCount + "</span><div class='sharep'></div><div class='editp'></div><div class='savep'></div><b class='inbox'>" + list['name'] + "</b></a>";
 		else
 			html = "<a id='" + list['id'] + "' class='list sortablelist'><span>" + list.taskCount + "</span><div class='deletep'></div><div class='sharep'></div><div class='editp'></div><div class='savep'></div><b>" + list['name'] + "</b></a>";

		$("#lists").append(html);

		if(list['name'].length > 30)
			$('div#sidebar a#' + list['id']).children('b').attr('title', list['name']);

		listsResultSet.next();
    }
}

/**
 * Checks for existing list
 *
 * @author Daniel Marschner
 */
wunderlist.listExistsById = function(list_id)
{
	var countSet = this.database.execute("SELECT * FROM lists WHERE id = '" + list_id + "' AND deleted = 0");
	return (countSet.rowCount() > 0) ? true : false;
}

/**
 * Generate the task list
 *
 * @author Dennis Schneider
 */
wunderlist.fetchData = function(resultTaskSet)
{
	var html = '';

	while(resultTaskSet.isValidRow())
	{
		var task = {};

		for(var i = 0; i < resultTaskSet.fieldCount(); i++)
			task[resultTaskSet.fieldName(i)] = resultTaskSet.field(i);

		html += generateTaskHTML(task['task_id'], task['task_name'], task['list_id'], task['done'], task['important'], task['date']);

		resultTaskSet.next();
	}

	return html;
}

/**
 * Calculates the difference between the current and the given date
 *
 * @author Dennis Schneider
 */
wunderlist.calculateDayDifference = function(done)
{
	var today   = new Date();

	// One day in seconds
	var one_day = 86400;

	var unceiled_days = ((today.getTime() / 1000) - done) / (one_day);

	if(unceiled_days > 1)
		// Calculate difference btw the two dates, and convert to days
		return Math.floor(unceiled_days);
	else
		return 0;
}

/**
 * Live search function
 *
 * @author Dennis Schneider
 */
wunderlist.liveSearch = function(search)
{
    $("#content").html("");

	var resultSet = this.query("SELECT * FROM tasks WHERE name LIKE '%" + search + "%' AND tasks.deleted = 0 ORDER BY done ASC, important DESC, date DESC");

	if (resultSet.rowCount() > 0)
	{
		$("#content").append("<h1>"+ language.data.search_results + "</h1><ul id='list' class='mainlist search'></ul>");

        while(resultSet.isValidRow()) {
            var values = new Object();

            for(var i = 0, max = resultSet.fieldCount(); i < max; i++)
                values[resultSet.fieldName(i)] = resultSet.field(i);

            var task = generateTaskHTML(values['id'], values['name'], values['list_id'], values['done'], values['important'], values['date']);

            $("#content ul.mainlist").append(task);

            resultSet.next();
        }
    }
	else
        $("#content").append("<h1>"+ language.data.no_search_results + "</h1>");
}

/**
 * Execute a query in the database
 *
 * @author Dennis Schneider
 */
wunderlist.query = function(query)
{
    return this.database.execute(query);
}

/**
 * Creates a task with the given name, list_id and timestamp
 *
 * @author Dennis Schneider
 */
wunderlist.createTask = function(name, list_id, timestamp)
{
	if(timestamp == '') timestamp = 0;

    // Get current position
	var resultSet = this.database.execute("SELECT position FROM tasks WHERE list_id = '" + list_id + "' AND tasks.deleted = 0 ORDER BY position DESC LIMIT 1");
	if(resultSet.isValidRow())
		var position = resultSet.field(0);
	else
		var position = 0;

	if(position > 0)
		var new_position = position + 1;
	else
		var new_position = 0;

 	this.database.execute("INSERT INTO tasks (name, list_id, date, position, version) VALUES ('" + name + "', '" + list_id + "', '" + timestamp + "', '" + new_position + "', '0')");

	wunderlist.updateCount(list_id);

	timer.stop().set(15).start();

	return this.database.lastInsertRowId;
}

/**
 * Returns the last ID of lists
 *
 * @author Christian Reber
 */
wunderlist.getLastIdOfLists = function() {
	var resultSet = this.database.execute("SELECT id FROM lists ORDER BY id DESC LIMIT 1");
	return (resultSet.isValidRow()) ? resultSet.field(0) : 0;
}

/**
 * Returns the highest position of lists
 *
 * @author Dennis Schneider
 */
wunderlist.getLastPositionOfLists = function() {
	var resultSet = this.database.execute("SELECT position FROM lists WHERE deleted = 0 ORDER BY position DESC LIMIT 1");
	return (resultSet.isValidRow()) ? resultSet.field(0) : 0;
}

/**
 * Returns the online_id of a list
 *
 * @author Daniel Marschner
 */
wunderlist.getListOnlineIdById = function(list_id) {
	var resultSet = this.database.execute("SELECT online_id FROM lists WHERE id = ?", list_id);

	if(resultSet.isValidRow())
	{
		online_id = resultSet.field(0);

		if(online_id > 0)
			list_id = online_id;
	}

	return list_id;
}

/*
 * Fetches the online id of a list by the given online id
 *
 * @author Dennis Schneider
 */
wunderlist.getListIdByOnlineId = function(list_id)
{
	var resultSet = this.database.execute("SELECT id FROM lists WHERE online_id = ?", list_id);

	if(resultSet.isValidRow())
		return resultSet.field(0)

	return list_id;
}

/**
 * Check if task or list already exists
 *
 * @author Dennis Schneider
 */
wunderlist.elementExists = function(online_id, type)
{
	var resultSet = this.database.execute("SELECT id FROM '" + type + "' WHERE online_id = ?", online_id);

	if(resultSet.rowCount() > 0)
		return true;
	else
		return false;
}

/**
 * Check if task or list is deleted (hidden)
 *
 * @author Dennis Schneider
 */
wunderlist.elementIsDeleted = function(online_id, type)
{
	var resultSet = this.database.execute("SELECT deleted FROM '" + type + "' WHERE online_id = ? AND deleted = 1", online_id);

	if(resultSet.rowCount() > 0)
		return true;
	else
		return false;
}

/**
 * Delete elements, which are never synced but set to deleted
 *
 * @author Dennis Schneider
 */
wunderlist.deleteNotSyncedElements = function()
{
	this.database.execute("DELETE FROM tasks WHERE deleted = 1 AND online_id = 0");
	this.database.execute("DELETE FROM lists WHERE deleted = 1 AND online_id = 0");
	filters.updateBadges();
}

/**
 * Deletes a task or list really
 *
 * @author Dennis Schneider
 */
wunderlist.deleteElementForever = function(online_id, type)
{
	this.database.execute("DELETE FROM '" + type + "' WHERE online_id = ?", online_id);
}

/**
 * Update a task name
 *
 * @author Dennis Schneider
 */
wunderlist.updateTask = function(task_id, name, date)
{
	if(date == '') date = 0;
	timer.stop().set(15).start();
	this.database.execute("UPDATE tasks SET name = ?, date = ?, version = version + 1 WHERE id = ?", name, date, task_id);
}

/**
 * Update a task by given online id
 *
 * @author Dennis Schneider
 */
wunderlist.updateTaskByOnlineId = function(online_id, name, date, done, list_id, position, important, done_date, deleted, version)
{
	if(date == '') date = 0;
	this.database.execute("UPDATE tasks SET name = ?, date = ?, done = ?, list_id = ?, position = ?, important = ?, done_date = ?, deleted = ?, version = ? WHERE online_id = ?", name, date, done, list_id, position, important, done_date, deleted, version, online_id);
}

/**
 * Update a task by given online id
 *
 * @author Dennis Schneider
 */
wunderlist.createTaskByOnlineId = function(online_id, name, date, done, list_id, position, important, done_date, deleted, version)
{
	if(date == '') date = 0;
	this.database.execute("INSERT INTO tasks (online_id, name, date, done, list_id, position, important, done_date, deleted, version) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", online_id, name, date, done, list_id, position, important, done_date, deleted, version);
}

/**
 * Update a task position
 *
 * @author Dennis Schneider
 */
wunderlist.updateTaskPosition = function(task_id, position)
{
    this.database.execute("UPDATE tasks SET position = ?, version = version + 1 WHERE id = ?", position, task_id);
    timer.stop().set(15).start();
}

/**
 * Update a task id
 *
 * @author Dennis Schneider
 */
wunderlist.updateTaskId = function(id, online_id)
{
	this.database.execute("UPDATE tasks SET online_id = ? WHERE id = ?", online_id, id);
	if(wunderlist.elementIsDeleted(id, 'tasks'))
		wunderlist.deleteElementForever(id, 'tasks');
}

/**
 * Update a task list id
 *
 * @author Dennis Schneider
 */
wunderlist.updateTaskListId = function(id, online_id)
{
	this.database.execute("UPDATE tasks SET list_id = ? WHERE list_id = ?", online_id, id);
}

/**
 * Set a task to done
 *
 * @author Dennis Schneider
 */
wunderlist.taskDone = function(task_id, list_id, isFilter)
{
	if(isFilter == undefined)
	{
		isFilter = false;
	}
	
	done_date = Math.round(new Date().getTime() / 1000);
	timer.stop().set(15).start();
	this.database.execute("UPDATE tasks SET done = 1, done_date = ?, version = version + 1 WHERE id = ?", done_date, task_id);
	
	// If it is not a filter site, just update the done state of the task
	if(isFilter == false)
	{
		this.updateCount(list_id);
	}
	// If it is a filter / search site, update all tasks
	else
	{
		var resultSet = this.database.execute("SELECT id FROM lists");
		var listIDs   = [];
		
		while(resultSet.isValidRow())
		{	
			listIDs.push(resultSet.field(0));
			resultSet.next();
		}
		
		for(id in listIDs)
		{
			this.updateCount(listIDs[id]);
		}
	}
}

/**
 * Set a task to undone
 *
 * @author Dennis Schneider
 */
wunderlist.taskUndone = function(task_id, list_id, isFilter)
{
	if(isFilter == undefined)
	{
		isFilter = false;
	}	
	
	timer.stop().set(15).start();
	this.database.execute("UPDATE tasks SET done = 0, done_date = 0, version = version + 1 WHERE id = ?", task_id);

	// If it is not a filter site, just update the done state of the task
	if(isFilter == false)
	{
		this.updateCount(list_id);
	}
	// If it is a filter / search site, update all tasks
	else
	{
		var resultSet = this.database.execute("SELECT id FROM lists");
		var listIDs   = [];
		
		while(resultSet.isValidRow())
		{	
			listIDs.push(resultSet.field(0));
			resultSet.next();
		}
		
		for(id in listIDs)
		{
			this.updateCount(listIDs[id]);
		}
	}
}

/**
 * Set a task to important
 *
 * @author Dennis Schneider
 */
wunderlist.setImportant = function(task_id)
{
	timer.stop().set(15).start();
	this.database.execute("UPDATE tasks SET important = 1, position = 0, version = version + 1 WHERE id = ?", task_id);
}

/**
 * Set a task to unimportant
 *
 * @author Dennis Schneider
 */
wunderlist.setUnimportant = function(task_id)
{
	timer.stop().set(15).start();
	this.database.execute("UPDATE tasks SET important = 0, version = version + 1 WHERE id = ?", task_id);
}

/**
 * Create a new list in the database
 *
 * @author Dennis Schneider
 */
wunderlist.createList = function(name)
{
	var new_position = this.getLastPositionOfLists() + 1;
	this.database.execute("INSERT INTO lists (name, version, position) VALUES (?, ?, ?)", name, '0', new_position);
	timer.stop().set(15).start();
	return this.database.lastInsertRowId;
}

/**
 * Update a list name
 *
 * @author Dennis Schneider
 */
wunderlist.updateList = function(list_id, list_name)
{
	timer.stop().set(15).start();
	this.database.execute("UPDATE lists SET name = ?, version = version + 1 WHERE id = ?", list_name, parseInt(list_id));
}

/**
 * Update a list id
 *
 * @author Dennis Schneider
 */
wunderlist.updateListId = function(id, online_id)
{
	this.database.execute("UPDATE lists SET online_id = ? WHERE id = ?", online_id, id);
}

/**
 * Update a list position
 *
 * @author Dennis Schneider
 */
wunderlist.updateListPosition = function(list_id, position)
{
	timer.stop().set(15).start();
	this.database.execute("UPDATE lists SET position = ?, version = version + 1 WHERE id = ?", position, list_id);
}

/**
 * Update a list by given id
 *
 * @author Dennis Schneider
 */
wunderlist.updateListByOnlineId = function(id, name, deleted, position, version, inbox)
{
	this.database.execute("UPDATE lists SET name = ?, deleted = ?, position = ?, version = ?, inbox = ? WHERE online_id = ?", name, deleted, position, version, inbox, id);
}

/**
 * Update a list by given token
 *
 * @author Dennis Schneider
 */
wunderlist.createListByOnlineId = function(id, name, deleted, position, version, inbox)
{
	this.database.execute("INSERT INTO lists (online_id, name, deleted, position, version, inbox) VALUES(?, ?, ?, ?, ?, ?) ", id, name, deleted, position, version, inbox);
}

/**
 * Delete a list by the given id
 *
 * @author Dennis Schneider
 */
wunderlist.deleteListById = function(list_id)
{
	timer.stop().set(15).start();
	this.database.execute("UPDATE lists SET deleted = 1, version = version + 1 WHERE id = ?", list_id);
	this.database.execute("UPDATE tasks SET deleted = 1, version = version + 1 WHERE list_id = ?", list_id);
	filters.updateBadges();
}

/**
 * Update the count of the list
 *
 * @author Dennis Schneider
 */
wunderlist.updateCount = function(list_id)
{
	this.database.execute("SELECT id FROM tasks WHERE list_id = '" + list_id + "' AND done = 0 AND deleted = 0");
	$('div#lists a#' + list_id + ' span').html(this.database.rowsAffected);
}

/**
 * Update the list id of a task
 *
 * @author Dennis Schneider
 */
wunderlist.updateTaskList = function(task_id, list_id)
{
	timer.stop().set(15).start();
	var resultSet = this.database.execute("SELECT position FROM tasks WHERE list_id = '" + list_id + "' AND tasks.deleted = 0 ORDER BY position DESC LIMIT 1");
	var position = 0;
	if(resultSet.isValidRow())
		position = resultSet.field(0) + 1;

	this.database.execute("UPDATE tasks SET list_id = ?, position = ?, version = version + 1 WHERE id = ?", parseInt(list_id), parseInt(position), parseInt(task_id));
	this.updateCount(list_id);
}

/**
 * Sets a task to deleted
 *
 * @author Dennis Schneider
 */
wunderlist.deleteTaskById = function(task_id, list_id)
{
	timer.stop().set(15).start();
	this.database.execute("UPDATE tasks SET deleted = 1, version = version + 1 WHERE id = '" + task_id + "'");
	this.updateCount(list_id);
}

/**
 * Get the task number for today or overdue
 *
 * @author Dennis Schneider
 */
wunderlist.getBadgeCount = function(filter_name)
{
	var sql = "SELECT id AS count FROM tasks WHERE ";

	var current_date  = getWorldWideDate();

	switch(filter_name)
	{
		case 'today':
			sql += "tasks.date = " + current_date + " AND tasks.date != 0 AND tasks.done = 0 AND tasks.deleted = 0";
			break;
			
		case 'overdue':
			sql += "tasks.done = 0 AND tasks.date < " + current_date + " AND tasks.date != 0 AND tasks.deleted = 0";
			break;
			
		default:
			break;
	}
  	var resultSet = this.query(sql);
  	return resultSet.rowCount();
}

/**
 * Gets a list by a given id (offline_id)
 *
 * @author Dennis Schneider
 * @author Daniel Marschner
 */
wunderlist.getListById = function(list_id)
{
	var resultListSet = wunderlist.query("SELECT id, name FROM lists WHERE id = '" + list_id + "' AND lists.deleted = 0");
	var html = '';

	var list = {
		'id':   resultListSet.field(0),
		'name': resultListSet.field(1)
	};

	// Select the list tasks
	var sql  = "SELECT tasks.id AS task_id, tasks.online_id AS online_id, tasks.name AS task_name, tasks.done, tasks.important, tasks.date, tasks.position, tasks.list_id ";
	    sql += "FROM tasks ";
	    sql += "WHERE tasks.list_id = '" + list['id'] + "' AND tasks.done = 0 AND tasks.deleted = 0 ";
	    sql += "ORDER BY tasks.important DESC, tasks.position ASC";

	var resultTaskSet = wunderlist.database.execute(sql);

	$('#content').append(generateListContentHTML(list['id'], list['name']));
	$("#list").append(wunderlist.fetchData(resultTaskSet));
}

/**
 * Gets a list by given task id
 *
 * @author Daniel Marschner
 */
wunderlist.getListIdsByTaskId = function(task_id)
{
	var list = {};

	var resultTaskSet = this.database.execute("SELECT list_id FROM tasks WHERE id = ?", task_id);

	if(resultTaskSet.isValidRow())
	{
		var resultListSet = this.database.execute("SELECT id, online_id FROM lists WHERE lists.id = ?", resultTaskSet.field(0));

		if(resultListSet.isValidRow())
		{
			list['id'] 		  = resultListSet.field(0);
			list['online_id'] = resultListSet.field(1);
		}
	}

	return list;
}

/**
 * Gets a list name by given list id
 *
 * @author Daniel Marschner
 */
wunderlist.getListNameById = function(list_id)
{
	var sql  = "SELECT lists.name";
		sql += "FROM tasks ";
		sql += "WHERE lists.id = '" + list_id + "'";

	var resultSet = wunderlist.query(sql);

	if(resultSet.isValidRow())
		return resultSet.field(0);
	else
		return undefined;
}

/*
 * Filters tasks by a given type
 *
 * @author Dennis Schneider
 */
wunderlist.getFilteredTasks = function(type, date_type)
{
	var sql  = "SELECT tasks.id AS task_id, tasks.online_id AS online_id, tasks.name AS task_name, tasks.done, tasks.important, tasks.position, tasks.date, tasks.list_id ";
		sql += "FROM tasks ";

	current_date = getWorldWideDate();

	switch(type)
	{
		case 'starred':
			var listClass = "mainlist";
			var title = language.data.all_starred_tasks;
			sql 	 += "WHERE tasks.important = 1 AND tasks.done = 0 AND tasks.deleted = 0 ";
			break;

		case 'today':
			var listClass = "mainlist";
			var title = language.data.all_today_tasks;
			sql 	 += "WHERE tasks.date = " + current_date + " AND tasks.date != 0 AND tasks.done = 0 AND tasks.deleted = 0 ";
			break;

		case 'tomorrow':
			var listClass = "mainlist";
			var title = language.data.all_tomorrow_tasks;
			sql 	 += "WHERE tasks.date = " + (current_date + 86400) + " AND tasks.done = 0 AND tasks.deleted = 0 AND tasks.deleted = 0 ";
			break;

		case 'thisweek':
			var listClass = "mainlist";
			var title = language.data.all_thisweeks_tasks;
			sql 	 += "WHERE tasks.date BETWEEN " + current_date + " AND " + (current_date + (86400 * 7)) + " AND tasks.done = 0 AND tasks.date != 0 AND tasks.deleted = 0 ";
			break;

		case 'done':
			var title = language.data.all_done_tasks;
			var listClass = "donelist";
			sql 	 += "WHERE tasks.done = 1 AND tasks.deleted = 0 ";
			break;

		case 'all':
			var listClass = "mainlist";
			var title = language.data.all_tasks;
			sql 	 += "WHERE tasks.done = 0 AND tasks.deleted = 0 ";
			break;

		case 'overdue':
			var listClass = "mainlist";
			var title = language.data.overdue_tasks;
			sql 	 += "WHERE tasks.done = 0 AND tasks.date < " + current_date + " AND tasks.date != 0 AND tasks.deleted = 0 ";
			break;

		case 'date':
			var listClass = "mainlist";
			if(date_type == 'nodate')
			{
				date      = 0;
				date_type = '=';
				title     = language.data.all_someday_tasks;

			}
			else
			{
				date = (current_date + 86400);
				date_type = '>';
				title     = language.data.all_later_tasks;
			}
			sql += "WHERE tasks.date " + date_type + " " + date + " AND tasks.done = 0 AND tasks.deleted = 0 ";
			break;
	}

	sql += "ORDER BY tasks.important DESC, tasks.date DESC";

	var content = $("#content");

	content.html('').hide();
	content.append('<h1>' + title + '</h1><ul id="list" class="filterlist ' + listClass + '"></ul>');

	var resultSet = this.database.execute(sql);

	$("#list").append(wunderlist.fetchData(resultSet));

	if(resultSet.rowCount() < 1)
		content.append("<h3>" + language.data.no_results + "</h3>");

	content.fadeIn('fast');
}

/**
 * Creates a user in the properties
 *
 * @author Dennis Schneider
 */
wunderlist.createUser = function(email, password)
{
	Titanium.App.Properties.setString('logged_in', 'true');
	Titanium.App.Properties.setString('email', email.toString());
	Titanium.App.Properties.setString('password', password.toString());
}

/**
 * Sets the user to logout
 *
 * @author Dennis Schneider
 */
wunderlist.logUserOut = function()
{
	Titanium.App.Properties.setString('logged_in', 'false');
}

/**
 * Checks if the user is logged in
 *
 * @author Dennis Schneider
 */
wunderlist.isUserLoggedIn = function()
{
	logged_in = Titanium.App.Properties.getString('logged_in', 'false');
	if (logged_in == 'true')
		return true;
	else
		return false;
}

/**
 * Gets the user credentials
 *
 * @author Dennis Schneider
 */
wunderlist.getUserCredentials = function()
{
	values = {
		'email': Titanium.App.Properties.getString('email', ''),
		'password': Titanium.App.Properties.getString('password', '') // encrypted !
	};

 	return values;
}

/**
 * Gets all data for the sync process
 *
 * @author Dennis Schneider
 */
wunderlist.getDataForSync = function(type, fields, where, return_object)
{
	if(type == undefined)
  		type = 'lists';

	if(return_object == undefined)
		return_object = true;

	if(fields == undefined)
		fields = '*'

    var sql  = "SELECT " + fields + " FROM " + type;

	if(where != undefined)
		sql += ' WHERE ' + where;

    var resultSet = wunderlist.query(sql);

	values = {};
	i = 0;

    while(resultSet.isValidRow())
    {
    	if(return_object)
			values[i] = {};

		if(return_object)
			for(var y = 0, max = resultSet.fieldCount(); y < max; y++)
				values[i][resultSet.fieldName(y)] = resultSet.field(y);

		if(!return_object)
			for(var y = 0, max = resultSet.fieldCount(); y < max; y++)
				values[resultSet.fieldName(y)] = resultSet.field(y);

		i++;
		resultSet.next();
	}

	return values;
}

/**
 * Gets the last done tasks
 *
 * @todo Shorten the method, it's too long
 * @author Dennis Schneider
 */
wunderlist.getLastDoneTasks = function(list_id)
{
	var sql  = "SELECT tasks.id AS task_id, tasks.name AS task_name, tasks.done, tasks.important, tasks.position, tasks.date, tasks.list_id, tasks.done_date ";
	    sql += "FROM tasks ";
	    sql += "WHERE tasks.done = 1 AND list_id = '" + list_id + "' AND tasks.deleted = 0 ";
	    sql += "ORDER BY tasks.done_date DESC";

	var resultSet = this.database.execute(sql);

    if (resultSet.rowCount() > 0)
    {
	    var doneListsTasks = [];

		while(resultSet.isValidRow())
	    {
	        var values = {};

			for (var i = 0, max = resultSet.fieldCount(); i < max; i++)
				values[resultSet.fieldName(i)] = resultSet.field(i);

			var days   = this.calculateDayDifference(values['done_date']);
			var htmlId = days.toString();

			if (wunderlist.isArray(doneListsTasks[htmlId]) == false)
				doneListsTasks[htmlId] = [];

	        doneListsTasks[htmlId].push(generateTaskHTML(values['task_id'], values['task_name'], values['list_id'], values['done'], values['important'], values['date']));

	        resultSet.next();
		}

		for(listId in doneListsTasks)
		{
			var day_string = language.data.day_ago;
			var heading    = '<h3>';

			if (listId == 0) { day_string = language.data.done_today; days_text = ''; heading = '<h3 class="head_today">'; }
			else if (listId == 1) { day_string = language.data.done_yesterday; days_text = ''; }
			else { day_string = language.data.days_ago; days_text = listId; };

			// Check for older tasks and append new div
			if (listId > 1 && ($('#older_tasks').length == 0))
				$('#content').append('<button id="older_tasks_head">' + language.data.older_tasks + '</button><div id="older_tasks"></div>');

			if ($('ul#donelist_' + listId).length == 0)
			{
				var appendHTML = heading + days_text + ' ' + day_string + '</h3><ul id="donelist_' + (listId == 0 ? 'list_today' : listId) + '" class="donelist">' + doneListsTasks[listId].join('') + '</ul>';

				if ($('#older_tasks').length == 0)
					$('#content').append(appendHTML);
				else
					$('#older_tasks').append(appendHTML);
			}
		}
	}
}

wunderlist.isArray = function(value)
{
	if (typeof value === 'object' && value && value instanceof Array)
		return true;

	return false;
}
