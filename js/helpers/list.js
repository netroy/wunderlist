var list = list || {};

/*********************************************************************/
// Functions of the list object

// INSERT a new database list object
list.insert = function() {
	return wunderlist.database.insertList();
};

// UPDATE the database list object
list.update = function(noversion) {
	wunderlist.database.updateList(noversion);
};

// SET the current list object to default
list.setDefault = function() {
	list.id        = undefined;
	list.online_id = undefined;
	list.name      = undefined;
	list.position  = undefined;
	list.deleted   = undefined;
	list.shared    = undefined;
	list.inbox     = undefined;
};

/*********************************************************************/
// SET the editable properties of a list object
list.properties = ['online_id', 'name', 'position', 'deleted', 'shared'];

// Initial call to undefine the list properties
list.setDefault();